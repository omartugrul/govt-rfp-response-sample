export type SectionDef = {
  id: string;
  title: string;
  author: "ai" | "officer";
  hint?: string;
};

export const SECTIONS: SectionDef[] = [
  { id: "case-information", title: "Case information", author: "ai" },
  { id: "offense-summary", title: "Offense summary", author: "ai" },
  { id: "defendant-statement", title: "Defendant's statement", author: "ai" },
  { id: "prior-record", title: "Prior criminal record", author: "ai" },
  { id: "social-history", title: "Personal & social history", author: "ai" },
  { id: "victim-impact", title: "Victim impact", author: "ai" },
  {
    id: "evaluation",
    title: "Officer's evaluation",
    author: "officer",
    hint: "Weigh the facts above: circumstances in aggravation and mitigation, suitability for supervision, needs and resources.",
  },
  {
    id: "recommendation",
    title: "Recommendation",
    author: "officer",
    hint: "Your sentencing recommendation to the court, including any proposed terms and conditions.",
  },
];
