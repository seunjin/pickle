"use client";

import type { NoteWithAsset } from "@pickle/contracts";
import { ScrollArea } from "@pickle/ui";
import { AnimatePresence, motion } from "motion/react";
import { useNoteDetail } from "./model/useNoteDetail";
import { NoteDetailActions } from "./ui/NoteDetailActions";
import { NoteFormFields } from "./ui/NoteFormFields";
import { NoteMetadataView } from "./ui/NoteMetadataView";
import { NoteThumbnailView } from "./ui/NoteThumbnailView";
import { ThumbnailExpandedView } from "./ui/ThumbnailExpandedView";

interface NoteDetailDrawerProps {
  note: NoteWithAsset;
  readOnly?: boolean;
}

export function NoteDetailDrawer({ note, readOnly }: NoteDetailDrawerProps) {
  const {
    isOpen,
    zIndex,
    unmount,
    currentNote,
    localNote,
    setLocalNote,
    errors,
    allTags,
    folders,
    isTagMakerOpen,
    setIsTagMakerOpen,
    thumbnailDetailOpen,
    setThumbnailDetailOpen,
    isSavePending,
    isValid,
    hasAssetType,
    canExpandThumbnail,
    handleClose,
    handleSave,
    handleDownload,
    createTagMutation,
    updateTagMutation,
    deleteTagMutation,
    deleteNote,
    close,
  } = useNoteDetail({ note });

  return (
    <AnimatePresence onExitComplete={unmount}>
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-end"
          style={{ zIndex: zIndex }}
        >
          {/* overlay */}
          <motion.div
            className="absolute inset-0 z-10 bg-neutral-950/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />

          {/* Thumbnail Detail (Expanded) */}
          <motion.div
            className="relative z-20 flex h-[calc(100%-30px)] w-[calc(calc(100dvh-30px)+15px+360px+15px)] justify-end gap-[15px] px-[15px]"
            initial={
              thumbnailDetailOpen ? { opacity: 0, x: "100%" } : undefined
            }
            animate={thumbnailDetailOpen ? { opacity: 1, x: 0 } : undefined}
            exit={thumbnailDetailOpen ? { opacity: 0, x: "100%" } : undefined}
            transition={thumbnailDetailOpen ? { duration: 0.5 } : undefined}
            onClick={(_e) => {
              if (thumbnailDetailOpen) {
                setThumbnailDetailOpen(false);
              } else {
                handleClose();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                if (thumbnailDetailOpen) {
                  setThumbnailDetailOpen(false);
                } else {
                  handleClose();
                }
              }
            }}
            role="button"
            tabIndex={-1}
            aria-label="닫기"
          >
            <ThumbnailExpandedView
              note={note}
              isOpen={thumbnailDetailOpen}
              onClose={() => setThumbnailDetailOpen(false)}
              hasAssetType={hasAssetType}
              onDownload={handleDownload}
            />

            {/* drawer */}
            <motion.div
              className="relative z-30 grid h-full w-90 shrink-0 grid-rows-[auto_1fr_auto] rounded-[16px] border border-base-border-light bg-base-foreground-background py-5 shadow-standard"
              initial={
                !thumbnailDetailOpen ? { opacity: 0, x: "100%" } : undefined
              }
              animate={!thumbnailDetailOpen ? { opacity: 1, x: 0 } : undefined}
              exit={
                !thumbnailDetailOpen ? { opacity: 0, x: "100%" } : undefined
              }
              transition={!thumbnailDetailOpen ? { duration: 0.3 } : undefined}
              onClick={(e) => {
                e.stopPropagation();
              }}
              role="presentation"
            >
              {/* drawer content */}
              <ScrollArea className="h-full overflow-auto">
                <NoteThumbnailView
                  note={note}
                  canExpand={canExpandThumbnail}
                  onExpand={() => setThumbnailDetailOpen(true)}
                />

                <NoteFormFields
                  note={note}
                  currentNote={currentNote}
                  localNote={localNote}
                  setLocalNote={setLocalNote}
                  errors={errors}
                  allTags={allTags}
                  folders={folders}
                  isTagMakerOpen={isTagMakerOpen}
                  setIsTagMakerOpen={setIsTagMakerOpen}
                  readOnly={readOnly}
                  onCreateTag={async (name, style) => {
                    const newTag = await createTagMutation.mutateAsync({
                      name,
                      style,
                    });
                    return newTag.id;
                  }}
                  onUpdateTag={(tagId, updates) =>
                    updateTagMutation.mutate({ tagId, updates })
                  }
                  onDeleteTag={(tagId) => deleteTagMutation.mutate(tagId)}
                />

                <NoteMetadataView note={note} />
              </ScrollArea>

              {/* drawer footer */}
              <NoteDetailActions
                noteId={note.id}
                isSavePending={isSavePending}
                isValid={isValid}
                onSave={handleSave}
                onDelete={async (id) => {
                  await deleteNote(id);
                }}
                onClose={close}
                readOnly={readOnly}
              />
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
