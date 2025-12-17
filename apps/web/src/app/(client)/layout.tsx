import { Sidebar } from "@/features/layout/Sidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-gray-50 p-4">
        <Sidebar />
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
