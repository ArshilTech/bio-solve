from typing import Any
from app.schemas.graph import GraphNode, GraphEdge, GraphResponse


def build_evidence_graph(analysis_data: dict[str, Any]) -> GraphResponse:
    analysis_id = analysis_data.get("analysis_id", "")
    papers = analysis_data.get("papers", [])
    gaps = analysis_data.get("gaps", [])

    nodes: list[GraphNode] = []
    node_ids: set[str] = set()

    for p in papers:
        pid = p.get("id")
        if pid and pid not in node_ids:
            nodes.append(
                GraphNode(
                    id=pid,
                    type="paper",
                    label=p.get("title", f"Paper {pid}"),
                    data={
                        "year": p.get("year") or p.get("publication_year"),
                        "doi": p.get("doi"),
                        "source": p.get("source"),
                        "authors": p.get("authors", []),
                        "source_url": p.get("source_url"),
                    },
                )
            )
            node_ids.add(pid)

    for g in gaps:
        gid = g.get("id")
        if gid and gid not in node_ids:
            nodes.append(
                GraphNode(
                    id=gid,
                    type="gap",
                    label=g.get("title", f"Research Gap {gid}"),
                    data={
                        "priority": g.get("priority"),
                        "priority_score": g.get("priority_score"),
                        "evidence_strength": g.get("evidence_strength"),
                        "next_research_question": g.get("next_research_question"),
                    },
                )
            )
            node_ids.add(gid)

    edges: list[GraphEdge] = []
    seen_edges: set[tuple[str, str]] = set()

    for g in gaps:
        gid = g.get("id")
        if not gid or gid not in node_ids:
            continue

        verified_source_ids = set()
        for ev in g.get("evidence", []):
            if ev.get("verified", False) and ev.get("paper_id"):
                verified_source_ids.add(ev["paper_id"])

        # Fallback to confirmed supporting_paper_ids if any
        if not verified_source_ids:
            for pid in g.get("supporting_paper_ids", []):
                if pid in node_ids:
                    verified_source_ids.add(pid)

        for pid in verified_source_ids:
            if pid in node_ids and (pid, gid) not in seen_edges:
                edges.append(
                    GraphEdge(
                        source=pid,
                        target=gid,
                        type="supports",
                    )
                )
                seen_edges.add((pid, gid))

    return GraphResponse(
        analysis_id=analysis_id,
        nodes=nodes,
        edges=edges,
    )
