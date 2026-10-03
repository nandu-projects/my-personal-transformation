import os
import re

project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

patterns = [
    (re.compile(r"AIza[0-9A-Za-z-_]{35}"), "Google AIza Key"),
    (re.compile(r"AQ\.[0-9A-Za-z-_]{20,}"), "Gemini AQ Key"),
    (re.compile(r"sk-[0-9A-Za-z-_]{20,}"), "OpenAI Key"),
    (re.compile(r"(?i)(api[_-]?key|secret|password|auth[_-]?token)\s*[:=]\s*['\"][a-zA-Z0-9_\-\.]{8,}['\"]"), "Secret assignment"),
]

findings = []
for root, dirs, files in os.walk(project_dir):
    if any(ignore in root for ignore in ['node_modules', '.git', 'build', '.gradle', 'www']):
        continue
    for f in files:
        if f.endswith(('.apk', '.png', '.ico', '.jar', '.aar', '.zip')):
            continue
        path = os.path.join(root, f)
        rel_path = os.path.relpath(path, project_dir)
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as file:
                lines = file.readlines()
                for line_idx, line in enumerate(lines, 1):
                    for pat, pat_name in patterns:
                        match = pat.search(line)
                        if match:
                            matched_text = match.group(0)
                            lower = matched_text.lower()
                            if any(k in lower for k in ["placeholder", "your_", "example", "dummy"]):
                                continue
                            findings.append((rel_path, line_idx, pat_name, matched_text))
        except Exception as e:
            print("Error reading", rel_path, e)

if findings:
    print(f"Found {len(findings)} potential secret(s):")
    for f in findings:
        print(f"  {f[0]}:{f[1]} [{f[2]}] -> {f[3]}")
    exit(1)
else:
    print("ALL CLEAN: Zero API keys, passwords, tokens, or credentials found in the project.")
