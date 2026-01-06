"use client";
import { Select, type SelectOptionValue } from "@pickle/ui";
import { useState } from "react";

const TYPES = [
  { value: "all", label: "All Types" },
  { value: "bookmark", label: "Bookmark" },
  { value: "image", label: "Image" },
  { value: "text", label: "Text" },
];

export function ContentFilter() {
  const [selectTypes, setSelectTypes] = useState<SelectOptionValue>("all");
  return (
    <div className="flex items-center gap-2 pb-7.5">
      <Select
        value={selectTypes}
        onValueChange={setSelectTypes}
        options={TYPES}
      />
    </div>
  );
}
