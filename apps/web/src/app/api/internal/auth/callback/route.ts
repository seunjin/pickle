import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // "next" 파라미터가 있다면, 해당 URL로 리다이렉트합니다.
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log("Auth callback success: Session created");
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error("Auth callback error:", error);
    }
  }

  // 사용자를 지침이 있는 에러 페이지로 리다이렉트합니다.
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
