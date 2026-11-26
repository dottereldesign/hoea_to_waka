"""Check the publish tree, archive members and local HTML dependencies before upload."""
import json
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlsplit
from zipfile import ZipFile

repo = Path(__file__).resolve().parents[1]
site = repo / "_site"
errors = []


class Links(HTMLParser):
    def __init__(self, page):
        super().__init__()
        self.page = page

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ("href", "src", "poster", "srcset"):
            value = attrs.get(key)
            if not value or value.startswith("data:"):
                continue
            urls = [part.strip().split()[0] for part in value.split(",") if part.strip()] if key == "srcset" else [value]
            for url in urls:
                parsed = urlsplit(url)
                if parsed.scheme or parsed.netloc or not parsed.path:
                    continue
                name = unquote(parsed.path)
                if name.startswith("/hoea_to_waka/"):
                    target = site / name[len("/hoea_to_waka/"):]
                elif name.startswith("/"):
                    target = site / name.lstrip("/")
                else:
                    target = self.page.parent / name
                target = target.resolve()
                if target.is_dir():
                    target = target / "index.html"
                if not target.is_relative_to(site) or not target.is_file():
                    errors.append(f"{self.page.relative_to(site)}: {url}")


for name in json.loads((repo / "scripts/public-exclusions.json").read_text()):
    if (site / name).exists():
        errors.append(f"Excluded file staged: {name}")
for name in ["about/jamies-workspace", "context", "design", "scripts", ".git", "node_modules"]:
    if (site / name).exists():
        errors.append(f"Private path staged: {name}")
pages = list(site.rglob("*.html"))
if not pages or not (site / "index.html").is_file():
    errors.append("Missing staged homepage")
for page in pages:
    Links(page).feed(page.read_text(encoding="utf-8-sig"))
for archive in site.rglob("*.zip"):
    with ZipFile(archive) as pack:
        if pack.testzip():
            errors.append(f"CRC failure in {archive.name}")
        for name in pack.namelist():
            path = PurePosixPath(name)
            if path.is_absolute() or ".." in path.parts or "\\" in name:
                errors.append(f"Unsafe archive member: {archive.name}/{name}")
        if archive.name.endswith("font-pack.zip") and "LICENSE.txt" not in pack.namelist():
            errors.append("Missing font licence")
if errors:
    raise SystemExit("\n".join(sorted(set(errors))))
print(f"Verified {len(pages)} staged HTML documents, local links, publication exclusions and ZIP integrity.")
