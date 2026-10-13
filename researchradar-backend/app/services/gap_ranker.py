from typing import Literal, Tuple


def calculate_priority(
    evidence: float,
    impact: float,
    feasibility: float,
) -> int:
    """
    Computes priority score using transparent formula:
    S = 0.40*E + 0.35*I + 0.25*F
    Clamped strictly between 0 and 100.
    """
    e_clamped = max(0.0, min(100.0, float(evidence)))
    i_clamped = max(0.0, min(100.0, float(impact)))
    f_clamped = max(0.0, min(100.0, float(feasibility)))

    score = 0.40 * e_clamped + 0.35 * i_clamped + 0.25 * f_clamped
    return round(max(0, min(100, score)))


def priority_label(score: int) -> Literal["high", "medium", "low"]:
    """Categorizes priority score into transparent tiers."""
    if score >= 75:
        return "high"
    if score >= 50:
        return "medium"
    return "low"


def compute_evidence_score(
    verified_passages: int,
    total_supporting_papers: int,
    corpus_size: int,
) -> float:
    """
    Calculates evidence score based on verified passages and paper breadth.
    """
    if verified_passages == 0:
        return 20.0  # minimal baseline if paper referenced but quote not verified in abstract
    
    # Base from verified passages (up to 60 points)
    passage_points = min(60.0, verified_passages * 30.0)
    
    # Breadth points from supporting papers (up to 40 points)
    paper_points = min(40.0, total_supporting_papers * 20.0)
    
    return min(100.0, passage_points + paper_points)


def generate_score_explanation(
    score: int,
    evidence: float,
    impact: float,
    feasibility: float,
    verified_passages_count: int,
) -> str:
    """
    Produces transparent human-readable explanation of how the score was calculated.
    """
    return (
        f"Score {score}/100 computed via transparent heuristic: "
        f"Evidence Support ({evidence:.0f}/100, weight 40%), "
        f"Potential Impact ({impact:.0f}/100, weight 35%), and "
        f"Feasibility ({feasibility:.0f}/100, weight 25%). "
        f"{verified_passages_count} source passage(s) were verified directly against retrieved abstracts. "
        "This score is a prioritization heuristic, not a guarantee of experimental success."
    )
