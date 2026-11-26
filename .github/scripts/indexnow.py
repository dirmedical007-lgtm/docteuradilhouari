"""Submit changed canonical URLs after successful GitHub Pages deployment."""
import json
import os
import subprocess
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from urllib.parse import urlsplit

HOST = "adilhouari.pro"
ROOT = "https://" + HOST
KEY = "b74d64a1e8c9436ea3c207fb592d8a16"
KEY_URL = ROOT + "/" + KEY + ".txt"
NS = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}

def git(*args):
    return subprocess.check_output(["git", *args], text=True)

def sitemap_urls(sha):
    raw = git("show", sha + ":sitemap.xml")
    root = ET.fromstring(raw)
    urls = {n.text.strip() for n in root.findall("s:url/s:loc", NS) if n.text}
    if not urls or any(urlsplit(u).scheme != "https" or urlsplit(u).netloc != HOST or urlsplit(u).query or urlsplit(u).fragment for u in urls):
        raise ValueError("Invalid canonical sitemap")
    return urls

def source_path(url):
    path = urlsplit(url).path.lstrip("/")
    return path + "index.html" if not path or path.endswith("/") else path

def request(url, data=None, headers=None):
    req = urllib.request.Request(url, data=data, headers=headers or {})
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.status, response.read()

def previous_deployment(run):
    repo = os.environ["GITHUB_REPOSITORY"]
    headers = {"Authorization": "Bearer " + os.environ["GH_TOKEN"], "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    for page in range(1, 6):
        _, body = request(f"https://api.github.com/repos/{repo}/actions/runs?branch=main&status=success&per_page=100&page={page}", headers=headers)
        runs = json.loads(body)["workflow_runs"]
        for candidate in runs:
            if candidate["workflow_id"] == run["workflow_id"] and candidate["id"] != run["id"] and candidate["created_at"] < run["created_at"] and candidate["head_sha"] != run["head_sha"]:
                return candidate["head_sha"]
        if len(runs) < 100:
            break
    return None

def select_urls(event, head):
    current = sitemap_urls(head)
    if os.environ["GITHUB_EVENT_NAME"] == "workflow_dispatch":
        if event.get("inputs", {}).get("all_urls") == "true":
            return current
        return {ROOT + "/"}
    run = event["workflow_run"]
    previous = previous_deployment(run)
    if not previous:
        print("No previous successful Pages deployment found; sending homepage only.")
        return {ROOT + "/"}
    before = sitemap_urls(previous)
    changed = set(git("diff", "--name-only", "--no-renames", previous, head, "--").splitlines())
    urls = (current ^ before) | {u for u in current | before if source_path(u) in changed}
    # One initial verification submission when the key is first published.
    if KEY + ".txt" in changed and not urls:
        urls.add(ROOT + "/")
    return urls

def main():
    with open(os.environ["GITHUB_EVENT_PATH"], encoding="utf-8") as f:
        event = json.load(f)
    head = git("rev-parse", "HEAD").strip()
    if os.environ["GITHUB_EVENT_NAME"] == "workflow_run" and head != event["workflow_run"]["head_sha"]:
        raise RuntimeError("Checkout does not match deployed revision")
    urls = sorted(select_urls(event, head))
    if not urls:
        print("No changed sitemap URLs; nothing submitted.")
        return
    # Wait for CDN publication of the ownership proof, never send without it.
    for attempt in range(6):
        try:
            _, body = request(KEY_URL + "?check=" + head)
            if body.decode("utf-8").strip() == KEY:
                break
        except (OSError, UnicodeError):
            pass
        if attempt < 5:
            time.sleep(15)
    else:
        raise RuntimeError("Public IndexNow key could not be verified")
    payload = json.dumps({"host": HOST, "key": KEY, "keyLocation": KEY_URL, "urlList": urls}).encode("utf-8")
    status, _ = request("https://api.indexnow.org/indexnow", payload, {"Content-Type": "application/json; charset=utf-8"})
    if status not in (200, 202):
        raise RuntimeError(f"Unexpected IndexNow response: {status}")
    print(f"IndexNow HTTP {status}: {len(urls)} URL(s) accepted" + ("; key validation pending" if status == 202 else ""))
    for url in urls:
        print(url)

if __name__ == "__main__":
    main()
