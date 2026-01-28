"use client";

import type {
  LegalDocument,
  LegalDocumentType,
} from "@pickle/contracts/src/legal";
import { toast } from "@pickle/ui";
import { CheckCircle2, History, Plus, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getLegalDocuments } from "../api/getLegalDocuments";
import { upsertLegalDocument } from "../api/upsertLegalDocument";
import { LegalEditor } from "./LegalEditor";

const LegalTypes = [
  { label: "서비스 이용약관", value: "service" },
  { label: "개인정보처리방침", value: "privacy" },
  { label: "마케팅 수신 동의", value: "marketing" },
];

export function LegalAdminContent() {
  const [selectedType, setSelectedType] =
    useState<LegalDocumentType>("service");
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editContent, setEditContent] = useState("");

  // 약관 목록 로드
  const loadDocuments = useCallback(async (type: LegalDocumentType) => {
    setIsLoading(true);
    try {
      const data = await getLegalDocuments(type);
      setDocuments(data);

      // 활성화된 문서가 있으면 기본 선택
      const activeDoc = data.find((doc) => doc.is_active) || data[0] || null;
      setSelectedDoc(activeDoc);
      setEditContent(activeDoc?.content || "");
    } catch (_error) {
      toast.error({ title: "약관 목록을 불러오지 못했습니다." });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments(selectedType);
  }, [selectedType, loadDocuments]);

  const handleCreateNew = () => {
    const today = new Date().toISOString().split("T")[0];
    const newDoc: Partial<LegalDocument> = {
      type: selectedType,
      version: `${today}-new`,
      title: `${LegalTypes.find((t) => t.value === selectedType)?.label} (${today})`,
      content: "",
      is_active: false,
    };
    setSelectedDoc(newDoc as LegalDocument);
    setEditContent("");
  };

  const handleSave = async () => {
    if (!selectedDoc) return;

    setIsSaving(true);
    try {
      await upsertLegalDocument({
        ...selectedDoc,
        content: editContent,
      });
      toast.success({ title: "약관이 저장되었습니다." });
      loadDocuments(selectedType);
    } catch (_error) {
      toast.error({ title: "저장에 실패했습니다." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async (doc: LegalDocument) => {
    try {
      await upsertLegalDocument({
        ...doc,
        is_active: true,
      });
      toast.success({ title: "해당 버전이 활성화되었습니다." });
      loadDocuments(selectedType);
    } catch (_error) {
      toast.error({ title: "활성화에 실패했습니다." });
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-white">약관 버전 관리</h1>
          <p className="mt-1 text-neutral-400 text-sm">
            마크다운 에디터를 통해 서비스 약관을 작성하고 버전을 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadDocuments(selectedType)}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800"
          >
            <RefreshCcw className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-white transition-colors hover:bg-neutral-700"
          >
            <Plus className="h-4 w-4" />새 버전 작성
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-12 gap-8">
        {/* 사이드바: 유형 선택 및 버전 현황 */}
        <div className="col-span-12 flex flex-col gap-6 overflow-y-auto pr-2 lg:col-span-3">
          <section>
            <div className="mb-2 block font-semibold text-neutral-500 text-xs uppercase tracking-wider">
              약관 유형
            </div>
            <div className="flex flex-col gap-1">
              {LegalTypes.map((type) => (
                <button
                  type="button"
                  key={type.value}
                  onClick={() =>
                    setSelectedType(type.value as LegalDocumentType)
                  }
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all ${
                    selectedType === type.value
                      ? "border border-base-primary/20 bg-base-primary/10 font-semibold text-base-primary"
                      : "text-neutral-400 hover:bg-neutral-800"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </section>

          <section className="flex min-h-0 flex-1 flex-col">
            <div className="mb-2 flex items-center gap-2 font-semibold text-neutral-500 text-xs uppercase tracking-wider">
              <History className="h-3 w-3" />
              히스토리
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto pr-2">
              {documents.map((doc) => (
                <button
                  type="button"
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setEditContent(doc.content);
                  }}
                  className={`group rounded-xl border p-3 text-left transition-all ${
                    selectedDoc?.id === doc.id
                      ? "border-neutral-700 bg-neutral-800 ring-1 ring-base-primary/50"
                      : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`font-medium text-sm ${selectedDoc?.id === doc.id ? "text-white" : "text-neutral-300"}`}
                    >
                      {doc.version}
                    </span>
                    {doc.is_active && (
                      <span className="flex items-center gap-1 rounded-full bg-base-primary/20 px-1.5 py-0.5 font-bold text-[10px] text-base-primary uppercase">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-1 text-neutral-500 text-xs">
                    {doc.title}
                  </p>

                  {!doc.is_active && selectedDoc?.id === doc.id && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivate(doc);
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-neutral-700 py-1.5 font-bold text-[11px] text-white opacity-0 transition-all hover:bg-base-primary group-hover:opacity-100"
                    >
                      <CheckCircle2 className="h-3 w-3" />이 버전으로 활성화
                    </button>
                  )}
                </button>
              ))}
              {documents.length === 0 && !isLoading && (
                <div className="rounded-xl border border-neutral-800 border-dashed py-12 text-center text-neutral-600">
                  <p className="text-xs">내역이 없습니다.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* 에디터 영역 */}
        <div className="col-span-12 flex min-h-0 flex-col gap-4 lg:col-span-9">
          {selectedDoc ? (
            <>
              <div className="flex items-center gap-4 rounded-xl border border-neutral-800/50 bg-neutral-900/30 p-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={selectedDoc.title}
                    onChange={(e) =>
                      setSelectedDoc({ ...selectedDoc, title: e.target.value })
                    }
                    placeholder="약관 제목"
                    className="w-full border-none bg-transparent p-0 font-bold text-lg text-white focus:ring-0"
                  />
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-neutral-500 text-xs">Version</span>
                    <input
                      type="text"
                      value={selectedDoc.version}
                      onChange={(e) =>
                        setSelectedDoc({
                          ...selectedDoc,
                          version: e.target.value,
                        })
                      }
                      placeholder="v1.0.0"
                      className="rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-neutral-300 text-xs focus:border-base-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <LegalEditor
                initialContent={editContent}
                onChange={setEditContent}
                onSave={handleSave}
                isSaving={isSaving}
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-neutral-800 border-dashed bg-neutral-900/20 text-neutral-600">
              <History className="mb-4 h-12 w-12 opacity-10" />
              <p>좌측에서 버전을 선택하거나 새 버전을 작성하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
