# Build Plan: Groundwork — Pre-Sentence Report Drafting Assistant

Demo response to San Diego County Probation's _AI Report Writing Services_ RFP. See [RFP.md](RFP.md) for what we know about the RFP.

## 1. What we're building

**Groundwork** is a desktop web app where a probation officer opens an assigned case, gets AI-drafted factual sections of a pre-sentence report built from the case documents, and must read, verify, edit, and approve every section before signing. The officer writes the evaluation and recommendation and owns the report.

**The pitch in one line:** AI does the reading and restating; officers do the judging.

### Design principles (each maps to the RFP)

| Principle | RFP source |
|---|---|
| AI does extraction, summarization, drafting only | Listing scope: "data extraction, summarization, and drafting" |
| AI never writes the evaluation or recommendation | Draft contract: AI cannot make sentencing recommendations |
| Officer reviews and approves every section | Listing: "preserving officer decision-making authority" |
| Every AI statement links to its source passage | Supervisor's call for accuracy, error testing, human oversight |
| Juvenile-defendant cases are blocked | Draft contract: not used for juvenile defendant reports |
| Use is optional (officer can write a section from scratch) | Draft contract: use is optional |
| Every action recorded in a history | Oversight and due process |

## 2. Branding

Source: [County branding page](https://www.sandiegocounty.gov/content/sdc/cco/branding.html). It provides a logo and a palette; no typography or vendor rules. The official seal is reserved for formal documents, so we don't use it.

| County color | Hex | Job in the app |
|---|---|---|
| San Diego Bay Blue | `#005F9D` | Primary buttons, app header |
| Mountain Shadow Grey | `#5A5A5C` | Body text, muted text |
| Local Citrus Orange | `#FF9E1B` | "Needs review" state on AI suggestions |
| Administration Center Peach | `#FCE1C9` | Background behind AI-suggested text |
| Rolling Hills Green | `#657A38` | "Approved" state |
| Western Bluebird Blue | `#00AEEF` | Focus rings, citation highlight |
| Sagebrush Green | `#A6BB49` | Unused, or progress accents |

- Colors are applied via shadcn theme tokens, not one-off styles
- **No county logo inside the app.** The header reads "Groundwork · Prepared for County of San Diego Probation"
- The logo appears only on the intro page, as "Prepared for", next to a clear "Demonstration with fictional data, not a County system" note

## 3. Screens

### 3.1 Intro (`/`): an add-on, not part of the app
Styled as a plain proposal cover in neutral black on white, with no app header or navigation and no county colors apart from the "Prepared for" logo.
- What the County asked for (buyer, scope quote, deadline), linking to sources
- What this demo shows: 3–4 bullets
- What's simulated: sample cases, fictional data, no County system connections, drafts produced ahead of time
- **Enter demo** button → caseload
- Inside the app, a small "About this demo" button in a corner leads back here

### 3.2 Caseload (`/cases`)
The officer's queue, as if pulled from the County case management system.
- Table: case number, defendant (fictional), charge, sentencing date, report due, status
- Status badges: Not started / In review / Ready to sign / Signed
- A small "Synced from case management system (simulated)" note
- Two cases: the main adult case, and a **juvenile defendant** case that opens to a blocked screen explaining why

### 3.3 Case workspace (`/cases/[id]`): the core screen
Two-column desktop layout.

**Left: source documents** (tabs: Police report · Court transcript · Case notes · Criminal history)
- Full text, read-only
- Clicking a citation scrolls here and highlights the passage
- Small "+ Add document" button (stub, shows a toast)

**Right: draft report**, one card per section:

| Section | Who writes it |
|---|---|
| Case information | AI suggests |
| Offense summary | AI suggests |
| Defendant's statement | AI suggests |
| Prior criminal record | AI suggests |
| Personal & social history | AI suggests |
| Victim impact | AI suggests |
| Officer's evaluation | **Officer only** |
| Recommendation | **Officer only** |

Each AI section card:
- **State badge:** `Needs review` (orange) → `Edited` → `Approved` (green)
- AI text sits on a peach background labeled "Suggested by AI" until approved
- **Citation chips** `[1]` after each statement
  - **Click** → popover with the document name and the exact quoted passage, plus "Open in document", which scrolls the left panel to the highlighted passage
- **Edit** → switches to a textarea; edits mark the section `Edited`
- **Approve** → disabled until the officer ticks _"I have verified this section against the source documents"_
- **Write my own** → discard the suggestion and start blank (optional use)
- No "Accept all" anywhere

Officer-only cards: empty textarea, a lock icon, and the line _"Per County policy, AI does not draft evaluations or sentencing recommendations."_

**Header:** case summary, progress (e.g. "4 of 8 sections approved"), **Review & sign** button (disabled until complete).

**History tab:** timeline of events: draft generated, section edited (before/after), approved, signed. Timestamped, attributed to officer or AI.

### 3.4 Review & sign (dialog)
- Read-only full report
- Checklist: all sections approved ✓, evaluation and recommendation written ✓
- Attestation: _"I am the author of this report. I have reviewed all AI-suggested content against the source documents and take responsibility for its accuracy."_ + typed name
- **Sign report** → status becomes Signed, history logs it, confirmation toast

## 4. Sample data
All fictional, clearly labeled, in `/data`.

| Case | Purpose |
|---|---|
| Case A: adult, moderate prior record | The full flow, used in the Loom |
| Case B: **juvenile defendant** | Caseload entry + blocked screen only; no documents |

Case A has 4 documents (police report, court transcript, case notes, criminal history), about 1–2 pages each.

## 5. How the drafts are made

No live AI in the deployed app and no API key.

1. Claude (in this Claude Code session) writes the six AI sections from Case A's documents. Each statement carries the **exact quote** it relies on, plus the document it's from.
2. A script **verifies every quote appears verbatim** in its source document and computes the character range used for highlighting. Any quote that doesn't match fails the build, so a citation can't point to text that isn't there.
3. The verified draft is saved as `/data/drafts/case-a.json` and loaded by the app.

**How to describe it in the Loom:** the drafts were generated by Claude and every citation is machine-checked against the source. In production, the same step runs server-side through the Claude API's citations feature, inside the County's environment.

Drafting rules for the AI sections: factual, neutral, past tense; only what's in the documents; no opinions on sentencing, risk or credibility; "not found in the documents" rather than guessing.

## 6. Tech stack
- Next.js (App Router) + TypeScript, run with **Bun** (the only JS runtime installed)
- Tailwind + **shadcn/ui only** for every UI element: `Card`, `Badge`, `Button`, `Tabs`, `Table`, `Popover`, `Textarea`, `Checkbox`, `Dialog`, `Alert`, `Progress`, `ScrollArea`, `Separator`, `Tooltip`, `Sonner` (toasts), `Resizable`, `Input`, `Label`
- State: React state + `localStorage` per browser so a refresh doesn't lose progress. No database.
- Desktop-first (≥1280px). The layout shouldn't break when narrower, but no mobile design.
- Deploy: Vercel, static-friendly, no env vars

## 7. Out of scope (say so in the Loom)
- Live AI generation, real County system integrations, login, roles
- Persistence across users or devices
- Exporting to the court's report format
- Bias/fairness evaluation tooling (mention as part of the proposed rollout)
- Mobile/tablet

## 8. Build order

| Step | What | Done when |
|---|---|---|
| 1 | Scaffold Next.js + shadcn, County theme tokens | App runs locally |
| 2 | Write Case A documents + Case B caseload entry | `/data` populated |
| 3 | Write Case A drafts with quotes; verification script computes ranges | Script passes, `case-a.json` written |
| 4 | Intro + caseload screens | Clickable from `/` to a case |
| 5 | Case workspace: documents panel, section cards, citation popovers, highlight-in-document | Can verify a citation end to end |
| 6 | Edit / approve / write-my-own, officer-only sections, progress | Can approve all sections |
| 7 | Review & sign, history tab, juvenile block | Full flow works |
| 8 | Deploy to Vercel | Public URL works |
| 9 | Record Loom | Done |

**Stop rule:** if we're running long, cut the history tab first. Steps 1–7 is a complete demo.

## 9. Loom outline (~4 min, for a probation director)
1. **The problem (20s):** ~7,800 reports a year and hours spent pulling facts out of documents
2. **Intro screen (15s):** what the County asked for
3. **Caseload (20s):** cases arrive with documents attached
4. **Workspace (90s):** AI suggestion → click a citation → see the exact passage → edit → verify → approve
5. **Guardrails (45s):** officer-only evaluation and recommendation, juvenile block, no "accept all", history
6. **Sign (20s):** attestation; responsibility stays with the officer
7. **Rollout (30s):** County system integrations, pilot with a few officers, annual bias review, County-only data
