import type { Database } from "@pickle/contracts";
import { ActionButton, Button, Spinner, toast } from "@pickle/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { approveApplication } from "@/features/admin/api/approveApplication";
import { getApplications } from "@/features/admin/api/getApplications";
import { rejectApplication } from "@/features/admin/api/rejectApplication";
import { createClient } from "@/shared/lib/supabase";

type Application = Database["public"]["Tables"]["beta_applications"]["Row"];

export const Route = createFileRoute("/admin/waitlist")({
  component: AdminWaitlistPage,
});

function AdminWaitlistPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const loadApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getApplications(supabase);
      setApplications(data || []);
    } catch (_error) {
      toast.error({ title: "데이터 로드 실패" });
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleApprove = async (id: string, email: string) => {
    try {
      await approveApplication(supabase, { id, email });
      toast.success({
        title: "승인 완료",
        description: `${email} 주소가 화이트리스트에 추가되었습니다.`,
      });
      loadApplications();
    } catch (_error) {
      toast.error({ title: "승인 실패" });
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("정말 거절하시겠습니까?")) return;
    try {
      await rejectApplication(supabase, { id });
      toast.success({ title: "거절 처리 완료" });
      loadApplications();
    } catch (_error) {
      toast.error({ title: "거절 실패" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info({ title: "복사되었습니다", description: text });
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-3xl text-white tracking-tight">
            신청 내역 관리
          </h2>
          <p className="mt-1 text-slate-400">
            오픈 전환 전 접수된 신청 내역을 확인합니다.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={loadApplications}
          disabled={isLoading}
        >
          {isLoading ? <Spinner className="size-4" /> : "새로고침"}
        </Button>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        <WaitlistTable
          isLoading={isLoading}
          applications={applications}
          onApprove={handleApprove}
          onReject={handleReject}
          onCopy={copyToClipboard}
        />
      </section>

      <footer className="text-slate-500 text-sm">
        오픈 전환 이후 신규 가입자는 별도 승인 없이 서비스를 사용할 수 있습니다.
      </footer>
    </div>
  );
}

function WaitlistTable({
  isLoading,
  applications,
  onApprove,
  onReject,
  onCopy,
}: {
  isLoading: boolean;
  applications: Application[];
  onApprove: (id: string, email: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onCopy: (text: string) => void;
}) {
  if (isLoading && applications.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Spinner className="size-8 text-base-primary" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center text-slate-500">
        신청 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-slate-800 border-b bg-slate-900/80 text-slate-400">
          <tr>
            <th className="px-6 py-4 font-medium uppercase tracking-wider">
              상태
            </th>
            <th className="px-6 py-4 font-medium uppercase tracking-wider">
              이메일
            </th>
            <th className="px-6 py-4 font-medium uppercase tracking-wider">
              신청 메시지
            </th>
            <th className="px-6 py-4 font-medium uppercase tracking-wider">
              신청일
            </th>
            <th className="px-6 py-4 font-medium uppercase tracking-wider">
              액션
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {applications.map((app) => (
            <ApplicationRow
              key={app.id}
              app={app}
              onApprove={onApprove}
              onReject={onReject}
              onCopy={onCopy}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApplicationRow({
  app,
  onApprove,
  onReject,
  onCopy,
}: {
  app: Application;
  onApprove: (id: string, email: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onCopy: (text: string) => void;
}) {
  const statusColor =
    app.status === "approved"
      ? "bg-green-500/10 text-green-500"
      : app.status === "rejected"
        ? "bg-red-500/10 text-red-500"
        : "bg-yellow-500/10 text-yellow-500";

  return (
    <tr className="transition-colors hover:bg-white/5">
      <td className="whitespace-nowrap px-6 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 font-semibold text-xs ${statusColor}`}
        >
          {app.status.toUpperCase()}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-white">{app.email}</span>
          <ActionButton
            icon="document_16"
            onClick={() => onCopy(app.email)}
            className="size-6 text-slate-500 hover:text-white"
          />
        </div>
      </td>
      <td className="px-6 py-4">
        <p
          className="max-w-xs truncate text-slate-300"
          title={app.message || ""}
        >
          {app.message || "-"}
        </p>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-slate-400">
        {new Date(app.created_at).toLocaleDateString()}
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex gap-2">
          {app.status === "pending" && (
            <>
              <Button
                size="h32"
                className="bg-green-600 text-white hover:bg-green-500"
                onClick={() => onApprove(app.id, app.email)}
              >
                승인
              </Button>
              <Button
                size="h32"
                variant="secondary"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => onReject(app.id)}
              >
                거절
              </Button>
            </>
          )}
          {app.status !== "pending" && (
            <span className="text-slate-500 text-xs italic">처리 완료</span>
          )}
        </div>
      </td>
    </tr>
  );
}
