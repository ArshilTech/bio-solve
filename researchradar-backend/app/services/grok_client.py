from openai import AsyncOpenAI
from app.config import get_settings

settings = get_settings()

client = AsyncOpenAI(
    api_key=settings.xai_api_key,
    base_url=settings.xai_base_url,
    timeout=45.0,
    max_retries=1,
)


async def ask_grok(
    system_prompt: str,
    user_prompt: str,
) -> str:
    response = await client.chat.completions.create(
        model=settings.xai_model,
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        temperature=0.2,
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError("Grok returned an empty response")

    return content
