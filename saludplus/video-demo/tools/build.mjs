// Builds index.html + compositions/*.html from the storyboard below, the narration
// timing (tools/timing.json) and the real screen captures (assets/screens).
// Re-run after editing narration (node tools/voice.mjs) or the storyboard.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const timing = JSON.parse(fs.readFileSync(path.join(ROOT, "tools/timing.json"), "utf8"));
const boxes = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/screens/boxes.json"), "utf8"));

// Window that frames the app (CSS px of the 1600x900 viewport scaled by K).
const WIN = { x: 240, y: 104, w: 1440, h: 810 };
const K = WIN.w / 1600;
const pngH = (name) => fs.readFileSync(path.join(ROOT, `assets/screens/${name}.png`)).readUInt32BE(20) / 2;

const r3 = (n) => Math.round(n * 1000) / 1000;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const sections = Object.fromEntries(timing.sections.map((s) => [s.id, s]));
function cue(secId) {
  const sec = sections[secId];
  const beats = Object.fromEntries(sec.beats.map((b) => [b.id, b]));
  return (id, off = 0) => r3(beats[id].start - sec.start + off);
}
const beatEnd = (secId, id) => {
  const sec = sections[secId];
  const b = sec.beats.find((x) => x.id === id);
  return r3(b.start + b.duration - sec.start);
};

