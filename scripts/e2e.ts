// Click-through test of the full demo flow against a running server.
// Usage: bun run start -- -p 3100 (in another shell), then bun scripts/e2e.ts [screenshot-dir]
import puppeteer, { type ElementHandle } from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const SHOTS = process.argv[2];
const CASE = "/cases/cd-2026-104582";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("response", (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));

let failures = 0;
const check = (ok: boolean, label: string) => {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failures++;
};
const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const shot = async (name: string) => SHOTS && (await page.screenshot({ path: `${SHOTS}/${name}.png` }));
const text = () => page.evaluate(() => document.body.innerText);
const path = () => page.evaluate(() => location.pathname);
const find = async (selector: string, label: string): Promise<ElementHandle<Element>> => {
  for (const h of await page.$$(selector)) if ((await h.evaluate((el) => el.textContent ?? "")).includes(label)) return h;
  throw new Error(`No ${selector} containing "${label}"`);
};
const clickText = async (selector: string, label: string) => {
  const h = await find(selector, label);
  await h.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await h.click();
};
// House style: no middle-dot separators or em/en dashes anywhere on screen.
const dashFree = async (where: string) => {
  const found = (await text()).match(/.{0,30}[·—–].{0,30}/);
  check(!found, `no "·" or dashes on ${where}${found ? `: "${found[0]}"` : ""}`);
};
const pageScrolls = () => page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 1);
const rowFor = (name: string) => find("tbody tr", name);
const sidebarState = () => page.$eval("[data-slot='sidebar'][data-state]", (el) => el.getAttribute("data-state"));
const outline = "nav[aria-label='Report steps']";
const viewer = "section[aria-label='Source documents']";
const viewerHeading = () => page.$eval(`${viewer} h2`, (el) => el.textContent ?? "");
const activeMark = () => page.$eval(`${viewer} mark.bg-cite`, (el) => el.textContent ?? "").catch(() => "");
const stepItem = (label: string) => find(`${outline} > ol > li`, label);

// Fresh state
await page.goto(`${BASE}/cases`, { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "load" });
await wait(600);

// --- App frame ---
check((await sidebarState()) === "expanded", "sidebar is expanded on the caseload");
await page.click("button[aria-label^='Notifications']");
await wait();
check((await text()).includes("Sentencing moved"), "bell opens notifications");
await page.keyboard.press("Escape");
await wait(300);
await page.click("button[aria-label^='Account']");
await wait();
check((await text()).includes("Probation Officer II"), "profile menu shows name and title");
await page.keyboard.press("Escape");
await wait(300);
await shot("00-caseload");
await dashFree("the caseload");

// --- Caseload ---
check((await page.$$("tbody tr")).length >= 10, "caseload shows a full list");
await page.keyboard.down("Meta");
await page.keyboard.press("k");
await page.keyboard.up("Meta");
await page.keyboard.type("torres");
await wait();
check((await page.$$("tbody tr")).length === 1, "⌘K focuses search, and search filters the caseload");
await page.click("input[type='search']", { count: 3 });
await page.keyboard.press("Backspace");
await wait();
const sample = await rowFor("Brianna L. Cho");
check((await sample.evaluate((el) => el.getAttribute("aria-disabled"))) === "true", "sample rows are marked disabled");
await sample.click();
await wait(400);
check((await path()) === "/cases", "clicking a sample row does nothing");

const demoRow = (await (await rowFor("Whitfield")).boundingBox())!;
await page.mouse.click(demoRow.x + demoRow.width * 0.45, demoRow.y + demoRow.height / 2);
await page.waitForFunction(() => location.pathname.endsWith("/start"));
await wait(500);
check((await text()).includes("How do you want to prepare this report?"), "opening a new case asks whether to use AI");
await clickText("button", "Start from AI drafts");
await page.waitForFunction(() => location.pathname.endsWith("/verify/case-information"));
await wait(700);
check(true, "choosing AI drafts opens step 1 on its first section");
check((await sidebarState()) === "expanded", "opening a case doesn't change the sidebar");
check((await page.$("input[type='search']")) === null, "search steps aside inside a case");
await page.click("[data-slot='sidebar'] [data-sidebar='trigger']");
await wait(400);
check((await sidebarState()) === "collapsed", "the toggle inside the sidebar collapses it");
check(!(await pageScrolls()), "case page itself does not scroll");
check((await page.$(outline)) !== null && (await page.$(viewer)) !== null, "outline, report and document column are all present");
await shot("01-verify");
await dashFree("step 1");

