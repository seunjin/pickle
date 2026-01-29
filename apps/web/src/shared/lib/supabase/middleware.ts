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
  const { pathname } = request.nextUrl;
  const isExcludedPath = [
    "/signin",
    "/signup",
    "/api",
    "/auth",
    "/terms",
    "/favicon.ico",
    "/site.webmanifest",
  ].some((p) => pathname.startsWith(p));

  // 정적 파일(이미지, 폰트 등) 제외
  const isStaticFile =
    /\.(.*)$/.test(pathname) && !pathname.startsWith("/_next");

  const isRoot = request.nextUrl.pathname === "/";

  // 2. 로그인하지 않은 상태에서 보호된 경로 접근 시 /signin으로 리다이렉트
  if (!user && !isExcludedPath && !isStaticFile && !isRoot) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
