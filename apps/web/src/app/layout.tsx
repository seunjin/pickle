import type { Metadata } from "next";
import { getServerAuth } from "@/features/auth/api/getServerAuth";
import { ClientProviders } from "./ClientProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pickle",
  description: "Capture and Organize your thoughts",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, appUser, workspace } = await getServerAuth();

  return (
    <html lang="ko">
      <body className="">
        <ClientProviders
          initialUser={user}
          initialAppUser={appUser}
          initialWorkspace={workspace}
        >
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
