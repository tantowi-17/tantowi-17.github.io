#!/usr/bin/env python3
"""Convert the Medium RSS feed into data/articles.json for the Writing section.

Usage:
    python3 scripts/fetch_medium.py            # fetch from Medium
    python3 scripts/fetch_medium.py feed.xml   # read a saved feed file

Standard library only, so it runs on a bare GitHub Actions runner.
"""
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

FEED_URL = "https://medium.com/feed/@tantowi17"
OUTPUT = Path(__file__).resolve().parent.parent / "data" / "articles.json"
MAX_ITEMS = 9
EXCERPT_LEN = 160
BLOCK_TAGS = {"p", "h1", "h2", "h3", "h4", "li", "blockquote", "figcaption", "pre", "div", "br"}
CONTENT_NS = "{http://purl.org/rss/1.0/modules/content/}encoded"


class _Extractor(HTMLParser):
    """Collect plain text and the first image from an article's HTML."""

    def __init__(self):
        super().__init__()
        self.text = []
        self.image = ""

    def handle_starttag(self, tag, attrs):
        if tag == "img" and not self.image:
            src = dict(attrs).get("src") or ""
            # Skip Medium's 1x1 tracking pixel
            if src.startswith("https://") and "/_/stat" not in src:
                self.image = src

    def handle_endtag(self, tag):
        # Keep words from adjacent blocks (heading + paragraph) apart
        if tag in BLOCK_TAGS:
            self.text.append(" ")

    def handle_data(self, data):
        self.text.append(data)


def clean_link(url):
    """Drop Medium's ?source=rss tracking query."""
    parts = urlsplit(url)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, "", ""))


def excerpt(text, title=""):
    text = re.sub(r"\s+", " ", unescape(text)).strip()
    # Many posts open by repeating the title as a heading
    # (compared on letters/digits only, since spacing around dashes often differs)
    wanted = [c for c in title.lower() if c.isalnum()]
    pos = 0
    for i, c in enumerate(text.lower()):
        if pos == len(wanted):
            text = text[i:].lstrip(" :—-")
            break
        if c.isalnum():
            if c != wanted[pos]:
                break
            pos += 1
    if len(text) <= EXCERPT_LEN:
        return text
    return text[:EXCERPT_LEN].rsplit(" ", 1)[0] + "…"


def load_feed(source):
    if source:
        return Path(source).read_bytes()
    req = urllib.request.Request(FEED_URL, headers={"User-Agent": "Mozilla/5.0 (portfolio feed sync)"})
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.read()


def parse(xml_bytes):
    root = ET.fromstring(xml_bytes)
    articles = []
    for item in root.iter("item"):
        link = clean_link(item.findtext("link", ""))
        if not link.startswith("https://"):
            continue
        extractor = _Extractor()
        extractor.feed(item.findtext(CONTENT_NS, "") or item.findtext("description", ""))
        pub = item.findtext("pubDate", "")
        try:
            date = parsedate_to_datetime(pub).date().isoformat()
        except (TypeError, ValueError):
            date = ""
        title = (item.findtext("title", "") or "Untitled").strip()
        articles.append({
            "title": title,
            "link": link,
            "date": date,
            "thumbnail": extractor.image,
            "excerpt": excerpt("".join(extractor.text), title),
            "tags": [c.text.strip() for c in item.findall("category") if c.text][:3],
        })
    return articles[:MAX_ITEMS]


def main():
    articles = parse(load_feed(sys.argv[1] if len(sys.argv) > 1 else None))
    if not articles:
        sys.exit("No articles found in feed; leaving existing file untouched.")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps({"source": FEED_URL, "items": articles}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(articles)} articles to {OUTPUT}")


if __name__ == "__main__":
    main()