// ---------------------------------------------------------------- storyboard
// shots: [name, start] (each lasts until the next one). cam: [at, shot, target|null, zoom, dur].
// cursor: [at, shot, target, click?]. ring: [at, dur, shot, target]. note: callout cards.
const S = {};
{
  const c = cue("perfiles");
  S.perfiles = {
    shots: [["01-perfiles", 0]],
    cam: [[0, "01-perfiles", null, 1], [c("p2", -0.2), "01-perfiles", "kiosk", 1.55, 0.8], [c("p3", -0.2), "01-perfiles", "reception", 1.55, 0.7], [c("p4", -0.2), "01-perfiles", "professional", 1.55, 0.7], [c("p5", -0.2), "01-perfiles", "patients", 1.55, 0.7], [c("p6", -0.2), "01-perfiles", "admin", 1.55, 0.7], [c("p6", 2.4), "01-perfiles", null, 1, 0.9]],
    ring: [[c("p2"), 2.0, "01-perfiles", "kiosk"], [c("p3"), 1.5, "01-perfiles", "reception"], [c("p4"), 1.9, "01-perfiles", "professional"], [c("p5"), 2.4, "01-perfiles", "patients"], [c("p6"), 2.2, "01-perfiles", "admin"]],
    cursor: [],
  };
}
{
  const c = cue("totem");
  const click1 = c("t2", 3.6), typed = c("t3", 2.2), submit = c("t4", -0.5);
  S.totem = {
    shots: [["10-totem-inicio", 0], ["11-totem-dni-vacio", click1 + 0.25], ["12-totem-dni", typed], ["13-totem-ticket", submit + 0.3]],
    cam: [[0, "10-totem-inicio", null, 1], [c("t2", -0.2), "10-totem-inicio", "card", 1.3, 1], [click1 + 0.3, "11-totem-dni-vacio", "card", 1.3, 0.6], [c("t3", 0.4), "11-totem-dni-vacio", "input", 1.7, 0.9], [submit + 0.3, "13-totem-ticket", "ticket", 1.55, 0.9], [c("t5", 0.3), "13-totem-ticket", "print", 1.5, 0.8], [c("t5", 3.4), "13-totem-ticket", null, 1, 1]],
    cursor: [[c("t2", 2.4), "10-totem-inicio", "con", true], [c("t3", 0.9), "11-totem-dni-vacio", "input", true], [submit - 0.7, "12-totem-dni", "submit", true], [c("t5", 0.4), "13-totem-ticket", "print", false]],
    ring: [[c("t2", 0.6), 2.6, "10-totem-inicio", "con"], [c("t2", 0.6), 2.6, "10-totem-inicio", "sin"], [submit + 0.6, 3.2, "13-totem-ticket", "ticket"]],
  };
}
{
  const c = cue("recepcion");
  const call = c("r2", -0.3), pay = c("r3", 1.2), confirm = c("r3", 3.4), typed = c("r5", 2.4);
  S.recepcion = {
    shots: [["20-recepcion", 0], ["21-recepcion-llamado", call + 0.25], ["22-recepcion-pago", pay + 0.25], ["23-recepcion-pagado", confirm + 0.25], ["24-turnos-dia", c("r4", -0.4)], ["24b-turnos-acciones", c("r4", 2.8)], ["26-ingreso-manual", c("r5", -0.4)], ["27-ingreso-manual-ok", typed]],
    cam: [[0, "20-recepcion", null, 1], [c("r1", 0.2), "20-recepcion", "workspace", 1.2, 1], [call + 0.3, "21-recepcion-llamado", "heading", 1.45, 0.8], [c("r2", 2.4), "21-recepcion-llamado", "coverage", 1.4, 1.2], [c("r3", -0.2), "21-recepcion-llamado", "payment", 1.45, 1], [pay + 0.3, "22-recepcion-pago", "modal", 1.5, 0.6], [confirm + 0.3, "23-recepcion-pagado", null, 1, 0.8], [c("r4", -0.4), "24-turnos-dia", null, 1, 0.01], [c("r4", 0.3), "24-turnos-dia", "filters", 1.35, 1], [c("r4", 2.8), "24b-turnos-acciones", "actions", 1.6, 0.9], [c("r5", -0.4), "26-ingreso-manual", null, 1, 0.01], [c("r5", 0.4), "26-ingreso-manual", "panel", 1.45, 0.9]],
    cursor: [[call - 0.8, "20-recepcion", "call", true], [pay - 0.9, "21-recepcion-llamado", "pay", true], [confirm - 0.8, "22-recepcion-pago", "confirm", true], [c("r5", 1.0), "26-ingreso-manual", "input", true], [typed - 0.15, "26-ingreso-manual", "button", true]],
    ring: [[c("r1", 1.2), 2.8, "20-recepcion", "next"], [confirm + 0.6, 2.6, "23-recepcion-pagado", "toast"], [typed + 0.7, 3.0, "27-ingreso-manual-ok", "message"]],
  };
}
{
  const c = cue("cola");
  const call = c("c4", 2.6);
  S.cola = {
    shots: [["30-cola", 0], ["30b-cola-full", c("c2", -0.3)], ["31-consulta-abierta", call + 0.3], ["32-cola-llamado-full", c("c6", -0.4)]],
    cam: [[0, "30-cola", null, 1], [c("c1", 0.4), "30-cola", "context", 1.6, 1], [c("c2", -0.3), "30b-cola-full", "table", 1.15, 1], [c("c2", 1.4), "30b-cola-full", "call", 1.45, 1], [c("c3", 0), "30b-cola-full", "table", 1.3, 1], [c("c4", 0.2), "30b-cola-full", "call", 1.5, 1], [call + 0.3, "31-consulta-abierta", null, 1, 0.6], [c("c5", 1.4), "31-consulta-abierta", "toast", 1.5, 0.9], [c("c6", -0.4), "32-cola-llamado-full", "last", 1.55, 1], [c("c7", -0.2), "32-cola-llamado-full", "history", 1.45, 1]],
    cursor: [[call - 0.8, "30b-cola-full", "call", true]],
    ring: [[c("c3", 0.5), 3.0, "30b-cola-full", "table"], [c("c6", 0.6), 3.0, "32-cola-llamado-full", "last"], [c("c7", 0.6), 3.4, "32-cola-llamado-full", "history"]],
  };
}
{
  const c = cue("sala");
  const snd = c("s3", 2.4), full = c("s3", 4.3);
  S.sala = {
    shots: [["40-sala", 0], ["41-sala-sonido", snd + 0.25], ["42-sala-completa", full]],
    cam: [[0, "40-sala", null, 1], [c("s1", 0.3), "40-sala", "call", 1.35, 1.1], [c("s2", -0.2), "40-sala", "list", 1.4, 1], [c("s3", -0.2), "40-sala", "controls", 2.2, 1], [snd + 0.3, "41-sala-sonido", "controls", 2.2, 0.01], [full, "42-sala-completa", null, 1, 0.01], [c("s4", 0.6), "42-sala-completa", "controls", 1.9, 1.2]],
    cursor: [[c("s3", 1.0), "40-sala", "full", false], [snd - 0.1, "40-sala", "sound", true]],
    ring: [[c("s1", 1.4), 2.6, "40-sala", "room"], [c("s3", 0.6), 2.2, "40-sala", "controls"], [c("s4", 1.6), 2.6, "42-sala-completa", "controls"]],
    notes: [{ at: c("s3", 0.8), end: beatEnd("sala", "s4") + 1.2, icon: "volume", title: "Sonido del aviso", body: "Se activa desde el ícono del parlante. Su reproducción puede depender de la configuración del navegador." }],
  };
}
{
  const c = cue("atencion");
  const fin = c("m4", -0.6);
  S.atencion = {
    shots: [["31b-consulta-full", 0], ["50-consulta-finalizada", fin + 0.3], ["51-consulta-reanudar", c("m6", -0.3)]],
    cam: [[0, "31b-consulta-full", "data", 1.05], [c("m1", 0.4), "31b-consulta-full", "data", 1.25, 1.2], [c("m2", -0.2), "31b-consulta-full", "turn", 1.3, 1.2], [c("m2", 2.6), "31b-consulta-full", "history", 1.3, 1.2], [c("m3", -0.2), "31b-consulta-full", "rx", 1.3, 1.2], [fin - 1.4, "31b-consulta-full", "finish", 1.6, 0.9], [fin + 0.3, "50-consulta-finalizada", null, 1, 0.01], [c("m4", 0.6), "50-consulta-finalizada", "status", 1.7, 1], [c("m5", -0.2), "50-consulta-finalizada", "note", 1.7, 1], [c("m6", -0.3), "51-consulta-reanudar", "resume", 1.8, 0.01]],
    cursor: [[fin - 0.7, "31b-consulta-full", "finish", true], [c("m6", 0.8), "51-consulta-reanudar", "resume", false]],
    ring: [[c("m4", 1.0), 2.6, "50-consulta-finalizada", "status"], [c("m5", 0.4), 3.0, "50-consulta-finalizada", "note"], [c("m6", 0.3), 2.6, "51-consulta-reanudar", "resume"]],
    notes: [{ at: c("m3", 1.2), end: c("m4", -1.8), icon: "doc", title: "Prescripción", body: "Disponible en la consulta: Imprimir / PDF y Enviar por mail. En este video no se carga una receta." }],
  };
}
{
  const c = cue("finalizados");
  S.finalizados = {
    shots: [["60-finalizados", 0]],
    cam: [[0, "60-finalizados", null, 1], [c("f1", 0.6), "60-finalizados", "table", 1.25, 1.4], [c("f2", 0.2), "60-finalizados", "firstRow", 1.6, 1.2], [c("f2", 3.8), "60-finalizados", "panel", 1.2, 1.2]],
    cursor: [],
    ring: [[c("f2", 1.6), 3.2, "60-finalizados", "finished"], [c("f2", 2.2), 3.2, "60-finalizados", "absent"]],
  };
}
{
  const c = cue("admin");
  S.admin = {
    shots: [["70-admin", 0]],
    cam: [[0, "70-admin", null, 1], [c("d1", 0.2), "70-admin", "stats", 1.45, 1.1], [c("d2", -0.2), "70-admin", "pie", 1.3, 1.1], [c("d2", 2.0), "70-admin", "network", 1.4, 1]],
    cursor: [],
    ring: [[c("d1", 0.9), 3.6, "70-admin", "stats"]],
  };
}

