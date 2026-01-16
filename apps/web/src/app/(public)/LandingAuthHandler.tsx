"use client";

import { Confirm, useDialog, useDialogStore } from "@pickle/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function LandingAuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dialog = useDialog();
  const store = useDialogStore(); // Store 준비 여부 확인을 위해 추가
  const hasShownRef = useRef(false);

  useEffect(() => {
    const reason = searchParams.get("reason");

    // store가 아직 준비되지 않았으면 대기 (Proxy 경고 방지)
    if (!store) return;

    if (reason === "no_profile" && !hasShownRef.current) {
      hasShownRef.current = true;

      dialog.open(() => (
        <Confirm
          title="가입 정보가 없습니다"
          content={`로그인하신 계정으로 가입된 정보가 없습니다.\n회원가입 페이지로 이동하시겠습니까?`}
          confirmButtonText="가입하기"
          cancelButtonText="취소"
          onConfirm={() => {
            router.push("/signup");
            dialog.close();
          }}
          onCancel={() => {
            router.replace("/");
            dialog.close();
          }}
        />
      ));
    }
  }, [searchParams, dialog, router, store]);

  return null;
}
