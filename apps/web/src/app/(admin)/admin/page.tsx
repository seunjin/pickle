export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-3xl text-white tracking-tight">
          관리자 대시보드
        </h2>
        <p className="mt-1 text-slate-400">
          피클 서비스의 전체 현황을 모니터링하고 관리합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-400 text-sm">전체 사용자</p>
          <h3 className="mt-2 font-bold text-2xl text-white">0</h3>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-400 text-sm">활성 워크스페이스</p>
          <h3 className="mt-2 font-bold text-2xl text-white">0</h3>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-400 text-sm">전체 저장 데이터</p>
          <h3 className="mt-2 font-bold text-2xl text-white">0 B</h3>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-8">
        <h3 className="font-semibold text-white text-xl">최근 가입 사용자</h3>
        <div className="mt-6 flex h-40 items-center justify-center rounded-lg border border-slate-800 border-dashed text-slate-500">
          데이터를 불러오는 중입니다...
        </div>
      </div>
    </div>
  );
}
