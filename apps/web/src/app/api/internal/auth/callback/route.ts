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
  // "next" 파라미터가 있다면, 인증 완료 후 해당 URL로 이동시킵니다. (기본값: 홈 '/')
  const next = searchParams.get("next") ?? "/";

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

        // If profile is missing (e.g. manual deletion or trigger failure), try to recover
        if (!userProfile) {
          console.warn("User profile missing, attempting recovery...");
          const { error: insertError } = await supabase.from("users").insert({
            id: currentUser.id,
            email: currentUser.email,
            full_name: currentUser.user_metadata.full_name,
            avatar_url: currentUser.user_metadata.avatar_url,
            status: "pending",
          });

          if (insertError) {
            console.error("Failed to recover user profile:", insertError);
            return NextResponse.redirect(`${origin}/auth/auth-code-error`);
          }
          return NextResponse.redirect(`${origin}/signup`);
        }

        if (userProfile.status === "pending") {
          return NextResponse.redirect(`${origin}/signup`);
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

  // 인증 코드 교환에 실패하거나 코드가 없는 경우 에러 페이지로 이동
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
