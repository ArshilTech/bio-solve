import pytest
from app.schemas.papers import Paper
from app.services.evidence_validator import verify_evidence_passages


def test_verify_evidence_exact_and_fuzzy_match():
    paper = Paper(
        id="P1",
        title="Field Portable Biosensors for Drinking Water Quality",
        abstract="Electrochemical biosensors showed high sensitivity for detecting lead ions in contaminated municipal tap water under ambient field temperatures.",
    )
    papers_map = {"P1": paper}

    evidence_items = [
        {
            "paper_id": "P1",
            "passage": "Electrochemical biosensors showed high sensitivity for detecting lead ions",
        },
        {
            "paper_id": "P1",
            "passage": "Synthetic quantum dots demonstrated 99% accuracy in lunar soil samples.",
        },
        {
            "paper_id": "P99",  # Non-existent paper ID
            "passage": "Some passage from unknown paper.",
        },
    ]

    verified_items, valid_pids, warnings = verify_evidence_passages(evidence_items, papers_map)

    assert len(verified_items) == 3
    # First item verified
    assert verified_items[0].verified is True
    assert verified_items[0].verification_status == "verified"
    assert "P1" in valid_pids

    # Second item hallucinated passage
    assert verified_items[1].verified is False
    assert verified_items[1].verification_status == "unverified"

    # Third item invalid paper ID
    assert verified_items[2].verified is False
    assert "P99" not in valid_pids
    assert any("P99" in w for w in warnings)
