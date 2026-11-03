// Generates one narration clip per beat with macOS `say`, then lays beats out inside
// each section's time slot. Writes tools/timing.json for build.mjs.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const nar = JSON.parse(fs.readFileSync(path.join(ROOT, "tools/narration.json"), "utf8"));
const outDir = path.join(ROOT, "assets/voice");
fs.mkdirSync(outDir, { recursive: true });

const dur = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

const timing = { sections: [] };
for (const sec of nar.sections) {
  const beats = [];
  for (const b of sec.beats) {
    const aiff = path.join(outDir, `${b.id}.aiff`);
    const wav = path.join(outDir, `${b.id}.wav`);
    execFileSync("say", ["-v", nar.voice, "-r", String(nar.rate), "-o", aiff, b.say || b.text]);
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", aiff, "-af", "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-18:TP=-2", "-ar", "48000", "-ac", "1", wav]);
    fs.unlinkSync(aiff);
    beats.push({ ...b, duration: +dur(wav).toFixed(3), file: `assets/voice/${b.id}.wav` });
  }
  const slot = sec.end - sec.start;
  const speech = beats.reduce((s, b) => s + b.duration, 0);
  const lead = sec.id === "apertura" ? 1.6 : 0.9;
  const tail = sec.id === "cierre" ? 3 : 0.8;
  const gap = Math.max(0.35, Math.min(1.6, (slot - lead - tail - speech) / Math.max(1, beats.length - 1)));
  let t = sec.start + lead;
  for (const b of beats) { b.start = +t.toFixed(3); t += b.duration + gap; }
  const over = t - gap - (sec.end - 0.2);
  if (over > 0) console.warn(`OVER ${sec.id} by ${over.toFixed(2)}s`);
  console.log(`${sec.id}: speech ${speech.toFixed(1)}s / slot ${slot}s gap ${gap.toFixed(2)}`);
  timing.sections.push({ id: sec.id, title: sec.title, start: sec.start, end: sec.end, beats });
}
fs.writeFileSync(path.join(ROOT, "tools/timing.json"), JSON.stringify(timing, null, 2));
