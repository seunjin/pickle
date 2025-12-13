export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header compoment will go here */}
      <main className="flex-1">{children}</main>
      {/* Footer component will go here */}
    </div>
  );
}
