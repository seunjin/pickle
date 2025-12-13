export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar component will go here */}
      <aside className="w-64 border-r bg-gray-50 p-4">
        <nav>Client Sidebar</nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