// ------------------------------------------------------------- geometry
function camFor(shot, target, z) {
  const imgH = pngH(shot) * K;
  if (!target) return { x: 0, y: 0, s: 1 };
  const b = boxes[shot].targets[target];
  if (!b) throw new Error(`missing box ${shot}.${target}`);
  const cx = (b.x + b.w / 2) * K, cy = (b.y + b.h / 2) * K;
  let x = WIN.w / 2 - cx * z, y = WIN.h / 2 - cy * z;
  x = Math.min(0, Math.max(WIN.w - WIN.w * z, x));
  y = Math.min(0, Math.max(WIN.h - imgH * z, y));
  return { x: r3(x), y: r3(y), s: z };
}
const boxPx = (shot, target) => {
  const b = boxes[shot].targets[target];
  if (!b) throw new Error(`missing box ${shot}.${target}`);
  return { x: b.x * K, y: b.y * K, w: b.w * K, h: b.h * K };
};

const SFXDUR = { "click.mp3": 0.4, "click-soft.mp3": 0.4, "pop.mp3": 0.6, "whoosh.mp3": 1.4, "whoosh-short.mp3": 0.9 };
const sfx = []; // absolute-time sound effects for the root
const ICONS = {
  volume: '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  doc: '<path d="M7 3h7l4 4v14H7Z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
};

function header(sec, idx) {
  return `
    <div class="sec-head">
      <span class="sec-num">${String(idx).padStart(2, "0")}</span>
      <span class="sec-title" data-var-text="${sec.id}-title">${esc(sec.title)}</span>
    </div>
    <div class="sec-brand"><img src="assets/brand/saludplus-logo.svg" alt="" /><span>SaludPlus</span></div>`;
}

