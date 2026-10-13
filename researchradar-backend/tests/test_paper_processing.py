import pytest
from app.services.paper_processor import process_papers, normalize_text


def test_normalize_text():
    raw = "  <b>Electrochemical</b>  Biosensors \n for <i>Water</i> Monitoring.  "
    cleaned = normalize_text(raw)
    assert cleaned == "Electrochemical Biosensors for Water Monitoring."


def test_process_papers_deduplication():
    records = [
        {
            "id": "1001",
            "title": "Novel Biosensor for Arsenic Detection in Groundwater",
            "abstractText": "This paper demonstrates a field-deployable biosensor.",
            "doi": "10.1016/j.bios.2023.01",
            "pubYear": "2023",
            "authorString": "Smith J, Doe A",
        },
        {
            # Exact duplicate DOI
            "id": "1002",
            "title": "Duplicate: Novel Biosensor for Arsenic Detection in Groundwater",
            "abstractText": "Different text but same DOI.",
            "doi": "10.1016/j.bios.2023.01",
            "pubYear": "2023",
        },
        {
            # Different record
            "id": "1003",
            "title": "Colorimetric Aptasensor for Heavy Metals in River Water",
            "abstractText": "Colorimetric assays provide rapid on-site testing.",
            "doi": "10.1016/j.bios.2023.02",
            "pubYear": "2024",
            "authorString": "Lee C, Wang X",
        },
    ]

    papers = process_papers(records)
    assert len(papers) == 2
    assert papers[0].id == "P1"
    assert papers[0].paper_id == "P1"
    assert papers[0].year == 2023
    assert papers[0].publication_year == 2023
    assert papers[0].authors == ["Smith J", "Doe A"]
    assert papers[1].id == "P2"
    assert papers[1].doi == "10.1016/j.bios.2023.02"


def test_process_papers_skips_missing_abstract_or_title():
    records = [
        {"id": "2001", "title": "Missing abstract paper", "abstractText": ""},
        {"id": "2002", "title": "", "abstractText": "Has abstract but no title."},
        {"id": "2003", "title": "Valid Title", "abstractText": "Valid abstract content."},
    ]
    papers = process_papers(records)
    assert len(papers) == 1
    assert papers[0].title == "Valid Title"
