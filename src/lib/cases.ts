import caseADraft from "@/data/case-a/draft.json";

export type DocId = "police-report" | "court-transcript" | "case-notes" | "criminal-history";

export type Citation = { doc: DocId; quote: string; start: number; end: number };
export type Segment = { text: string; cites: Citation[] };
export type DraftSection = { id: string; segments: Segment[] };

export type CaseDraft = {
  generatedBy: string;
  verifiedAt: string;
  citationCount: number;
  documents: Record<DocId, string>;
  sections: DraftSection[];
};

export type CaseRecord = {
  id: string;
  caseNumber: string;
  defendant: string;
  age: number;
  charge: string;
  sentencingDate: string;
  reportDue: string;
  /** ISO date the report is due, for sorting and "days left". */
  dueDate: string;
  /** Short charge label for the caseload. */
  chargeShort: string;
  juvenile: boolean;
  draft?: CaseDraft;
  /** Background caseload record: shown for realism, not interactive in the demo. */
  sample?: { status: "Not started" | "In review" | "Ready to sign" | "Signed" };
};

export const DOCUMENTS: { id: DocId; title: string; source: string }[] = [
  { id: "police-report", title: "Police report", source: "Sheriff's Dept. records" },
  { id: "court-transcript", title: "Court transcript", source: "Superior Court" },
  { id: "case-notes", title: "Case notes", source: "Probation case management" },
  { id: "criminal-history", title: "Criminal history", source: "Statewide criminal history" },
];

export const docTitle = (id: DocId) => DOCUMENTS.find((d) => d.id === id)!.title;

export const CASES: CaseRecord[] = [
  {
    id: "cd-2026-104582",
    caseNumber: "CD-2026-104582",
    defendant: "Jordan T. Whitfield",
    age: 31,
    charge: "PC 459 — Burglary, 2nd degree (commercial)",
    sentencingDate: "Oct 23, 2026",
    reportDue: "Oct 13, 2026",
    dueDate: "2026-10-13",
    chargeShort: "Commercial burglary",
    juvenile: false,
    draft: caseADraft as CaseDraft,
  },
  {
    id: "jd-2026-007731",
    caseNumber: "JD-2026-007731",
    defendant: "M.R. (minor)",
    age: 16,
    charge: "PC 488 — Petty theft",
    sentencingDate: "Oct 28, 2026",
    reportDue: "Oct 19, 2026",
    dueDate: "2026-10-19",
    chargeShort: "Petty theft",
    juvenile: true,
  },
  ...(
    [
      ["Alicia M. Torres", "CD-2026-101377", "Grand theft", "2026-10-02", "Ready to sign"],
      ["Kevin D. Okafor", "CD-2026-102915", "DUI causing injury", "2026-10-05", "In review"],
      ["Samuel R. Petrov", "CD-2026-099842", "Felony vandalism", "2026-10-07", "In review"],
      ["Brianna L. Cho", "CD-2026-105230", "Identity theft", "2026-10-14", "Not started"],
      ["Darnell K. Hughes", "CD-2026-105871", "Possession for sale", "2026-10-21", "Not started"],
      ["Elena V. Ruiz", "CD-2026-106044", "Assault with a deadly weapon", "2026-10-26", "Not started"],
      ["Thomas G. Becker", "CD-2026-106392", "Receiving stolen property", "2026-10-29", "Not started"],
      ["Marcus A. Bell", "CD-2026-098113", "Residential burglary", "2026-09-28", "Signed"],
      ["Priya N. Sharma", "CD-2026-097640", "Embezzlement", "2026-09-24", "Signed"],
    ] as const
  ).map(([defendant, caseNumber, chargeShort, dueDate, status]) => ({
    id: caseNumber.toLowerCase(),
    caseNumber,
    defendant,
    age: 0,
    charge: chargeShort,
    chargeShort,
    sentencingDate: "",
    reportDue: new Date(`${dueDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    dueDate,
    juvenile: false,
    sample: { status },
  })),
];

/** Fixed "today" for the demo so due-date wording stays stable in recordings. */
export const DEMO_TODAY = "2026-10-01";

export const getCase = (id: string) => CASES.find((c) => c.id === id);

export const OFFICER = "Jamie Ramirez";
export const OFFICER_TITLE = "Probation Officer II";
export const OFFICER_UNIT = "Adult Field Services";