const BASE_CSS = `
    #root { position: absolute; inset: 0; font-family: Inter, sans-serif; color: #0b2440; }
    .sec-head { position: absolute; left: ${WIN.x}px; top: 40px; height: 44px; display: flex; align-items: center; gap: 14px; }
    .sec-num { font-weight: 700; font-size: 22px; color: #fff; background: linear-gradient(135deg, #0a6ebd, #0d9488); border-radius: 10px; padding: 7px 11px; letter-spacing: 0.02em; }
    .sec-title { font-weight: 700; font-size: 30px; letter-spacing: -0.01em; color: #0b2440; }
    .sec-brand { position: absolute; right: ${1920 - WIN.x - WIN.w}px; top: 44px; display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 22px; color: #0b2440; }
    .sec-brand img { width: 34px; height: 34px; }
    .win { position: absolute; left: ${WIN.x}px; top: ${WIN.y}px; width: ${WIN.w}px; height: ${WIN.h}px; border-radius: 18px; overflow: hidden; background: #f4f8fc; box-shadow: 0 30px 70px -20px rgba(11, 36, 64, 0.35), 0 0 0 1px rgba(11, 36, 64, 0.08); }
    .drift { position: absolute; inset: 0; transform-origin: 50% 50%; }
    .cam { position: absolute; left: 0; top: 0; width: ${WIN.w}px; height: ${WIN.h}px; transform-origin: 0 0; }
    .shot { position: absolute; left: 0; top: 0; width: ${WIN.w}px; height: auto; }
    .ring { position: absolute; border: 3px solid #0d9488; border-radius: 12px; box-shadow: 0 0 0 6px rgba(13, 148, 136, 0.18); pointer-events: none; }
    .cursor { position: absolute; left: 0; top: 0; width: 26px; height: 26px; z-index: 50; }
    .cursor svg { width: 26px; height: 26px; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.35)); }
    .ripple { position: absolute; left: -14px; top: -14px; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #0a6ebd; opacity: 0; }
    .note { position: absolute; right: 28px; top: 28px; width: 430px; background: rgba(255,255,255,0.97); border-radius: 16px; padding: 20px 22px; display: flex; gap: 16px; box-shadow: 0 18px 40px -12px rgba(11,36,64,0.35); border: 1px solid #dbe6ee; z-index: 60; }
    .note-icon { flex: none; width: 46px; height: 46px; border-radius: 12px; background: #e6f2fb; display: flex; align-items: center; justify-content: center; }
    .note-icon svg { width: 26px; height: 26px; fill: none; stroke: #0a6ebd; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .note strong { display: block; font-size: 21px; margin-bottom: 6px; color: #0b2440; }
    .note p { margin: 0; font-size: 18px; line-height: 1.4; color: #3c5368; }`;

