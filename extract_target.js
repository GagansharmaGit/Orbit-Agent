const fs = require('fs');
const log = fs.readFileSync('/home/gagan/.gemini/antigravity/brain/637d5f97-9d63-4c96-b415-d16737bf7ec6/.system_generated/logs/overview.txt', 'utf8');
const lines = log.split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    // Find the multi_replace calls from step 4220 and 4226 (the ones I just did)
    if (obj.step_index === 4220 || obj.step_index === 4226) {
      console.log(`\n\n--- STEP ${obj.step_index} ---`);
      const toolCall = obj.tool_calls[0];
      const args = toolCall.args;
      const chunksStr = args.ReplacementChunks;
      // Since it's truncated, we can't parse it as JSON. We need to extract TargetContent using regex.
      const targetMatches = [...chunksStr.matchAll(/"TargetContent":"(.*?)"/g)];
      targetMatches.forEach((m, i) => {
          console.log(`\n--- TARGET CONTENT ${i+1} ---`);
          console.log(m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'));
      });
    }
  } catch(e) {}
}
