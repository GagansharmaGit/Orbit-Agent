import re

with open('/home/gagan/.gemini/antigravity/brain/637d5f97-9d63-4c96-b415-d16737bf7ec6/.system_generated/logs/overview.txt', 'r') as f:
    content = f.read()

# We need the TargetContent and ReplacementContent from the multi_replace_file_content calls
import json

lines = content.split('\n')
for line in lines:
    if not line.strip(): continue
    try:
        obj = json.loads(line)
        if obj.get('step_index') in [4220, 4226]:
            print(f"--- STEP {obj['step_index']} ---")
            args = obj['tool_calls'][0]['args']
            chunks_str = args['ReplacementChunks']
            # Regex to find TargetContent and ReplacementContent despite truncation
            # Since it's JSON, the TargetContent string starts with "TargetContent":"
            targets = re.findall(r'"TargetContent":"(.*?)(?=","|\"\}$)', chunks_str)
            for t in targets:
                # unescape the string
                t = t.replace('\\n', '\n').replace('\\"', '"')
                print("TARGET:")
                print(t)
                print("-" * 20)
    except Exception as e:
        pass
