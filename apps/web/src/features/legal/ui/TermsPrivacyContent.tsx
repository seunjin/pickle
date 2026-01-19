export function TermsPrivacyContent() {
  return (
    <section className="prose prose-slate dark:prose-invert max-w-none">
      <p>
        Pickle(이하 “서비스”)은 이용자의 개인정보를 중요하게 생각하며, 관련
        법령을 준수합니다. 본 개인정보처리방침은 Pickle 브라우저 확장 프로그램
        및 관련 웹 페이지에 적용됩니다.
      </p>

      <h2 className="mt-8 mb-4 border-b pb-2 font-bold text-xl">
        1. 수집하는 정보
      </h2>
      <p>
        서비스는 아래 정보만을 이용자가 명시적으로 저장 동작을 수행할 때
        수집·처리합니다.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          웹사이트 콘텐츠: 사용자가 선택하여 저장한 텍스트, 이미지,
          하이퍼링크(URL)
        </li>
      </ul>

      <p className="mt-4 font-medium text-gray-900 dark:text-gray-100">
        서비스는 다음 정보를 수집하지 않습니다.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-gray-600 dark:text-gray-400">
        <li>개인 식별 정보(이름, 주소, 이메일 등)</li>
        <li>인증 정보(비밀번호, 보안 질문, PIN 등)</li>
        <li>금융/결제 정보</li>
        <li>건강 정보</li>
        <li>위치 정보(GPS 등)</li>
        <li>
          웹 기록(방문 페이지 목록, 방문 시간 등) 및 사용자 활동(키 입력/마우스
          이동/스크롤 추적 등)
        </li>
      </ul>

      <h2 className="mt-8 mb-4 border-b pb-2 font-bold text-xl">
        2. 수집 및 이용 목적
      </h2>
      <p>수집된 웹사이트 콘텐츠는 다음 목적에 한해 이용됩니다.</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          사용자가 저장한 콘텐츠를 보관하고, 확인·정리·관리 기능을 제공하기 위해
        </li>
      </ul>

      <h2 className="mt-8 mb-4 border-b pb-2 font-bold text-xl">
        3. 처리 방식 및 동작 원칙
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          서비스는{" "}
          <strong>
            사용자의 명시적인 상호작용(버튼 클릭/메뉴 선택/캡처 요청 등)
          </strong>
          이 있을 때에만 동작합니다.
        </li>
        <li>
          서비스는 자동으로 웹사이트 콘텐츠를 수집하거나 사용자의 탐색 활동을
          추적하지 않습니다.
        </li>
      </ul>

      <h2 className="mt-8 mb-4 border-b pb-2 font-bold text-xl">
        4. 보관 및 삭제
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          사용자는 저장한 콘텐츠를 서비스 내 기능을 통해 삭제할 수 있습니다.
        </li>
        <li>
          서비스는 목적 달성에 필요한 범위에서만 데이터를 보관하며, 사용자가
          삭제한 데이터는 서비스 정책에 따라 지체 없이 삭제 처리됩니다.
        </li>
      </ul>

      <h2 className="mt-8 mb-4 border-b pb-2 font-bold text-xl">
        5. 제3자 제공 및 판매
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          서비스는 이용자 데이터를 제3자에게 판매하지 않으며, 승인된 사용 사례를
          제외하고 전송 또는 제공하지 않습니다.
        </li>
        <li>
          서비스는 신용도 판단 또는 대출 목적을 위해 이용자 데이터를 사용하거나
          전송하지 않습니다.
        </li>
      </ul>

      <h2 className="mt-8 mb-4 border-b pb-2 font-bold text-xl">6. 보안</h2>
      <p>서비스는 이용자 데이터 보호를 위해 합리적인 보호 조치를 적용합니다.</p>

      <h2 className="mt-8 mb-4 border-b pb-2 font-bold text-xl">
        7. 정책 변경
      </h2>
      <p>
        본 개인정보처리방침의 내용이 변경될 경우, 변경 사항을 본 페이지를 통해
        공지합니다.
      </p>

      <h2 className="mt-8 mb-4 border-b pb-2 font-bold text-xl">8. 문의</h2>
      <p>개인정보 관련 문의는 아래 이메일로 연락해 주세요.</p>
      <ul className="list-disc pl-5 lg:pl-5">
        <li>
          이메일:{" "}
          <a
            href="mailto:jinseun@gmail.com"
            className="text-indigo-600 hover:underline"
          >
            jinseun@gmail.com
          </a>
        </li>
      </ul>
    </section>
  );
}
