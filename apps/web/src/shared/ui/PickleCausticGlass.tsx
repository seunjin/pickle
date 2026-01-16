"use client";

import type React from "react";

interface Props {
  children?: React.ReactNode;
  className?: string;
}

export const PickleCausticGlass = ({ children, className = "" }: Props) => {
  return (
    <div className={`group/glass relative isolate ${className}`}>
      {/* 1. 베이스 (Deep & Dark) */}
      <div className="absolute inset-0 overflow-hidden rounded-[20px] bg-neutral-950/5 backdrop-blur-xl" />

      {/* 2. 빛의 맺힘 (Internal Reflection) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[20px]"
        style={{
          boxShadow: `
            inset -5px -5px 15px -5px rgba(255, 255, 255, 0.1),
            inset -2px -2px 5px 0px rgba(255, 255, 255, 0.01)
          `,
        }}
      />

      {/* 3. 엣지 하이라이트 */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[20px]"
        style={{
          padding: "0.5px",
          background: `linear-gradient(135deg, 
              rgba(255,255,255,0.1) 0%,   /* 11시: 선명한 빛 시작 */
              rgba(255,255,255,0.1) 20%,  /* 11시: 서서히 흐려짐 */
              rgba(255,255,255,0) 25%,    /* [CUT] 1시/7시 구간 시작: 완전 투명 */
              rgba(255,255,255,0) 75%,    /* [CUT] 1시/7시 구간 끝: 완전 투명 */
              rgba(255,255,255,0.1) 80%,  /* 5시: 다시 은은하게 빛남 */
              rgba(255,255,255,0.15) 100% /* 5시: 끝맺음 */
            )`,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskMode: "exclude",
        }}
      />

      {/* 4. 상단 컷팅 라인 */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[20px] opacity-80"
        style={{
          boxShadow: "inset 1px 1px 0px 0px rgba(255,255,255,0.2)",
        }}
      />

      {/* 컨텐츠 */}
      <div className="relative z-10 h-full p-6 text-white/90">{children}</div>
    </div>
  );
};
