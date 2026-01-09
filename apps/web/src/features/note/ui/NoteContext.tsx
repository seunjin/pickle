import type { NoteWithAsset } from "@pickle/contracts";
import { createContext } from "react";

interface NoteContextValue {
  notes: NoteWithAsset[];
  readonly: boolean;
}

export const NoteContext = createContext<NoteContextValue | null>(null);
