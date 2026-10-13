import pytest
from app.services.gap_ranker import (
    calculate_priority,
    priority_label,
    compute_evidence_score,
    generate_score_explanation,
)


def test_calculate_priority_formula():
    # 0.40*80 + 0.35*70 + 0.25*60 = 32 + 24.5 + 15 = 71.5 -> round to 72
    score = calculate_priority(evidence=80, impact=70, feasibility=60)
    assert score == 72


def test_calculate_priority_boundaries():
    assert calculate_priority(evidence=150, impact=200, feasibility=300) == 100
    assert calculate_priority(evidence=-50, impact=-10, feasibility=0) == 0


def test_priority_label_thresholds():
    assert priority_label(75) == "high"
    assert priority_label(85) == "high"
    assert priority_label(74) == "medium"
    assert priority_label(50) == "medium"
    assert priority_label(49) == "low"
    assert priority_label(10) == "low"


def test_evidence_score_computation():
    score_zero = compute_evidence_score(verified_passages=0, total_supporting_papers=0, corpus_size=10)
    assert score_zero == 20.0

    score_verified = compute_evidence_score(verified_passages=2, total_supporting_papers=2, corpus_size=10)
    # min(60, 2*30) + min(40, 2*20) = 60 + 40 = 100.0
    assert score_verified == 100.0


def test_score_explanation_transparency():
    explanation = generate_score_explanation(
        score=75,
        evidence=80,
        impact=75,
        feasibility=70,
        verified_passages_count=2,
    )
    assert "75/100" in explanation
    assert "40%" in explanation
    assert "35%" in explanation
    assert "25%" in explanation
    assert "2 source passage(s) were verified" in explanation
