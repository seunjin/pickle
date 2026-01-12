import type { NoteWithAsset } from "@pickle/contracts";
import { createContext } from "react";

export interface NoteContextValue {
  notes: NoteWithAsset[];
  readOnly: boolean;
}

export const NoteContext = createContext<NoteContextValue | null>(null);