// --- Outline navigation ---
for (const t of ["Offense summary", "Defendant's statement", "Victim impact", "Case information"]) {
  await clickText(`${outline} a`, t);
  await wait(600);
  const h2 = await page.$eval("article h2", (el) => el.textContent);
  check(h2 === t && !(await pageScrolls()), `outline → "${t}"`);
}
check(
  (await page.$eval(`${outline} a[aria-current='step']`, (el) => el.textContent ?? "")).includes("Case information"),
  "outline marks the current section",
);
check((await (await stepItem("Sign and file")).$("[aria-disabled]")) !== null, "Sign and file is locked at the start");

// --- Activity log, from any step ---
await page.click("aside button[aria-label='Activity']");
await wait(500);
check((await text()).includes("Chose to start from AI drafts"), "Activity opens the case's log in a side panel");
await page.keyboard.press("Escape");
await wait(400);

// --- Document column ---
check((await viewerHeading()).startsWith("Source 1 of 8"), "section opens on its first source");
check((await activeMark()) === "DOB: 03/14/1995", "first source is highlighted in its document");
await page.click("article p > span:nth-child(3) span[title]");
await wait(500);
check(
  (await viewerHeading()).includes("Source 5 of 8") && (await viewerHeading()).includes("Court transcript"),
  "clicking a sentence opens its source document",
);
check((await activeMark()).startsWith("The People will move to dismiss Count 2"), "…with the exact passage highlighted");
await (await page.$$("article sup button"))[1].click();
await wait(500);
check((await viewerHeading()).startsWith("Source 2 of 8"), "clicking a citation number opens that source");
await page.click(`${viewer} button[aria-label='Next source']`);
await wait(400);
check((await viewerHeading()).startsWith("Source 3 of 8"), "next arrow steps to the following source");
await clickText(`${viewer} [role='tab']`, "Case notes");
await wait(300);
check(
  (await page.$eval(`${viewer} pre`, (el) => el.textContent ?? "")).includes("PROBATION CASE NOTES"),
  "document tabs browse any document",
);
await shot("02-document-column");

// --- AI disclosure ---
check((await text()).includes("AI-generated draft. It may contain errors."), "AI disclosure sits under the drafted text");
await clickText("article button", "AI draft");
await wait(400);
check((await text()).includes("How this draft was made"), "the AI draft label explains how it was produced");
await page.keyboard.press("Escape");
await wait(300);

// --- Editing ---
await page.click("article button[aria-label='Edit text']");
await wait();
const editorText = await page.$eval("article textarea", (el) => (el as HTMLTextAreaElement).value);
check(editorText.startsWith("Jordan Thomas Whitfield"), "Edit text opens pre-filled with the AI draft");
await page.keyboard.press("Escape");
await wait();
check((await page.$("article textarea")) === null, "Escape cancels the edit");

// --- Approve all six ---
const approveDisabled = await page.evaluate(
  () => [...document.querySelectorAll("article button")].find((b) => b.textContent?.includes("Approve"))?.hasAttribute("disabled"),
);
check(!!approveDisabled, "Approve is disabled before verifying");
for (let i = 0; i < 6; i++) {
  const before = await path();
  await page.click("article [data-slot='checkbox']");
  await wait(150);
  await clickText("article button", "Approve and continue");
  await page.waitForFunction((b) => location.pathname !== b, {}, before);
  await wait(600);
  check(!(await pageScrolls()), `approve section ${i + 1} → moves on, layout intact`);
}
check((await path()).endsWith("/assess"), "after the last section, step 2 opens");
check((await text()).includes("All facts verified"), "…with an 'All facts verified' confirmation");

// --- Step 2 ---
await (await page.$$("textarea"))[0].type("Mr. Whitfield accepted responsibility early and has stable housing with his sister.");
await clickText("button", "Mark as final");
await wait(300);
await (await page.$$("textarea"))[0].type("Formal probation with restitution of $720 and an alcohol assessment.");
await clickText("button", "Mark as final");
await wait(300);
check((await (await stepItem("Sign and file")).$("a")) !== null, "Sign and file unlocks after steps 1 and 2");
await shot("03-assess-done");
await dashFree("step 2");
await clickText("a", "Continue to sign");
await page.waitForFunction(() => location.pathname.endsWith("/sign"));
await wait();

