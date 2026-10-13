import json
import re
from typing import Any, Optional
from openai import AsyncOpenAI
import httpx

from app.config import get_settings
from app.utils.errors import AIAnalysisError
from app.utils.logging import logger

settings = get_settings()


def get_ai_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=settings.xai_api_key.get_secret_value(),
        base_url=settings.resolved_base_url,
        timeout=httpx.Timeout(settings.request_timeout_seconds + 20.0),
        max_retries=2,
    )


def extract_json_block(text: str) -> str:
    """Extract JSON from potential markdown formatting or text wrappers."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    start_brace = text.find("{")
    start_bracket = text.find("[")
    
    if start_brace != -1 and (start_bracket == -1 or start_brace < start_bracket):
        end_brace = text.rfind("}")
        if end_brace != -1 and end_brace > start_brace:
            return text[start_brace : end_brace + 1]
    elif start_bracket != -1:
        end_bracket = text.rfind("]")
        if end_bracket != -1 and end_bracket > start_bracket:
            return text[start_bracket : end_bracket + 1]

    return text


async def ask_grok_structured(
    system_prompt: str,
    user_prompt: str,
    client: Optional[AsyncOpenAI] = None,
) -> dict[str, Any]:
    """
    Query the AI model and safely parse the JSON response.
    Includes at most one bounded repair attempt if initial parsing fails.
    """
    ai_client = client or get_ai_client()

    try:
        response = await ai_client.chat.completions.create(
            model=settings.xai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
        )
    except Exception as exc:
        logger.error("AI service completion call failed: %s", type(exc).__name__)
        raise AIAnalysisError(f"AI service request failed: {type(exc).__name__}") from exc

    raw_content = response.choices[0].message.content or ""
    if not raw_content.strip():
        raise AIAnalysisError("AI service returned an empty response.")

    cleaned_json = extract_json_block(raw_content)

    try:
        return json.loads(cleaned_json)
    except json.JSONDecodeError as json_err:
        logger.warning("First JSON parse attempt failed. Initiating bounded repair attempt.")
        
        # Bounded 1-attempt repair
        repair_prompt = (
            "The following output was supposed to be valid JSON but contained a syntax error. "
            "Please output ONLY valid, RFC 8259 compliant JSON with no markdown and no explanations:\n\n"
            + raw_content[:4000]
        )
        try:
            repair_resp = await ai_client.chat.completions.create(
                model=settings.xai_model,
                messages=[
                    {"role": "system", "content": "You are a strict JSON syntax validator. Output valid JSON only."},
                    {"role": "user", "content": repair_prompt},
                ],
                temperature=0.0,
            )
            repair_content = repair_resp.choices[0].message.content or ""
            repaired_json = extract_json_block(repair_content)
            return json.loads(repaired_json)
        except Exception as repair_err:
            logger.error("JSON repair attempt failed: %s", str(repair_err))
            raise AIAnalysisError("Model response could not be parsed into valid JSON structure.") from json_err
