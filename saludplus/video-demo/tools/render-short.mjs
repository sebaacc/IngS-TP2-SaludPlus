import { spawn, spawnSync } from "node:child_process";
import { mkdir, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const screensDir = resolve(projectDir, "assets/screens");
const outputDir = resolve(projectDir, "exports");
const labelDir = resolve("/tmp/saludplus-video-labels");
const outputPath = resolve(outputDir, "saludplus-resumen.mp4");
const musicPath = resolve(projectDir, "assets/music/bed.wav");
const scenes = [
  ["01-perfiles.png", "SaludPlus", "Admisión, espera y atención"],
  ["10-totem-inicio.png", "Tótem de entrada", "Registro de llegada y emisión del turno"],
  ["20-recepcion.png", "Recepción", "Admisión y gestión de pacientes"],
  ["32-cola-llamado-full.png", "Cola del profesional", "Prioridad, llamados e historial"],
  ["40-sala.png", "Sala de espera", "Turno, nombre y destino del llamado"],
  ["31-consulta-abierta.png", "Atención médica", "Seguimiento de cada consulta"],
  ["60-finalizados.png", "Finalizados y ausentes", "Consulta del estado de atención"],
  ["70-admin.png", "Administración", "Indicadores de actividad del centro"],
];

await mkdir(outputDir, { recursive: true });
await mkdir(labelDir, { recursive: true });
await Promise.all([
  ...scenes.map(([file]) => access(resolve(screensDir, file))),
  access(musicPath),
]);

const labelResult = spawnSync("swift", [
  resolve(projectDir, "tools/render-labels.swift"),
  labelDir,
  JSON.stringify(scenes.map(([, title, subtitle]) => ({ title, subtitle }))),
], { stdio: "inherit" });
if (labelResult.status !== 0) process.exit(labelResult.status ?? 1);

const args = ["-y"];
for (const [file] of scenes) args.push("-loop", "1", "-t", "7.5", "-i", resolve(screensDir, file));
scenes.forEach((_, index) => args.push("-loop", "1", "-t", "7.5", "-i", resolve(labelDir, `label-${String(index).padStart(2, "0")}.png`)));
args.push("-stream_loop", "-1", "-i", musicPath);

const filters = scenes.map((_, index) => {
  const startFadeOut = (7.5 - 0.35).toFixed(2);
  return `[${index}:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30,format=rgba[base${index}];[${index + scenes.length}:v]format=rgba[label${index}];[base${index}][label${index}]overlay=0:0:shortest=1,fade=t=in:st=0:d=0.35,fade=t=out:st=${startFadeOut}:d=0.35,format=yuv420p[v${index}]`;
});
filters.push(`${scenes.map((_, i) => `[v${i}]`).join("")}concat=n=${scenes.length}:v=1:a=0[vout]`);
filters.push(`[${scenes.length * 2}:a]volume=0.16,atrim=duration=60,afade=t=out:st=58:d=2[aout]`);
args.push(
  "-filter_complex", filters.join(";"),
  "-map", "[vout]", "-map", "[aout]",
  "-t", "60", "-r", "30",
  "-c:v", "libx264", "-preset", "medium", "-crf", "22",
  "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart",
  outputPath,
);

const ffmpeg = spawn("ffmpeg", args, { stdio: "inherit" });
ffmpeg.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
ffmpeg.on("close", (code) => {
  if (code !== 0) process.exitCode = code ?? 1;
  else console.log(`Video exportado: ${outputPath}`);
});