function screenScene(secId, idx) {
  const sec = sections[secId];
  const sb = S[secId];
  const dur = r3(sec.end - sec.start);
  const p = secId.slice(0, 3);
  const html = [];
  const js = [];
  // window entrance / exit
  js.push(`tl.fromTo("#${p}-win", { opacity: 0, y: 24, scale: 0.985 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" }, 0.05);`);
  js.push(`tl.fromTo("#${p}-head", { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, 0.15);`);
  js.push(`tl.fromTo("#${p}-drift", { scale: 1 }, { scale: 1.025, duration: ${dur}, ease: "none" }, 0);`);
  js.push(`tl.to(["#${p}-win", "#${p}-head"], { opacity: 0, duration: 0.4, ease: "power2.in" }, ${r3(dur - 0.45)});`);

  // shots
  sb.shots.forEach(([name, start], i) => {
    const next = sb.shots[i + 1];
    const end = next ? next[1] + 0.35 : dur;
    html.push(`<img id="${p}-shot-${i}" class="clip shot" data-start="${r3(start)}" data-duration="${r3(end - start)}" data-track-index="${2 + (i % 2)}" src="assets/screens/${name}.png" alt="${esc(name)}" style="z-index:${i + 1}" />`);
    if (i > 0) js.push(`tl.fromTo("#${p}-shot-${i}", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.inOut" }, ${r3(start)});`);
  });

  // camera
  sb.cam.forEach(([at, shot, target, z, d], i) => {
    const c = camFor(shot, target, z);
    if (i === 0) js.push(`tl.set("#${p}-cam", { x: ${c.x}, y: ${c.y}, scale: ${c.s} }, 0);`);
    else js.push(`tl.to("#${p}-cam", { x: ${c.x}, y: ${c.y}, scale: ${c.s}, duration: ${d ?? 1}, ease: "power2.inOut" }, ${r3(at)});`);
  });

  // highlight rings
  (sb.ring || []).forEach(([at, d, shot, target], i) => {
    const b = boxPx(shot, target);
    const pad = 6;
    html.push(`<div id="${p}-ring-${i}" class="clip ring" data-start="${r3(at)}" data-duration="${r3(d)}" data-track-index="6" style="left:${r3(b.x - pad)}px;top:${r3(b.y - pad)}px;width:${r3(b.w + pad * 2)}px;height:${r3(b.h + pad * 2)}px;z-index:40"></div>`);
    js.push(`tl.fromTo("#${p}-ring-${i}", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, ${r3(at)});`);
    js.push(`tl.to("#${p}-ring-${i}", { opacity: 0, duration: 0.3, ease: "power2.in" }, ${r3(at + d - 0.32)});`);
  });

  // cursor
  if (sb.cursor.length) {
    const first = sb.cursor[0];
    const fb = boxPx(first[1], first[2]);
    const firstAt = Math.max(0.2, first[0] - 1.6);
    const lastAt = sb.cursor[sb.cursor.length - 1][0];
    html.push(`<div id="${p}-cursor" class="clip cursor" data-start="${r3(firstAt)}" data-duration="${r3(Math.min(dur - firstAt, lastAt - firstAt + 2.2))}" data-track-index="7"><div id="${p}-cursor-in"><svg viewBox="0 0 24 24"><path d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.4-6.9L4 20Z" fill="#fff" stroke="#0b2440" stroke-width="1.6" stroke-linejoin="round"/></svg><div id="${p}-ripple" class="ripple"></div></div></div>`);
    js.push(`tl.set("#${p}-cursor-in", { x: ${r3(fb.x + fb.w * 0.5 + 120)}, y: ${r3(fb.y + fb.h * 0.5 + 90)}, opacity: 0 }, 0);`);
    js.push(`tl.to("#${p}-cursor-in", { opacity: 1, duration: 0.3 }, ${r3(firstAt)});`);
    sb.cursor.forEach(([at, shot, target, click], i) => {
      const b = boxPx(shot, target);
      const tx = r3(b.x + Math.min(b.w * 0.5, 120)), ty = r3(b.y + b.h * 0.55);
      js.push(`tl.to("#${p}-cursor-in", { x: ${tx}, y: ${ty}, duration: 0.8, ease: "power2.inOut" }, ${r3(at - 0.85)});`);
      if (click) {
        js.push(`tl.to("#${p}-cursor-in", { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.inOut" }, ${r3(at)});`);
        js.push(`tl.fromTo("#${p}-ripple", { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 2.2, duration: 0.5, ease: "power2.out", immediateRender: false }, ${r3(at)});`);
        sfx.push({ t: r3(sec.start + at + 0.02), file: i % 2 ? "click.mp3" : "click-soft.mp3", vol: 0.5 });
      }
    });
    js.push(`tl.to("#${p}-cursor-in", { opacity: 0, duration: 0.3 }, ${r3(Math.min(dur - 0.5, lastAt + 1.6))});`);
  }

  // callout notes
  (sb.notes || []).forEach((n, i) => {
    html.push(`<div id="${p}-note-${i}" class="clip note" data-start="${r3(n.at)}" data-duration="${r3(n.end - n.at)}" data-track-index="8"><div class="note-icon"><svg viewBox="0 0 24 24">${ICONS[n.icon]}</svg></div><div><strong>${esc(n.title)}</strong><p>${esc(n.body)}</p></div></div>`);
    js.push(`tl.fromTo("#${p}-note-${i}", { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, ${r3(n.at)});`);
    js.push(`tl.to("#${p}-note-${i}", { opacity: 0, duration: 0.3, ease: "power2.in" }, ${r3(n.end - 0.32)});`);
    sfx.push({ t: r3(sec.start + n.at + 0.05), file: "pop.mp3", vol: 0.35 });
  });

  const notesHtml = html.filter((h) => h.includes('class="clip note"'));
  const camHtml = html.filter((h) => !h.includes('class="clip note"'));
  return `<template>
  <style>${BASE_CSS}
  </style>
  <div id="root" data-composition-id="${secId}" data-width="1920" data-height="1080">
    <div id="${p}-head">${header(sec, idx)}
    </div>
    <div id="${p}-win" class="win">
      <div id="${p}-drift" class="drift">
      <div id="${p}-cam" class="cam">
        ${camHtml.join("\n        ")}
      </div>
      </div>
      ${notesHtml.join("\n      ")}
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${js.join("\n    ")}
    window.__timelines["${secId}"] = tl;
  </script>
</template>
`;
}

