import type { Metadata } from "next";
import { LegalContent } from "./LegalContent";

export const metadata: Metadata = {
  title: "Terms | Pickle",
};

export default function LegalPage() {
  return <LegalContent pagePath="legal" />;
}
