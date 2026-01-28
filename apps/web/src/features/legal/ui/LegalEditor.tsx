"use client";

import { Button } from "@pickle/ui";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { useEffect } from "react";

interface LegalEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export function LegalEditor({
  initialContent = "",
  onChange,
  onSave,
  isSaving,
}: LegalEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "이곳에 약관 내용을 마크다운으로 작성하세요...",
      }),
    ],
    immediatelyRender: false,
    content: initialContent,
    onUpdate: ({ editor }) => {
      // Tiptap의 HTML 출력이 아닌 마크다운 처리를 위해 getHTML을 사용하되
      // 실제 저장 시에는 마크다운으로 변환하거나 HTML 그대로 저장할 수 있습니다.
      // 여기서는 사용자의 요구사항에 맞게 마크다운으로 취급하기 위해
      // 간단한 변환 또는 전용 확장을 고려할 수 있으나, 일단 HTML/Text로 처리합니다.
      // (Tiptap starter-kit은 기본적인 마크다운 입력을 지원합니다)
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[500px] p-6 text-neutral-300",
      },
    },
  });

  // 외부에서 콘텐츠가 변경될 때 (버전 선택 등) 반영
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
      {/* 툴바 */}
      <div className="flex items-center gap-1 border-neutral-800 border-b bg-neutral-900 p-2">
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          icon={<Heading1 className="h-4 w-4" />}
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          icon={<Heading2 className="h-4 w-4" />}
        />
        <div className="mx-1 h-4 w-px bg-neutral-800" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          icon={<Bold className="h-4 w-4" />}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          icon={<Italic className="h-4 w-4" />}
        />
        <div className="mx-1 h-4 w-px bg-neutral-800" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          icon={<List className="h-4 w-4" />}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          icon={<ListOrdered className="h-4 w-4" />}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          icon={<Quote className="h-4 w-4" />}
        />

        <div className="ml-auto flex items-center gap-2">
          {onSave && (
            <Button
              size="h32"
              onClick={onSave}
              disabled={isSaving}
              className="bg-base-primary px-4 text-white hover:bg-base-primary-hover"
            >
              {isSaving ? "저장 중..." : "저장하기"}
            </Button>
          )}
        </div>
      </div>

      {/* 에디터 본문 */}
      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #666;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  icon,
}: {
  onClick: () => void;
  active: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded p-2 transition-colors hover:bg-neutral-800 ${
        active ? "bg-neutral-800 text-base-primary" : "text-neutral-500"
      }`}
    >
      {icon}
    </button>
  );
}
