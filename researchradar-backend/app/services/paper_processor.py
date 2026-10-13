import re
from app.config import get_settings

settings = get_settings()


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value).strip()


def process_papers(records: list[dict]) -> list[dict]:
    papers = []
    seen = set()

    for record in records:
        title = normalize_text(record.get("title"))
        abstract = normalize_text(record.get("abstractText"))

        if not title or not abstract:
            continue

        identifier = (
            record.get("doi")
            or record.get("pmid")
            or record.get("id")
            or title.lower()
        )
        identifier = str(identifier).lower()

        if identifier in seen:
            continue
        seen.add(identifier)

        doi = record.get("doi")
        pmid = record.get("pmid")

        source_url = (
            f"https://doi.org/{doi}"
            if doi
            else (
                f"https://europepmc.org/article/MED/{pmid}"
                if pmid
                else (
                    "https://europepmc.org/search"
                    "?query=" + title
                )
            )
        )

        author_string = record.get("authorString") or ""
        authors = [
            author.strip()
            for author in author_string.split(",")
            if author.strip()
        ]

        papers.append({
            "id": f"P{len(papers) + 1}",
            "title": title,
            "authors": authors,
            "year": record.get("pubYear"),
            "abstract": abstract[
                :settings.max_abstract_chars
            ],
            "doi": doi,
            "pmid": pmid,
            "source_url": source_url,
            "source": "Europe PMC",
            "publication_type": record.get("pubType"),
        })

    return papers
