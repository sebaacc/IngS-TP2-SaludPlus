// Captures real SaludPlus screens (demo data) for the video, plus element boxes.
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const OUT = process.argv[2];
const BASE = "http://localhost:5179/IngS-TP2-SaludPlus/";
fs.mkdirSync(OUT, { recursive: true });
const boxes = {};

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 2,
  locale: "es-AR",
  timezoneId: "America/Argentina/Buenos_Aires",
  acceptDownloads: true,
});
const page = await ctx.newPage();
page.on("pageerror", (e) => console.error("PAGEERROR", e.message));
const wait = (ms) => page.waitForTimeout(ms);

async function shot(name, targets = {}, opts = {}) {
  await wait(opts.settle ?? 450);
  const file = path.join(OUT, `${name}.png`);
  if (opts.fullPage) {
    await page.evaluate(() => window.scrollTo(0, 0));
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width: 1600, height: Math.max(900, h) });
    await wait(400);
  }
  await page.screenshot({ path: file, animations: "disabled" });
  const b = { fullPage: !!opts.fullPage };
  const dims = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, sy: window.scrollY }));
  b.page = dims;
  b.targets = {};
  for (const [k, sel] of Object.entries(targets)) {
    const loc = typeof sel === "string" ? page.locator(sel).first() : sel;
    const r = await loc.boundingBox().catch(() => null);
    if (r) b.targets[k] = { x: Math.round(r.x + (opts.fullPage ? dims.sy : 0)), y: Math.round(r.y + (opts.fullPage ? dims.sy : 0)), w: Math.round(r.width), h: Math.round(r.height) };
    else console.warn("no box", name, k);
  }
  boxes[name] = b;
  if (opts.fullPage) await page.setViewportSize({ width: 1600, height: 900 });
  console.log("shot", name);
}

await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload();
await wait(600);

// Login (credentials from the project's test accounts; screen captured before typing).
await shot("00-login", { card: ".login-card" });
await page.fill("#login-email", "demo@saludplus.com");
await page.fill("#login-password", "saludplus");
await page.click(".login-submit");
await page.waitForSelector(".profile-grid");
await shot("01-perfiles", {
  grid: ".profile-grid",
  professional: ".profile-card >> nth=0",
  reception: ".profile-card >> nth=1",
  patients: ".profile-card >> nth=2",
  admin: ".profile-card >> nth=3",
  kiosk: ".profile-card >> nth=4",
});

// Kiosk
await page.click(".profile-card >> nth=4");
await page.waitForSelector(".kiosk-card");
await shot("10-totem-inicio", { card: ".kiosk-card", con: ".kiosk-option >> nth=0", sin: ".kiosk-option >> nth=1" });
await page.click(".kiosk-option >> nth=0");
await shot("11-totem-dni-vacio", { card: ".kiosk-card", input: "#kiosk-dni", submit: ".kiosk-submit" });
await page.fill("#kiosk-dni", "22863419");
await shot("12-totem-dni", { card: ".kiosk-card", input: "#kiosk-dni", submit: ".kiosk-submit" });
const dl = page.waitForEvent("download").catch(() => null);
await page.click(".kiosk-submit");
await dl;
await page.waitForSelector(".ticket-display");
await shot("13-totem-ticket", { card: ".kiosk-card", ticket: ".ticket-display", print: ".kiosk-download" });
await page.click(".kiosk-submit:not(.kiosk-download)");
await page.locator(".kiosk-switch").dispatchEvent("click");

// Reception
await page.click(".profile-card >> nth=1");
await page.waitForSelector(".reception-workspace");
await shot("20-recepcion", { workspace: ".reception-workspace", call: ".reception-queue-head button", next: ".reception-up-next", nav: ".sidebar nav" });
await page.click(".reception-queue-head button");
await page.waitForSelector(".reception-patient-card");
await shot("21-recepcion-llamado", { card: ".reception-patient-card", heading: ".reception-patient-heading", coverage: ".reception-section >> nth=1", turn: ".reception-section >> nth=2", payment: ".reception-payment", pay: ".payment-button" }, { fullPage: true });
await page.click(".payment-button");
await page.waitForSelector(".payment-modal");
await shot("22-recepcion-pago", { modal: ".payment-modal", confirm: ".payment-confirm" });
await page.click(".payment-confirm");
await page.waitForSelector(".toast-notification");
await page.evaluate(() => window.scrollTo(0, 0));
await shot("23-recepcion-pagado", { toast: ".toast-notification", workspace: ".reception-workspace" }, { settle: 300 });
await wait(4200);

await page.click(".nav-link >> text=Turnos del día");
await page.waitForSelector(".day-appointments-table");
await shot("24-turnos-dia", { table: ".day-appointments-table", filters: ".appointment-filter-row", toolbar: ".day-appointments-toolbar", firstRow: ".day-appointments-table tbody tr >> nth=0" });
await page.locator(".day-appointments-panel .table-wrap").evaluate((el) => { el.scrollLeft = el.scrollWidth; });
await shot("24b-turnos-acciones", { table: ".day-appointments-table", actions: ".appointment-actions >> nth=0" });
await page.locator(".day-appointments-panel .table-wrap").evaluate((el) => { el.scrollLeft = 0; });
await page.locator(".appointment-column-filter").nth(1).fill("Herrera");
await shot("25-turnos-filtro", { table: ".day-appointments-table", filters: ".appointment-filter-row" });
await page.locator(".appointment-column-filter").nth(1).fill("");

