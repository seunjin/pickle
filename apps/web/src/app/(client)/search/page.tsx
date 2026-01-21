import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSpinner } from "@/features/note/ui/PageSpinner";
import { SearchContent } from "./SearchContent";

export const metadata: Metadata = {
  title: "Search | Pickle",
};

export default function SearchPage() {
  return (
    <Suspense fallback={<PageSpinner pageType="client" />}>
      <SearchContent />
    </Suspense>
  );
}
