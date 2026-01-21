import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error("Supabase URL or Anon Key not found");
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 인증 상태 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🚨 [Auth Guard] 미로그인 사용자 처리
  // 1. 제외 경로: 로그인, 가입, 인증 API, 정적 자산 등
  const isExcludedPath = ["/signin", "/signup", "/api", "/auth"].some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );

  const isRoot = request.nextUrl.pathname === "/";

  // 2. 로그인하지 않은 상태에서 보호된 경로 접근 시 /signin으로 리다이렉트
  if (!user && !isExcludedPath && !isRoot) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
