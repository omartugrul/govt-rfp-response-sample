// Verifies every citation in a case's draft.source.json appears verbatim, exactly once,
// in its source document, then writes draft.json with the documents and character ranges for highlighting.
// Usage (from the repo root): bun scripts/build-drafts.ts case-a
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type SourceCite = { doc: string; quote: string };
type SourceDraft = {
  generatedBy: string;
  sections: { id: string; segments: { text: string; cites: SourceCite[] }[] }[];
};

const caseId = process.argv[2];
if (!caseId) throw new Error("Usage: bun scripts/build-drafts.ts <case-id>");

const dir = join(process.cwd(), "src", "data", caseId);
const source: SourceDraft = JSON.parse(readFileSync(join(dir, "draft.source.json"), "utf8"));
const docs = new Map<string, string>();
const loadDoc = (id: string) => {
  if (!docs.has(id)) docs.set(id, readFileSync(join(dir, `${id}.txt`), "utf8"));
  return docs.get(id)!;
};

const errors: string[] = [];
let count = 0;

const sections = source.sections.map((section) => ({
  id: section.id,
  segments: section.segments.map((segment) => ({
    text: segment.text,
    cites: segment.cites.map(({ doc, quote }) => {
      const text = loadDoc(doc);
      const start = text.indexOf(quote);
      if (start === -1) errors.push(`[${section.id}] not found in ${doc}: "${quote}"`);
      else if (text.indexOf(quote, start + 1) !== -1)
        errors.push(`[${section.id}] ambiguous (appears more than once) in ${doc}: "${quote}"`);
      count++;
      return { doc, quote, start, end: start + quote.length };
    }),
  })),
}));

if (errors.length) {
  console.error(`✗ ${errors.length} citation(s) failed verification:\n` + errors.join("\n"));
  process.exit(1);
}

writeFileSync(
  join(dir, "draft.json"),
  JSON.stringify(
    {
      generatedBy: source.generatedBy,
      verifiedAt: new Date().toISOString(),
      citationCount: count,
      documents: Object.fromEntries(docs),
      sections,
    },
    null,
    2,
  ) + "\n",
);
console.log(`✓ ${count} citations verified verbatim across ${sections.length} sections → ${caseId}/draft.json`);
