import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Public_Sans, Source_Serif_4 } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// Public Sans is the U.S. Web Design System typeface; Source Serif sets the report itself.
const publicSans = Public_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Groundwork: Pre-Sentence Report Drafting (Demo)", template: "%s | Groundwork" },
  description:
    "Demonstration prepared in response to the County of San Diego Probation AI Report Writing Services RFP. Fictional data.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
