import type { Metadata } from "next";
import { LegalContent } from "@/app/(client)/legal/LegalContent";

export const metadata: Metadata = {
  title: "Terms | Pickle",
  description: "Pickle 서비스의 이용약관 및 개인정보처리방침 안내입니다.",
};

export default function TermsIndexPage() {
  return (
    <div className="effect-bg h-dvh p-10">
      <LegalContent pagePath="terms" />
    </div>
  );
}
