import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


MOCK_EUROPE_PMC_RECORDS = [
    {
        "id": "PMC8001",
        "title": "Field Testing of Electrochemical Water Biosensors in Rural Communities",
        "abstractText": "Electrochemical biosensors showed high selectivity for Escherichia coli in rural well water samples. However, long-term matrix fouling reduced sensitivity after 14 days of continuous deployment.",
        "doi": "10.1016/j.envres.2023.01",
        "pubYear": "2023",
        "authorString": "Patel R, Sharma M",
        "pubType": "Journal Article",
    },
    {
        "id": "PMC8002",
        "title": "Microfluidic Optical Biosensors for Heavy Metal Contamination",
        "abstractText": "We developed a portable microfluidic sensor for arsenic ions. Natural organic matter interfered with fluorescence quenching in river water matrices.",
        "doi": "10.1016/j.bios.2023.02",
        "pubYear": "2024",
        "authorString": "Chen H, Gomez L",
        "pubType": "Journal Article",
    },
]

MOCK_GROK_GAP_RESPONSE = {
    "gaps": [
        {
            "title": "Biofouling in Continuous Rural Field Deployments",
            "description": "Continuous deployment leads to severe biofouling and signal drift in untreated water.",
            "why_it_matters": "Prevents autonomous environmental monitoring without frequent manual recalibration.",
            "supporting_paper_ids": ["P1"],
            "evidence": [
                {
                    "paper_id": "P1",
                    "passage": "long-term matrix fouling reduced sensitivity after 14 days of continuous deployment.",
                }
            ],
            "limitations": ["Tested only in well water, not industrial runoff."],
            "next_research_question": "How can antifouling zwitterionic coatings extend biosensor uptime in rural well waters?",
            "impact_score": 85,
            "feasibility_score": 80,
        }
    ]
}

MOCK_GROK_EXPERIMENT_RESPONSE = {
    "research_question": "How can antifouling zwitterionic coatings extend biosensor uptime in rural well waters?",
    "hypothesis": "Zwitterionic surface modification will reduce signal drift by over 50% across 30-day exposure.",
    "study_design": "Split-sample continuous flow validation across 30 days comparing coated vs. uncoated electrodes.",
    "sample_groups": "Spiked ground water (n=10) and natural rural well water (n=10).",
    "experimental_conditions": "Temperature 15-25C, pH 6.8-7.8, turbidity 5-20 NTU.",
    "samples_and_conditions": "Ground water and natural well water samples subjected to continuous ambient temperature flow.",
    "measurements": "Daily impedance spectroscopy and reference CFU culturing standard.",
    "controls": "Deionized water control blanks and uncoated baseline sensor controls.",
    "analysis_method": "Bland-Altman concordance and paired t-tests for drift slope comparison.",
    "safety_considerations": "Biosafety Level 1 handling; non-potable experimental effluent autoclaving.",
    "limitations": "Does not assess extreme turbidity above 50 NTU.",
}


def test_search_endpoint_with_mock():
    with patch("app.api.search.search_europe_pmc", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = (MOCK_EUROPE_PMC_RECORDS, [])

        response = client.get("/api/search?q=biosensors%20water&limit=10")
        assert response.status_code == 200
        data = response.json()
        assert data["total_returned"] == 2
        assert len(data["papers"]) == 2
        assert data["papers"][0]["id"] == "P1"
        assert data["papers"][0]["year"] == 2023


def test_search_endpoint_invalid_query():
    # Query less than 3 chars should fail validation
    response = client.get("/api/search?q=a")
    assert response.status_code == 422


def test_analyze_endpoint_invalid_request():
    # Question less than 10 chars
    response = client.post("/api/analyze", json={"question": "short", "max_papers": 10})
    assert response.status_code == 422


def test_full_analysis_workflow_mocked():
    with patch("app.services.gap_analyzer.search_europe_pmc", new_callable=AsyncMock) as mock_search, \
         patch("app.services.gap_analyzer.ask_grok_structured", new_callable=AsyncMock) as mock_grok, \
         patch("app.services.experiment_generator.ask_grok_structured", new_callable=AsyncMock) as mock_exp_grok:

        mock_search.return_value = (MOCK_EUROPE_PMC_RECORDS, [])
        mock_grok.return_value = MOCK_GROK_GAP_RESPONSE
        mock_exp_grok.return_value = MOCK_GROK_EXPERIMENT_RESPONSE

        # 1. POST /api/analyze
        analyze_resp = client.post(
            "/api/analyze",
            json={"question": "Can low-cost biosensors detect water contamination?", "max_papers": 10},
        )
        assert analyze_resp.status_code == 200
        data = analyze_resp.json()

        analysis_id = data["analysis_id"]
        assert analysis_id is not None
        assert data["papers_analyzed"] == 2
        assert len(data["papers"]) == 2
        assert len(data["gaps"]) == 1

        gap = data["gaps"][0]
        assert gap["id"] == "G1"
        assert gap["priority"] in ["high", "medium", "low"]
        assert gap["priority_score"] >= 0 and gap["priority_score"] <= 100
        assert gap["evidence_strength"] == "moderate"
        assert gap["evidence"][0]["verified"] is True

        # Frontend compatibility checks
        assert "year" in data["papers"][0]
        assert "id" in data["papers"][0]
        assert "why_it_matters" in gap

        # 2. GET /api/gaps/{gap_id}
        gap_resp = client.get(f"/api/gaps/G1?analysis_id={analysis_id}")
        assert gap_resp.status_code == 200
        gap_data = gap_resp.json()
        assert gap_data["gap"]["id"] == "G1"
        assert len(gap_data["supporting_papers"]) == 1

        # Missing gap -> 404
        gap_404 = client.get(f"/api/gaps/G999?analysis_id={analysis_id}")
        assert gap_404.status_code == 404

        # 3. GET /api/graph/{analysis_id}
        graph_resp = client.get(f"/api/graph/{analysis_id}")
        assert graph_resp.status_code == 200
        graph_data = graph_resp.json()
        assert graph_data["analysis_id"] == analysis_id
        node_ids = {n["id"] for n in graph_data["nodes"]}
        assert "P1" in node_ids
        assert "G1" in node_ids
        assert len(graph_data["edges"]) >= 1
        assert graph_data["edges"][0]["source"] == "P1"
        assert graph_data["edges"][0]["target"] == "G1"

        # Missing graph -> 404
        graph_404 = client.get("/api/graph/non-existent-uuid")
        assert graph_404.status_code == 404

        # 4. POST /api/experiments
        exp_resp = client.post(
            "/api/experiments",
            json={"analysis_id": analysis_id, "gap_id": "G1"},
        )
        assert exp_resp.status_code == 200
        exp_data = exp_resp.json()
        assert exp_data["analysis_id"] == analysis_id
        assert exp_data["gap_id"] == "G1"
        assert "hypothesis" in exp_data["experiment"]
        assert "samples_and_conditions" in exp_data["experiment"]
        assert "safety_considerations" in exp_data["experiment"]


def test_ai_failure_handling():
    with patch("app.services.gap_analyzer.search_europe_pmc", new_callable=AsyncMock) as mock_search, \
         patch("app.services.gap_analyzer.ask_grok_structured", new_callable=AsyncMock) as mock_grok:

        mock_search.return_value = (MOCK_EUROPE_PMC_RECORDS, [])
        mock_grok.side_effect = RuntimeError("AI service unavailable")

        response = client.post(
            "/api/analyze",
            json={"question": "Can biosensors detect water contamination?", "max_papers": 10},
        )
        assert response.status_code == 502
        assert "failed" in response.json()["detail"].lower()
