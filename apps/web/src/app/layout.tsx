import type { Metadata } from "next";
import { SessionProvider } from "@/features/auth";
import "./globals.css";
import QueryProvider from "@/shared/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Pickle Note",
  description: "Capture and Organize your thoughts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <QueryProvider>
          <SessionProvider>{children}</SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
