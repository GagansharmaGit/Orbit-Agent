import re

with open('/home/gagan/.gemini/antigravity/brain/637d5f97-9d63-4c96-b415-d16737bf7ec6/.system_generated/logs/overview.txt', 'r') as f:
    lines = f.readlines()

for line in lines:
    if '"step_index":4220' in line or '"step_index":4226' in line:
        targets = re.findall(r'"TargetContent":"(.*?)(?=","|\"\})', line)
        for i, t in enumerate(targets):
            t = t.replace('\\n', '\n').replace('\\"', '"')
            print(f"--- TARGET CONTENT {i} ---")
            print(t)
