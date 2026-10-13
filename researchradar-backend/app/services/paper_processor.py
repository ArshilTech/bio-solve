import re
from typing import Optional
from app.config import get_settings
from app.schemas.papers import Paper

settings = get_settings()


def normalize_text(value: Optional[str]) -> str:
    if not value:
        return ""
    # Strip HTML tags if present (e.g. <i>, <b> in Europe PMC abstracts)
    cleaned = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", cleaned).strip()


def process_papers(records: list[dict]) -> list[Paper]:
    papers: list[Paper] = []
    seen_identifiers: set[str] = set()

    for record in records:
        title = normalize_text(record.get("title"))
        abstract = normalize_text(record.get("abstractText"))

        if not title or not abstract:
            continue

        doi = record.get("doi")
        pmid = record.get("pmid")
        pmcid = record.get("pmcid")
        raw_id = record.get("id")

        # Stable identifier check for deduplication
        dedup_key = (
            f"doi:{doi.lower().strip()}"
            if doi
            else (
                f"pmid:{pmid.strip()}"
                if pmid
                else (
                    f"id:{raw_id.strip()}"
                    if raw_id
                    else f"title:{title.lower()}"
                )
            )
        )

        if dedup_key in seen_identifiers:
            continue
        seen_identifiers.add(dedup_key)

        # Source URL
        source_url = (
            f"https://doi.org/{doi}"
            if doi
            else (
                f"https://europepmc.org/article/MED/{pmid}"
                if pmid
                else (
                    f"https://europepmc.org/article/PMC/{pmcid}"
                    if pmcid
                    else f"https://europepmc.org/search?query={title}"
                )
            )
        )

        # Author parsing
        author_string = record.get("authorString") or ""
        if author_string:
            authors = [
                author.strip()
                for author in author_string.split(",")
                if author.strip()
            ]
        else:
            authors = []

        year_val = record.get("pubYear")
        pub_year = None
        if year_val:
            try:
                pub_year = int(str(year_val).strip())
            except ValueError:
                pub_year = str(year_val).strip()

        paper_id = f"P{len(papers) + 1}"

        paper_obj = Paper(
            id=paper_id,
            paper_id=paper_id,
            source="Europe PMC",
            source_id=str(raw_id) if raw_id else (pmid or doi),
            title=title,
            authors=authors,
            publication_year=pub_year,
            year=pub_year,
            doi=doi,
            pmid=pmid,
            pmcid=pmcid,
            abstract=abstract[: settings.max_abstract_chars],
            source_url=source_url,
            publication_type=record.get("pubType"),
        )
        papers.append(paper_obj)

    return papers