// --- Step 3: draw a signature ---
const submitDisabled = () => page.$eval("form button[type='submit']", (b) => (b as HTMLButtonElement).disabled);
check(await submitDisabled(), "Sign is disabled before attesting and signing");
check((await text()).includes("Tick the statement above to sign"), "signature box says it's locked until the statement is ticked");
await page.click("label[for='attest']");
await wait(150);
check((await text()).includes("Sign here"), "ticking the statement unlocks the signature box");
await page.evaluate(() => document.querySelector("canvas")?.scrollIntoView({ block: "center" }));
await wait(300);
const pad = (await (await page.$("canvas"))!.boundingBox())!;
await page.mouse.move(pad.x + 40, pad.y + pad.height * 0.6);
await page.mouse.down();
for (let x = 40; x < 260; x += 8) await page.mouse.move(pad.x + x, pad.y + pad.height * (0.55 + 0.15 * Math.sin(x / 18)));
await page.mouse.up();
await wait(200);
check(!(await submitDisabled()), "drawing a signature enables Sign");
await shot("04-signature");
await dashFree("the sign page and full report");
await page.click("form button[type='submit']");
await page.waitForFunction(() => location.pathname.endsWith("/done"));
await wait();
const done = await text();
check(done.includes("Report signed and filed") && done.includes("Jamie Ramirez"), "success screen after signing");
check((await page.$("img[alt^='Signature of']")) !== null, "success screen shows the drawn signature");
check((await (await stepItem("Signed and filed")).$("a")) !== null, "outline shows the report as signed");
await shot("05-done");
await dashFree("the success screen");

// --- Back on the caseload (client-side, so the sidebar keeps its state) ---
await clickText("nav[aria-label='breadcrumb'] a, [data-slot='breadcrumb'] a", "My caseload");
await page.waitForFunction(() => location.pathname === "/cases");
await wait(600);
check((await sidebarState()) === "collapsed", "navigating doesn't re-expand the sidebar");
check((await (await rowFor("Whitfield")).evaluate((el) => el.textContent ?? "")).includes("Signed"), "caseload shows Whitfield as Signed");
await (await rowFor("M.R.")).click();
await page.waitForFunction(() => location.pathname.includes("jd-2026"));
await wait();
check((await text()).includes("AI drafting is not available"), "juvenile case is blocked");

// --- Reset ---
await page.goto(`${BASE}${CASE}/done`, { waitUntil: "load" });
await wait(600);
check((await page.$("[aria-label='Demo controls']")) !== null, "demo controls float outside the product UI");
await clickText("[aria-label='Demo controls'] button", "Reset");
await page.waitForFunction(() => location.pathname.endsWith("/start"));
await wait();
check((await (await stepItem("Verify facts")).evaluate((el) => el.textContent ?? "")).includes("0/6"), "reset clears progress and asks the AI question again");

// --- Writing without AI ---
await clickText("button", "Write it myself");
await page.waitForFunction(() => location.pathname.endsWith("/verify/case-information"));
await wait(700);
check((await (await stepItem("Write facts")).evaluate((el) => el.textContent ?? "")).includes("Write facts"), "manual mode renames step 1 to Write facts");
check((await page.$eval("article textarea", (el) => (el as HTMLTextAreaElement).value)) === "", "sections open as empty editors");
const articleText = await page.$eval("article", (el) => (el as HTMLElement).innerText);
check(
  !articleText.includes("AI draft") && articleText.includes("without AI assistance") && (await page.$eval(`${viewer} h2`, (el) => el.textContent)) === "Case documents",
  "no AI labels or citations; documents still beside you",
);
await page.type("article textarea", "Jordan Thomas Whitfield, 31, pleaded guilty to second-degree commercial burglary.");
await clickText("article button", "Approve and continue");
await page.waitForFunction(() => location.pathname.endsWith("/offense-summary"));
await wait(500);
check(true, "a hand-written section can be approved");

// Turn AI back on: untouched sections get drafts, the hand-written one is kept
await clickText("aside button", "Turn on");
await wait(500);
check((await text()).includes("AI-generated draft"), "turning AI on fills untouched sections with drafts");
await clickText(`${outline} a`, "Case information");
await wait(500);
check((await text()).includes("pleaded guilty to second-degree commercial burglary."), "…and keeps what the officer wrote");

// Turn it off again, through the confirmation
await clickText("aside button", "Turn off");
await wait(400);
check((await text()).includes("Turn off AI drafting?"), "turning AI off asks for confirmation");
await clickText("[role='dialog'] button", "Turn off");
await wait(500);
check((await (await stepItem("Write facts")).evaluate((el) => el.textContent ?? "")).includes("Write facts"), "AI drafting is off again");

// Reset stays put on the caseload
await page.goto(`${BASE}/cases`, { waitUntil: "load" });
await wait(500);
await clickText("[aria-label='Demo controls'] button", "Reset");
await page.waitForNavigation({ waitUntil: "load" });
await wait(500);
check((await path()) === "/cases", "reset from the caseload stays on the caseload");
check((await (await rowFor("Whitfield")).evaluate((el) => el.textContent ?? "")).includes("Not started"), "…and the demo case is back to Not started");

check(errors.length === 0, `no page errors${errors.length ? `: ${errors.join(" | ")}` : ""}`);
await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
