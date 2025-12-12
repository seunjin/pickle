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
          // request.cookies (NextRequest): 이것은 클라이언트(브라우저)에서 서버로 보내온 쿠키를 의미합니다. 브라우저는 서버로 쿠키를 보낼 때 오직 name과 value만 보냅니다. (만료일, HttpOnly 등의 options 정보는 브라우저가 보관하고 서버로 보내지 않습니다.) 따라서 request.cookies.set 메서드는 options 인자를 받지 않습니다.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          // response.cookies (NextResponse - 34번 라인): 반면, 서버가 브라우저에게 "이 쿠키를 저장해"라고 응답할 때(Set-Cookie 헤더)는 options(만료일, 보안 설정 등)가 필요합니다. 그래서 아래쪽 34번 라인의 response.cookies.set에서는 options가 사용되고 있습니다
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 중요: createServerClient와 supabase.auth.getUser() 사이에 어떤 로직도 작성하지 마세요.
  // 사소한 실수로 인해 사용자가 무작위로 로그아웃되는 문제를 디버깅하기 매우 어려워질 수 있습니다.

  // 이 호출은 필요시 인증 토큰을 갱신하기 위해 필요합니다.
  // 결과값은 여기서 사용되지 않지만, 쿠키를 업데이트하는 사이드 이펙트가 중요합니다.

  // 이 함수가 호출되면 Supabase 클라이언트는 현재 토큰이 유효한지 확인합니다.
  // 만약 토큰이 만료되었거나 갱신이 필요하면, 새로운 토큰을 받아옵니다.
  // 이때, 위에서 정의한 setAll 메서드가 트리거되어 새로운 토큰을 쿠키에 업데이트(response.cookies.set) 합니다.
  await supabase.auth.getUser();

  return response;
}
