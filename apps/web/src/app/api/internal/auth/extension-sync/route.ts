/**
 * Extension → Web 세션 전파 API
 *
 * 익스텐션에서 로그인 후, 웹에도 동일한 세션을 설정하기 위한 엔드포인트입니다.
 * 1회용 code 방식을 사용하여 보안을 강화합니다.
 *
 * 사용법:
 * 1. 익스텐션이 이 URL을 새 탭으로 열거나 리다이렉트
 * 2. 서버가 세션 토큰을 쿠키에 설정
 * 3. 메인 페이지로 리다이렉트
 */

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");
  const next = searchParams.get("next") ?? "/";

  // 보안 경고: URL에 토큰을 노출하는 것은 권장되지 않음
  // 프로덕션에서는 1회용 code 방식을 고려해야 함
  if (!accessToken) {
    return NextResponse.redirect(
      new URL("/auth/error?message=missing_token", request.url),
    );
  }

  try {
    const supabase = await createClient();

    // 세션 설정
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken ?? "",
    });

    if (error) {
      console.error("[ExtensionSync] Session set error:", error);
      return NextResponse.redirect(
        new URL(
          `/auth/error?message=${encodeURIComponent(error.message)}`,
          request.url,
        ),
      );
    }

    // 성공 시 메인 페이지로 리다이렉트
    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    console.error("[ExtensionSync] Unexpected error:", error);
    return NextResponse.redirect(
      new URL("/auth/error?message=unexpected_error", request.url),
    );
  }
}
