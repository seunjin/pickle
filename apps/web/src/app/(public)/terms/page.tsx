import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "법적 고지 및 약관 | Pickle",
  description: "Pickle 서비스의 이용약관 및 개인정보처리방침 안내입니다.",
};

export default function TermsIndexPage() {
  const links = [
    {
      title: "이용약관 (Terms of Service)",
      description: "서비스 이용에 관한 권리와 의무를 규정합니다.",
      href: "/terms/service",
      icon: "📄",
    },
    {
      title: "개인정보처리방침 (Privacy Policy)",
      description: "이용자의 소중한 정보를 어떻게 보호하는지 알려드립니다.",
      href: "/terms/privacy",
      icon: "🔒",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <header className="mb-12 border-b pb-8">
        <h1 className="mb-2 font-bold text-4xl text-gray-900 tracking-tight">
          법적 고지 및 약관
        </h1>
        <p className="text-gray-500">
          Pickle 서비스의 투명한 운영을 위한 안내입니다.
        </p>
      </header>

      <nav className="space-y-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group block rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-indigo-500 hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl grayscale transition-all group-hover:grayscale-0">
                {link.icon}
              </span>
              <div className="flex-1">
                <h2 className="font-bold text-gray-900 text-xl transition-colors group-hover:text-indigo-600">
                  {link.title}
                </h2>
                <p className="mt-1 text-gray-600">{link.description}</p>
              </div>
              <span className="transform text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-indigo-500">
                →
              </span>
            </div>
          </Link>
        ))}
      </nav>

      <footer className="mt-20 border-t pt-8 text-center text-gray-400 text-sm">
        © 2025 Pickle. All rights reserved.
      </footer>
    </div>
  );
}
