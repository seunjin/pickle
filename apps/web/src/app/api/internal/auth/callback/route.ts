import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * 이 라우트는 OAuth 로그인(구글 등)이나 매직 링크 인증 후의 콜백 처리를 담당합니다.
 * Supabase Auth의 PKCE(Proof Key for Code Exchange) 흐름을 완료하는 중요한 단계입니다.
 *
 * 동작 방식:
 * 1. 인증 공급자로부터 `code`를 쿼리 파라미터로 받습니다.
 * 2. 수신한 `code`를 Supabase의 `exchangeCodeForSession` 메서드를 통해 유효한 세션(토큰)으로 교환합니다.
 * 3. 교환이 성공하면 쿠키에 세션이 저장되고, 사용자를 원래 요청했던 페이지(`next`)나 홈으로 리다이렉트합니다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // URL 파라미터에서 약관 동의 여부 추출 (Atomic Signup 강화 방식)
  const isTermsViaUrl = searchParams.get("terms") === "true";
  const isPrivacyViaUrl = searchParams.get("privacy") === "true";
  const isMarketingViaUrl = searchParams.get("marketing") === "true";

  if (code) {
    const supabase = await createClient();

    // Authorization Code를 사용하여 세션으로 교환 (쿠키 설정됨)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.log("Auth callback success: Session created");

      // Check user status (pending vs active)
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser) {
        const { data: userProfile } = await supabase
          .from("users")
          .select("status")
          .eq("id", currentUser.id)
          .single();

        // 프로필이 없는 경우 메타데이터 또는 URL 파라미터를 확인하여 즉시 생성 시도
        if (!userProfile) {
          console.warn(
            "User profile missing, checking values for automatic signup...",
          );
          const meta = currentUser.user_metadata;
          const isTermsAgreed =
            isTermsViaUrl || String(meta?.is_terms_agreed) === "true";
          const isPrivacyAgreed =
            isPrivacyViaUrl || String(meta?.is_privacy_agreed) === "true";
          const isMarketingAgreed =
            isMarketingViaUrl || String(meta?.is_marketing_agreed) === "true";

          if (isTermsAgreed && isPrivacyAgreed) {
            console.log("Agreement data found, completing signup...");
            const { error: completeError } = await supabase.rpc(
              "complete_signup",
              {
                marketing_agreed: isMarketingAgreed,
              },
            );

            if (!completeError) {
              const destination = next === "/" ? "/dashboard" : next;
              return NextResponse.redirect(`${origin}${destination}`);
            }
            console.error(
              "Failed to complete signup via callback:",
              completeError,
            );
          }

          // 필수 약관 동의가 없거나 자동 생성이 실패한 경우 가입 페이지로 유도 (이미 세션은 있음)
          return NextResponse.redirect(`${origin}/signup?reason=no_profile`);
        }

        if (userProfile.status === "pending") {
          return NextResponse.redirect(`${origin}/signup?reason=no_profile`);
        }
      }

      // 세션 생성 성공 및 active 유저 시 목적지로 이동
      // 만약 next가 기본값('/')이면 대시보드로 이동
      const destination = next === "/" ? "/dashboard" : next;
      return NextResponse.redirect(`${origin}${destination}`);
    } else {
      console.error("Auth callback error:", error);
    }
  }

  // 인증 코드 교환에 실패하거나 코드가 없는 경우 에러 페이지 대신 로그인 페이지로 이동
  return NextResponse.redirect(`${origin}/signin?error=auth_failed`);
}