await page.click(".nav-link >> text=Ingreso manual");
await page.waitForSelector("#manual-patient-dni");
await shot("26-ingreso-manual", { panel: ".manual-entry-panel", input: "#manual-patient-dni", button: ".manual-entry-button" });
await page.fill("#manual-patient-dni", "41234567");
await page.click(".manual-entry-button");
await page.waitForSelector(".manual-entry-message");
await shot("27-ingreso-manual-ok", { panel: ".manual-entry-panel", message: ".manual-entry-message", input: "#manual-patient-dni" });
await page.click(".topbar .switch-profile");

// Professional queue
await page.click(".profile-card >> nth=0");
await page.waitForSelector(".queue-panel table", { timeout: 5000 });
await wait(900);
await shot("30-cola", { context: ".context-bar", stats: ".stat-grid", panel: ".queue-panel", table: ".queue-panel table", firstRow: ".queue-panel tbody tr >> nth=0", call: ".call-area button", note: ".call-note", nav: ".sidebar nav" });
await shot("30b-cola-full", { table: ".queue-panel table", call: ".call-area button", history: ".history-toggle", last: ".last-call-card" }, { fullPage: true });
await page.click(".call-area button");
await page.waitForSelector(".consultation-panel");
await page.evaluate(() => window.scrollTo(0, 0));
await shot("31-consulta-abierta", { header: ".page-header, .content-wrap > header", status: ".consultation-status", toast: ".toast-notification", fields: ".consultation-fields" }, { settle: 300 });
await wait(4300);
await shot("31b-consulta-full", {
  data: ".consultation-panel >> nth=0",
  turn: ".consultation-panel >> nth=1",
  history: ".consultation-history-panel",
  rx: ".prescription-panel",
  finish: ".consultation-finish-button",
}, { fullPage: true });
await page.click(".nav-link >> text=Pacientes en espera");
await page.waitForSelector(".last-call-card");
await page.click(".history-toggle");
await page.waitForSelector(".call-history");
await shot("32-cola-llamado-full", { table: ".queue-panel table", last: ".last-call-card", history: ".call-history", call: ".call-area button" }, { fullPage: true });
await page.click(".topbar .switch-profile");

// Waiting room
await page.click(".profile-card >> nth=2");
await page.waitForSelector(".public-screen");
await shot("40-sala", { screen: ".public-screen", call: ".public-call", number: ".no-call", name: ".public-patient-name", room: ".public-room", controls: ".screen-controls", full: ".fullscreen-toggle", sound: ".sound-toggle-icon", list: ".public-screen > :last-child", privacy: ".privacy-note" });
await page.click(".sound-toggle-icon");
await wait(300);
await shot("41-sala-sonido", { controls: ".screen-controls", sound: ".sound-toggle-icon" });
await page.click(".fullscreen-toggle");
await wait(1200);
await page.mouse.move(800, 450);
await shot("42-sala-completa", { screen: ".public-screen", controls: ".screen-controls", number: ".no-call", room: ".public-room" }, { settle: 600 });
await page.keyboard.press("Escape");
await wait(1200);
await page.locator(".switch-profile").first().dispatchEvent("click");

// Consultation finish / resume
await page.click(".profile-card >> nth=0");
await page.waitForSelector(".queue-panel");
await page.click(".nav-link >> text=Consulta médica");
await page.waitForSelector(".consultation-panel");
await page.click(".consultation-finish-button");
await page.waitForSelector(".consultation-session-note");
await page.evaluate(() => window.scrollTo(0, 0));
await shot("50-consulta-finalizada", { note: ".consultation-session-note", status: ".consultation-status", toast: ".toast-notification" }, { settle: 300 });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await shot("51-consulta-reanudar", { resume: ".consultation-final-actions button" });
await wait(4000);

await page.click(".nav-link >> text=Finalizados/Ausentes");
await page.waitForSelector(".finished-patients-table");
await page.evaluate(() => window.scrollTo(0, 0));
await shot("60-finalizados", { panel: ".finished-patients-panel", table: ".finished-patients-table", firstRow: ".finished-patients-table tbody tr >> nth=0", absent: ".finished-patient-status.is-absent", finished: ".finished-patient-status.is-finished" });
await page.click(".topbar .switch-profile");

// Admin
await page.click(".profile-card >> nth=3");
await page.waitForSelector(".admin-insights-grid");
await wait(1500);
await shot("70-admin", { stats: ".stat-grid", pie: ".admin-metric-card >> nth=0", network: ".network-health-card", activity: ".role-panel", nav: ".sidebar nav" });
await shot("70b-admin-full", { stats: ".stat-grid", pie: ".admin-metric-card >> nth=0", network: ".network-health-card", activity: ".role-panel" }, { fullPage: true });

fs.writeFileSync(path.join(OUT, "boxes.json"), JSON.stringify(boxes, null, 2));
await browser.close();
