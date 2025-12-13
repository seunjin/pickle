import type { CreateNoteInput, Note } from "@pickle/contracts/src/note";

export async function saveNote(note: CreateNoteInput): Promise<Note> {
  // Delegate the actual API call to the Background Script to avoid Mixed Content (HTTPS -> HTTP) issues.
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "SAVE_NOTE", note }, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      if (response.success) {
        resolve(response.data);
      } else {
        reject(
          new Error(response.error || "Failed to save note via background."),
        );
      }
    });
  });
}
