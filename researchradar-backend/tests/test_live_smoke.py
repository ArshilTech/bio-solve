import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.mark.live
def test_live_end_to_end_analysis():
    """
    Live smoke test against real Europe PMC and configured live AI model.
    """
    # 1. Search Europe PMC live
    search_res = client.get("/api/search?q=biosensors%20water%20contamination&limit=3")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["total_returned"] >= 1
    assert len(search_data["papers"]) >= 1

    # 2. Live analyze question
    analyze_res = client.post(
        "/api/analyze",
        json={
            "question": "Can low-cost biosensors reliably detect water contamination in rural communities?",
            "max_papers": 5,
        },
    )
    assert analyze_res.status_code == 200
    analyze_data = analyze_res.json()

    analysis_id = analyze_data["analysis_id"]
    assert analysis_id is not None
    assert analyze_data["papers_analyzed"] >= 1
    assert len(analyze_data["gaps"]) >= 1

    gap = analyze_data["gaps"][0]
    gap_id = gap["id"]
    assert "priority_score" in gap
    assert "evidence_strength" in gap

    # 3. Live graph endpoint
    graph_res = client.get(f"/api/graph/{analysis_id}")
    assert graph_res.status_code == 200
    graph_data = graph_res.json()
    assert len(graph_data["nodes"]) >= 2

    # 4. Live experiment proposal
    exp_res = client.post(
        "/api/experiments",
        json={"analysis_id": analysis_id, "gap_id": gap_id},
    )
    assert exp_res.status_code == 200
    exp_data = exp_res.json()
    assert "hypothesis" in exp_data["experiment"]
    assert "samples_and_conditions" in exp_data["experiment"]

    # 5. Security check: Ensure no API key or token leaked into response JSON
    full_text = analyze_res.text + graph_res.text + exp_res.text
    assert "gsk_" not in full_text
    assert "xai-" not in full_text
