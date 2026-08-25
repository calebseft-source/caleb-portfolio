"""Small, dependency-light checks for the static cfwebdev site."""

from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import unquote, urlparse

from lxml import html


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
INDEX = DOCS / "index.html"
PAGES = (INDEX, DOCS / "concepts" / "cypressline.html")


def main() -> int:
    errors: list[str] = []
    reports: list[dict[str, object]] = []

    for page in PAGES:
        label = page.relative_to(DOCS).as_posix()
        tree = html.fromstring(page.read_text(encoding="utf-8"))
        page_errors: list[str] = []

        ids = tree.xpath("//*[@id]/@id")
        duplicates = sorted({value for value in ids if ids.count(value) > 1})
        if duplicates:
            page_errors.append(f"Duplicate ids: {', '.join(duplicates)}")

        headings = [" ".join(node.text_content().split()) for node in tree.xpath("//h1")]
        if len(headings) != 1:
            page_errors.append(f"Expected one h1, found {len(headings)}")

        for anchor in tree.xpath("//a[starts-with(@href, '#')]/@href"):
            target_id = unquote(anchor[1:])
            if target_id and target_id not in ids:
                page_errors.append(f"Missing anchor target: {anchor}")

        for node in tree.xpath("//*[@src or @href]"):
            attr = "src" if node.get("src") else "href"
            value = node.get(attr, "")
            parsed = urlparse(value)
            if not value or value.startswith(("#", "mailto:", "tel:", "data:")):
                continue
            if parsed.scheme or parsed.netloc:
                continue

            path = unquote(parsed.path)
            if path == "/":
                target = INDEX
            elif path.startswith("/"):
                target = DOCS / path.lstrip("/")
            else:
                target = page.parent / path

            if not target.exists():
                page_errors.append(f"Missing local reference: {value}")

        for image in tree.xpath("//img"):
            if not (image.get("alt") or "").strip():
                page_errors.append(
                    f"Image missing useful alt text: {image.get('src', '<unknown>')}"
                )

        required_meta = {
            "description": tree.xpath("string(//meta[@name='description']/@content)"),
            "canonical": tree.xpath("string(//link[@rel='canonical']/@href)"),
            "og:title": tree.xpath("string(//meta[@property='og:title']/@content)"),
            "og:image": tree.xpath("string(//meta[@property='og:image']/@content)"),
        }
        for meta_label, value in required_meta.items():
            if not value.strip():
                page_errors.append(f"Missing metadata: {meta_label}")

        for node in tree.xpath("//script[@type='application/ld+json']"):
            try:
                json.loads(node.text or "")
            except json.JSONDecodeError as exc:
                page_errors.append(f"Invalid JSON-LD: {exc}")

        errors.extend(f"{label}: {message}" for message in page_errors)
        reports.append(
            {
                "page": label,
                "h1": headings,
                "ids": len(ids),
                "images": len(tree.xpath("//img")),
                "internal_links": len(tree.xpath("//a[starts-with(@href, '#')]")),
                "errors": page_errors,
            }
        )

    for stylesheet in (DOCS / "styles.css", DOCS / "concepts" / "cypressline.css"):
        css = stylesheet.read_text(encoding="utf-8")
        if css.count("{") != css.count("}"):
            errors.append(f"{stylesheet.relative_to(DOCS).as_posix()}: Unbalanced CSS braces")

    report = {"pages": reports, "errors": errors}
    print(json.dumps(report, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