// ------------------------------------------------------------- opening & closing
const LOGO = `<svg viewBox="0 0 48 48"><defs><linearGradient id="LG" x1="8" y1="5" x2="40" y2="43" gradientUnits="userSpaceOnUse"><stop stop-color="#0A6EBD"/><stop offset="1" stop-color="#0D9488"/></linearGradient></defs><rect width="48" height="48" rx="14" fill="url(#LG)"/><path d="M39 17.5c0 9-15 18.5-15 18.5S9 26.5 9 17.5a7.8 7.8 0 0 1 15-3.2 7.8 7.8 0 0 1 15 3.2Z" fill="none" stroke="white" stroke-width="2.5" stroke-linejoin="round"/><path d="M14.5 21.5h5l2.5-4.2 3.7 8 2.5-3.8h5.3" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function openingScene() {
  const c = cue("apertura");
  const dur = 20;
  return `<template>
  <style>
    #root { position: absolute; inset: 0; font-family: Inter, sans-serif; overflow: hidden; }
    .op-bg { position: absolute; inset: 0; background: radial-gradient(1200px 700px at 78% 30%, #134a7a 0%, rgba(19,74,122,0) 70%), radial-gradient(900px 600px at 10% 100%, rgba(13,148,136,0.35) 0%, rgba(13,148,136,0) 70%), linear-gradient(150deg, #0b2440 0%, #0e2f52 100%); }
    .op-left { position: absolute; left: 190px; top: 250px; width: 760px; color: #fff; }
    .op-logo { width: 104px; height: 104px; }
    .op-logo svg { width: 104px; height: 104px; }
    .op-name { font-size: 112px; font-weight: 900; letter-spacing: -0.035em; line-height: 1; margin: 34px 0 20px; }
    .op-tag { font-size: 34px; line-height: 1.35; color: #cfe3f5; font-weight: 400; max-width: 700px; }
    .op-chips { display: flex; flex-direction: column; gap: 14px; margin-top: 40px; }
    .op-chip { display: flex; align-items: center; gap: 14px; font-size: 30px; font-weight: 700; color: #fff; }
    .op-chip i { width: 12px; height: 12px; border-radius: 50%; background: #2dd4bf; display: block; }
    .op-stack { position: absolute; left: 1010px; top: 150px; width: 760px; height: 760px; }
    .op-card { position: absolute; width: 640px; border-radius: 16px; overflow: hidden; box-shadow: 0 30px 60px -18px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.12); }
    .op-card img { display: block; width: 640px; height: auto; }
  </style>
  <div id="root" data-composition-id="apertura" data-width="1920" data-height="1080">
    <div class="op-bg"></div>
    <div class="op-left">
      <div id="op-logo" class="op-logo">${LOGO}</div>
      <div id="op-name" class="op-name" data-var-text="brand-name">SaludPlus</div>
      <div id="op-tag" class="op-tag">Admisión, espera y atención en un centro médico.</div>
      <div class="op-chips">
        <div id="op-chip-0" class="op-chip"><i></i><span>Ordena la llegada de pacientes</span></div>
        <div id="op-chip-1" class="op-chip"><i></i><span>Reduce confusiones en la espera</span></div>
        <div id="op-chip-2" class="op-chip"><i></i><span>Facilita el seguimiento de la atención</span></div>
      </div>
    </div>
    <div class="op-stack">
      <div id="op-card-0" class="op-card" style="left:120px;top:0px"><img src="assets/screens/13-totem-ticket.png" alt="Tótem" /></div>
      <div id="op-card-1" class="op-card" style="left:0px;top:230px"><img src="assets/screens/42-sala-completa.png" alt="Sala de espera" /></div>
      <div id="op-card-2" class="op-card" style="left:110px;top:460px"><img src="assets/screens/30-cola.png" alt="Cola del profesional" /></div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#op-logo", { opacity: 1, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }, 0);
    tl.fromTo("#op-name", { opacity: 1, y: 8 }, { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }, 0);
    tl.fromTo("#op-tag", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, ${c("a1", 0.6)});
    tl.fromTo("#op-card-0", { opacity: 0, x: 80, rotation: 4 }, { opacity: 1, x: 0, rotation: 2, duration: 0.9, ease: "power3.out" }, ${c("a1", 1.6)});
    tl.fromTo("#op-card-1", { opacity: 0, x: 80, rotation: -4 }, { opacity: 1, x: 0, rotation: -2, duration: 0.9, ease: "power3.out" }, ${c("a1", 2.8)});
    tl.fromTo("#op-card-2", { opacity: 0, x: 80, rotation: 3 }, { opacity: 1, x: 0, rotation: 1.5, duration: 0.9, ease: "power3.out" }, ${c("a1", 4.0)});
    tl.fromTo("#op-chip-0", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, ${c("a2", 0.1)});
    tl.fromTo("#op-chip-1", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, ${c("a2", 1.9)});
    tl.fromTo("#op-chip-2", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, ${c("a2", 3.4)});
    tl.fromTo(".op-stack", { y: 0 }, { y: -30, duration: ${dur}, ease: "none" }, 0);
    tl.to("#root .op-left, #root .op-stack", { opacity: 0, duration: 0.5, ease: "power2.in" }, ${dur - 0.55});
    window.__timelines["apertura"] = tl;
  </script>
</template>
`;
}

function closingScene() {
  const c = cue("cierre");
  return `<template>
  <style>
    #root { position: absolute; inset: 0; font-family: Inter, sans-serif; overflow: hidden; }
    .cl-bg { position: absolute; inset: 0; background: radial-gradient(1000px 640px at 50% 40%, #134a7a 0%, rgba(19,74,122,0) 70%), linear-gradient(160deg, #0b2440 0%, #0e2f52 100%); }
    .cl-center { position: absolute; left: 0; right: 0; top: 260px; text-align: center; color: #fff; }
    .cl-logo { width: 132px; height: 132px; margin: 0 auto; }
    .cl-logo svg { width: 132px; height: 132px; }
    .cl-name { font-size: 120px; font-weight: 900; letter-spacing: -0.035em; margin-top: 34px; }
    .cl-line { font-size: 36px; color: #cfe3f5; margin-top: 18px; }
    .cl-flow { display: flex; justify-content: center; gap: 18px; margin-top: 44px; font-size: 26px; font-weight: 700; }
    .cl-flow span { padding: 10px 20px; border-radius: 999px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); }
  </style>
  <div id="root" data-composition-id="cierre" data-width="1920" data-height="1080">
    <div class="cl-bg"></div>
    <div class="cl-center">
      <div id="cl-logo" class="cl-logo">${LOGO}</div>
      <div id="cl-name" class="cl-name">SaludPlus</div>
      <div id="cl-line" class="cl-line">Admisión, llamados y atención en un mismo flujo.</div>
      <div class="cl-flow"><span id="cl-f0">Tótem</span><span id="cl-f1">Recepción</span><span id="cl-f2">Profesional</span><span id="cl-f3">Sala de espera</span><span id="cl-f4">Administración</span></div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#cl-logo", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.6)" }, 0.2);
    tl.fromTo("#cl-name", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.5);
    tl.fromTo("#cl-line", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, ${c("z1", 0.4)});
    ${[0, 1, 2, 3, 4].map((i) => `tl.fromTo("#cl-f${i}", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, ${c("z1", 1.6 + i * 0.35)});`).join("\n    ")}
    tl.to("#root .cl-center", { opacity: 0, duration: 1.2, ease: "power1.in" }, 8.6);
    window.__timelines["cierre"] = tl;
  </script>
</template>
`;
}

// ------------------------------------------------------------- captions
function captionChunks(text, maxLen = 62) {
  const parts = text.match(/[^,.:;!?]+[,.:;!?]*\s*/g) || [text];
  const chunks = [];
  let cur = "";
  for (const raw of parts) {
    const piece = raw;
    if ((cur + piece).trim().length > maxLen && cur) { chunks.push(cur.trim()); cur = piece; }
    else cur += piece;
  }
  if (cur.trim()) chunks.push(cur.trim());
  // split any still-long chunk on word boundary near the middle
  return chunks.flatMap((ch) => {
    if (ch.length <= maxLen) return [ch];
    const words = ch.split(" "); const half = ch.length / 2; let acc = ""; let i = 0;
    while (i < words.length && (acc + words[i]).length < half) acc += words[i++] + " ";
    return [acc.trim(), words.slice(i).join(" ")];
  });
}

function captionsScene() {
  const groups = [];
  const js = [];
  let n = 0;
  for (const sec of timing.sections) {
    const dark = sec.id === "apertura" || sec.id === "cierre";
    for (const b of sec.beats) {
      const chunks = captionChunks(b.text);
      const total = chunks.reduce((s, ch) => s + ch.length, 0);
      let t = b.start;
      chunks.forEach((ch, i) => {
        const d = (b.duration * ch.length) / total;
        const start = r3(t - (i === 0 ? 0.08 : 0));
        const end = r3(t + d + (i === chunks.length - 1 ? 0.25 : 0));
        t += d;
        const id = `cap-${n++}`;
        groups.push(`<div id="${id}" class="cap${dark ? " on-dark" : ""}"><span>${esc(ch)}</span></div>`);
        js.push(`tl.set("#${id}", { opacity: 1, visibility: "visible" }, ${start}); tl.set("#${id}", { opacity: 0, visibility: "hidden" }, ${end});`);
      });
    }
  }
  return `<template>
  <style>
    #root { position: absolute; inset: 0; font-family: Inter, sans-serif; pointer-events: none; }
    .cap { position: absolute; left: 0; right: 0; top: 936px; text-align: center; opacity: 0; visibility: hidden; overflow: visible; }
    .cap span { display: inline-block; font-size: 34px; font-weight: 700; line-height: 1.25; color: #0b2440; background: rgba(255, 255, 255, 0.88); padding: 6px 18px; border-radius: 10px; max-width: 1500px; }
    .cap.on-dark span { color: #fff; background: rgba(5, 20, 38, 0.55); }
  </style>
  <div id="root" data-composition-id="captions" data-width="1920" data-height="1080">
    ${groups.join("\n    ")}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${js.join("\n    ")}
    window.__timelines["captions"] = tl;
  </script>
</template>
`;
}

// ------------------------------------------------------------- write
const order = ["apertura", "perfiles", "totem", "recepcion", "cola", "sala", "atencion", "finalizados", "admin", "cierre"];
fs.mkdirSync(path.join(ROOT, "compositions"), { recursive: true });
for (const [i, id] of order.entries()) {
  const file = id === "apertura" ? openingScene() : id === "cierre" ? closingScene() : screenScene(id, i);
  fs.writeFileSync(path.join(ROOT, `compositions/${id}.html`), file);
}
fs.writeFileSync(path.join(ROOT, "compositions/captions.html"), captionsScene());

// section transitions
for (const id of order.slice(1)) sfx.push({ t: r3(sections[id].start + 0.02), file: sections[id].start % 2 ? "whoosh.mp3" : "whoosh-short.mp3", vol: 0.28 });

const hosts = order.map((id) => {
  const s = sections[id];
  return `      <div id="${id}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${s.start}" data-duration="${r3(s.end - s.start)}" data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080"></div>`;
});
const voices = timing.sections.flatMap((s) => s.beats.map((b) =>
  `      <audio id="vo-${b.id}" class="clip" src="${b.file}" data-start="${b.start}" data-duration="${b.duration}" data-track-index="10" data-volume="1"></audio>`));
const sfxTags = sfx.sort((a, b) => a.t - b.t).map((x, i) =>
  `      <audio id="sfx-${i}" class="clip" src="assets/sfx/${x.file}" data-start="${x.t}" data-duration="${SFXDUR[x.file]}" data-track-index="${12 + (i % 2)}" data-volume="${x.vol}"></audio>`);

const index = `<!doctype html>
<html lang="es" data-composition-variables='[{"id":"brand-name","type":"string","label":"Marca","default":"SaludPlus"}]'>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>SaludPlus · Video demostrativo</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #f4f8fc; }
      .bg { position: absolute; inset: 0; background: radial-gradient(900px 600px at 0% 0%, rgba(10, 110, 189, 0.12) 0%, rgba(10, 110, 189, 0) 70%), radial-gradient(900px 600px at 100% 100%, rgba(13, 148, 136, 0.12) 0%, rgba(13, 148, 136, 0) 70%), linear-gradient(180deg, #f6f9fd 0%, #e9f1f9 100%); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="300" data-width="1920" data-height="1080">
      <div class="bg"></div>
${hosts.join("\n")}
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="300" data-track-index="5" data-track-kind="captions" data-width="1920" data-height="1080" style="z-index: 20"></div>
      <audio id="music" class="clip" src="assets/music/bed.wav" data-start="0" data-duration="300" data-track-index="11" data-volume="0.16"></audio>
${voices.join("\n")}
${sfxTags.join("\n")}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(ROOT, "index.html"), index);
console.log("built", order.length, "scenes,", voices.length, "voice clips,", sfxTags.length, "sfx");
