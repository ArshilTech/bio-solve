from typing import Any
from app.repositories.analysis_repository import get_analysis, save_experiment, get_experiment
from app.schemas.experiments import ExperimentProposal, ExperimentResponse
from app.services.grok_client import ask_grok_structured
from app.utils.errors import ResourceNotFoundError, AIAnalysisError
from app.utils.logging import logger

EXPERIMENT_SYSTEM_PROMPT = """You are ResearchRadar AI, an expert bio-experimental protocol designer and water-quality research scientist.
Your role is to propose a rigorous, evidence-grounded follow-up experimental study plan to address a specific scientific research gap in water contamination, biosensors, or environmental monitoring.

CRITICAL PROTOCOL RULES:
1. Ground the study strictly in the provided candidate gap and referenced literature.
2. Provide a realistic comparative design comparing candidate/low-cost biosensors against gold-standard laboratory reference methods (e.g. ICP-MS, HPLC, or standard membrane filtration microbial assays).
3. Specify concrete sample matrices (e.g. spiked deionized water, groundwater, municipal tap, river surface water with varying turbidity and natural organic matter).
4. Emphasize controls, calibration drifts, and interference testing (e.g. heavy metal co-ions, salinity, pH 5.5-8.5).
5. State explicit safety caveats: Uncertified biosensors must never be used for final potable water clearance without accredited laboratory corroboration.
6. Mark all suggestions as model-proposed hypotheses requiring expert pilot testing.

OUTPUT FORMAT:
Respond with a JSON object adhering to this schema:
{
  "research_question": "Exact focused question for the study",
  "hypothesis": "Testable hypothesis with expected directional outcome",
  "study_design": "Comprehensive study architecture (e.g. multi-site blind comparative validation)",
  "sample_groups": "Sample categories and replicates (n=...)",
  "experimental_conditions": "Controlled environmental stress parameters (temperature, pH, turbidity)",
  "samples_and_conditions": "Synthesized description of tested samples, matrix conditions, and replication scheme",
  "measurements": "Key response metrics and reference analytical instruments",
  "controls": "Positive controls, negative blanks, and calibration standards",
  "analysis_method": "Statistical concordance analysis (e.g. Bland-Altman, Pearson r, LOD calculation)",
  "safety_considerations": "Biosafety handling protocols, chemical waste disposal, and clear potable water disclaimer",
  "limitations": "Expected study constraints and edge-case interferences"
}
"""


def stringify_field(val: Any, default: str = "") -> str:
    if not val:
        return default
    if isinstance(val, str):
        return val.strip()
    if isinstance(val, list):
        return "\n".join(f"- {stringify_field(item)}" for item in val if item)
    if isinstance(val, dict):
        return "\n".join(f"{k.replace('_', ' ').title()}: {stringify_field(v)}" for k, v in val.items() if v)
    return str(val).strip()


async def generate_experiment_proposal(analysis_id: str, gap_id: str) -> ExperimentResponse:
    # 1. Check if proposal already generated and cached
    cached = get_experiment(analysis_id, gap_id)
    if cached:
        logger.info("Returning cached experiment proposal for %s/%s", analysis_id, gap_id)
        return ExperimentResponse(
            analysis_id=analysis_id,
            gap_id=gap_id,
            experiment=ExperimentProposal(**cached),
        )

    # 2. Retrieve analysis and target gap
    analysis = get_analysis(analysis_id)
    if not analysis:
        raise ResourceNotFoundError(f"Analysis '{analysis_id}' not found.")

    target_gap = None
    for gap in analysis.get("gaps", []):
        if gap.get("id") == gap_id:
            target_gap = gap
            break

    if not target_gap:
        raise ResourceNotFoundError(f"Gap '{gap_id}' not found in analysis '{analysis_id}'.")

    # 3. Retrieve relevant papers for context
    papers_map = {p.get("id"): p for p in analysis.get("papers", [])}
    supporting_papers_context = []
    for pid in target_gap.get("supporting_paper_ids", []):
        if pid in papers_map:
            p = papers_map[pid]
            supporting_papers_context.append(f"[{pid}] {p.get('title')}: {p.get('abstract', '')[:400]}")

    context_prompt = (
        f"CANDIDATE GAP TITLE:\n{target_gap.get('title')}\n\n"
        f"DESCRIPTION:\n{target_gap.get('description')}\n\n"
        f"WHY IT MATTERS:\n{target_gap.get('why_it_matters')}\n\n"
        f"PROPOSED NEXT RESEARCH QUESTION:\n{target_gap.get('next_research_question')}\n\n"
        f"KNOWN CURRENT LIMITATIONS:\n" + "\n".join(f"- {lim}" for lim in target_gap.get("limitations", [])) + "\n\n"
        f"SUPPORTING CORPUS PAPERS:\n" + ("\n".join(supporting_papers_context) if supporting_papers_context else "General corpus context") + "\n\n"
        "Please design a structured experimental proposal to evaluate this gap."
    )

    # 4. Generate structured proposal
    ai_resp = await ask_grok_structured(
        system_prompt=EXPERIMENT_SYSTEM_PROMPT,
        user_prompt=context_prompt,
    )

    samples_and_conditions = stringify_field(ai_resp.get("samples_and_conditions"))
    if not samples_and_conditions:
        sg = stringify_field(ai_resp.get("sample_groups"), "Natural and spiked water matrices")
        ec = stringify_field(ai_resp.get("experimental_conditions"), "Variable pH, temperature, and turbidity")
        samples_and_conditions = f"{sg}. Environmental conditions: {ec}."

    proposal = ExperimentProposal(
        research_question=stringify_field(ai_resp.get("research_question"), target_gap.get("next_research_question", "Proposed investigation")),
        hypothesis=stringify_field(ai_resp.get("hypothesis"), "The biosensing mechanism will maintain fidelity within defined environmental tolerance bounds."),
        study_design=stringify_field(ai_resp.get("study_design"), "Controlled split-sample laboratory-to-field validation comparing biosensor responses to gold-standard instrumentation."),
        sample_groups=stringify_field(ai_resp.get("sample_groups"), "Replicate test water samples across varying pollutant concentrations."),
        experimental_conditions=stringify_field(ai_resp.get("experimental_conditions"), "Temperature (10-35 C), pH (6.0-8.5), and turbidity (1-50 NTU)."),
        samples_and_conditions=samples_and_conditions,
        measurements=stringify_field(ai_resp.get("measurements"), "Electrochemical or optical sensor signal versus reference analytical standard measurements."),
        controls=stringify_field(ai_resp.get("controls"), "Deionized water negative blanks and certified analytical chemical standard positive spikes."),
        analysis_method=stringify_field(ai_resp.get("analysis_method"), "Bland-Altman difference analysis, limit of detection (LOD) verification, and regression metrics."),
        safety_considerations=stringify_field(ai_resp.get("safety_considerations"), "Prototype sensors must not be deployed for unverified potable water safety decisions without accredited lab testing."),
        limitations=stringify_field(ai_resp.get("limitations"), "Matrix complexity in field waters may introduce uncharacterized optical or chemical fouling."),
        supporting_paper_ids=target_gap.get("supporting_paper_ids", []),
        warnings=[
            "Proposed study plan is generated by AI assistance and requires domain expert review before laboratory execution.",
            "Field sensor readings should always be corroborated by validated reference analytical methods.",
        ],
    )

    # 5. Persist proposal
    save_experiment(analysis_id, gap_id, proposal.model_dump())

    return ExperimentResponse(
        analysis_id=analysis_id,
        gap_id=gap_id,
        experiment=proposal,
    )
