def calculate_priority(
    evidence: float,
    impact: float,
    feasibility: float,
) -> int:
    score = (
        0.40 * evidence
        + 0.35 * impact
        + 0.25 * feasibility
    )
    return round(max(0, min(100, score)))


def priority_label(score: int) -> str:
    if score >= 75:
        return "high"
    if score >= 50:
        return "medium"
    return "low"
