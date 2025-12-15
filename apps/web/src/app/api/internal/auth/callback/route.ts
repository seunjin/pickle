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
      // 세션 생성 성공 시 사용자를 목적지로 이동
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error("Auth callback error:", error);
    }
  }

  // 인증 코드 교환에 실패하거나 코드가 없는 경우 에러 페이지로 이동
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
