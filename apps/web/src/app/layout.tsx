import type { Metadata } from "next";
import { getServerAuth } from "@/features/auth/api/getServerAuth";
import { ClientProviders } from "./ClientProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pickle",
  description: "웹의 모든 조각을 하나의 피클로.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
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
