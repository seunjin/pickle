import type { Metadata } from "next";
import { getServerAuth } from "@/features/auth/api/getServerAuth";
import { LandingButton } from "@/features/auth/ui/LandingButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Pickle",
  description: "Web의 모든 것을 캡처하고 정리하세요.",
};

export default async function Home() {
  const { user, appUser } = await getServerAuth();
  const isActive = user && appUser?.status === "active";

  return (
    <div className="effect-bg grid min-h-dvh grid-rows-[1fr_auto] py-10">
      <div className="flex flex-1 flex-col items-center justify-center pb-8">
        <div className="flex flex-col gap-6 pb-15 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-[10px] bg-green-400">
            <img
              src="/symbol-black.svg"
              alt="pickle symbol"
              className="w-[22.65px]"
            />
          </div>
          <h1 className="font-bold text-[32px] leading-[1.2]">
            웹의 모든 조각을 <br />
            하나의 피클로.
          </h1>
          <p className="text-[18px] text-gray-300 leading-[1.4]">
            흩어져 있는 아이디어와 캡처를 한 곳에 모으고
            <br />
            당신만의 지식 베이스를 구축하세요.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <LandingButton initialIsActive={!!isActive} />
        </div>
      </div>
      <footer className="text-center text-gray-500 text-sm">
        © 2026 Pickle. All rights reserved.
      </footer>
    </div>
  );
}
