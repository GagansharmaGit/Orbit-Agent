const fs = require('fs');
const log = fs.readFileSync('/home/gagan/.gemini/antigravity/brain/637d5f97-9d63-4c96-b415-d16737bf7ec6/.system_generated/logs/overview.txt', 'utf8');
const lines = log.split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 4148 || obj.step_index === 4154) {
      console.log(`\n\n--- STEP ${obj.step_index} ---`);
      const toolCall = obj.tool_calls[0];
      const args = toolCall.args;
      const chunks = JSON.parse(args.ReplacementChunks);
      for (const chunk of chunks) {
        console.log(`\n--- TARGET (${chunk.StartLine} to ${chunk.EndLine}) ---`);
        console.log(chunk.TargetContent);
        console.log(`\n--- REPLACEMENT ---`);
        console.log(chunk.ReplacementContent);
      }
    }
  } catch(e) {}
}
