export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 p-4 text-white">
        <nav>Admin Sidebar</nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
