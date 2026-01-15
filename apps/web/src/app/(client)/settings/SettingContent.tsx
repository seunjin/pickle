"use client";

import {
  ActionButton,
  Button,
  Checkbox,
  Confirm,
  Modal,
  ScrollArea,
  useDialog,
} from "@pickle/ui";
import { useSessionContext, useSignOut } from "@/features/auth";

export function SettingContent() {
  const dialog = useDialog();
  const { user } = useSessionContext();
  const { signOut } = useSignOut();
  return (
    <div className="h-full">
      <div className="mx-auto h-full w-[min(100%,800px)]">
        {/* section - 프로필 */}
        <section>
          <h2 className="mb-6 font-semibold text-[20px] text-base-foreground">
            프로필
          </h2>
          {/* 프로필 컨텐츠 */}
          <div className="mb-5 flex flex-col gap-5 rounded-2xl border border-base-border bg-neutral-900 p-6">
            <div>
              <dl className="flex items-center justify-between">
                <dt className="w-[210px] font-medium text-[16px] text-base-muted-foreground leading-none">
                  프로필
                </dt>
                <dd className="flex h-[44px] flex-1 items-center rounded-lg border border-base-border-light bg-neutral-800 px-4">
                  <div className="flex items-center gap-3">
                    <img src="/google.svg" className="" alt="google logo" />{" "}
                    <span className="text-[15px] text-base-muted-foreground leading-none">
                      {user?.email ?? "로딩 중..."}
                    </span>
                  </div>
                </dd>
              </dl>
            </div>
            <Seperator />
            <div>
              <dl className="flex items-center justify-between">
                <dt className="w-[210px] font-medium text-[16px] text-base-muted-foreground leading-none">
                  약관 동의
                </dt>
                <dd className="flex h-[44px] flex-1 items-center rounded-lg border border-base-border-light bg-neutral-800 px-4">
                  <div className="flex w-full items-center justify-between gap-2">
                    <label
                      htmlFor="terms"
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <Checkbox id="terms" />
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] text-base-muted leading-none">
                          [선택]
                        </span>{" "}
                        <span className="text-[14px] text-base-foreground leading-none">
                          마케팅 정보 수신 동의
                        </span>
                      </div>
                    </label>
                    <ActionButton
                      icon="arrow_right_16"
                      onClick={() => dialog.open(() => <MarketingTerms />)}
                    />
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary_line"
              size="h32"
              onClick={() =>
                dialog.open(() => (
                  <Confirm
                    title="정말 탈퇴하시겠어요?"
                    content={`회원님의 모든 기록이 삭제됩니다.\n삭제된 정보는 복구할 수 없으니 신중하게 \n결정해주세요.`}
                    onConfirm={() => {}}
                    confirmButtonText="탈퇴하기"
                    confirmType="destructive"
                  />
                ))
              }
            >
              회원탈퇴
            </Button>
            <Button variant="secondary_line" size="h32" onClick={signOut}>
              로그아웃
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

const Seperator = () => {
  return <div className="h-px bg-base-border"></div>;
};

const MarketingTerms = () => {
  return (
    <Modal contentClassName="w-[500px]">
      <div className="grid max-h-[80dvh] w-full min-w-0 grid-rows-[auto_1fr]">
        <header className="flex items-center justify-between px-6 pb-5">
          <span className="font-semibold text-[18px]">
            마케팅 정보 수신 동의
          </span>
          <ActionButton icon="delete_16" />
        </header>
        <ScrollArea className="h-full overflow-auto px-6">
          <div className="whitespace-pre-wrap">
            {`
        제1조 (목적)
본 약관은 ㈜피클노트(이하 “회사”)가 제공하는 Pickle 서비스(이하 “서비스”)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (정의)
본 약관에서 사용하는 용어의 정의는 다음과 같습니다.
“서비스”란 회사가 제공하는 웹사이트, 크롬 확장 프로그램 및 이에 부수된 제반 서비스를 의미합니다.
“이용자”란 본 약관에 동의하고 서비스를 이용하는 회원 및 비회원을 말합니다.
“회원”이란 회사에 개인정보를 제공하고 계정을 생성하여 서비스를 이용하는 자를 말합니다.
“콘텐츠”란 이용자가 서비스를 통해 저장, 업로드, 생성한 이미지, 텍스트, 링크, 메모, 태그 등 모든 자료를 의미합니다.
“유료서비스”란 회사가 제공하는 구독 기반의 유료 기능을 의미합니다.

제3조 (약관의 효력 및 변경)
본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.
회사는 관련 법령을 위반하지 않는 범위에서 본 약관을 개정할 수 있습니다.
약관이 변경되는 경우 회사는 변경 사항을 적용일자 7일 전부터 공지합니다. 단, 이용자에게 불리한 변경의 경우 30일 전부터 공지합니다.
이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.

제4조 (서비스의 제공)
회사는 다음과 같은 서비스를 제공합니다.
웹 콘텐츠(이미지, 텍스트, 링크)의 저장 및 관리 기능
크롬 확장 프로그램을 통한 콘텐츠 수집 기능
저장된 콘텐츠의 열람, 분류, 검색 기능
기타 회사가 추가로 개발하거나 제휴를 통해 제공하는 서비스
회사는 서비스의 품질 개선 또는 기술적 필요에 따라 서비스 내용을 변경할 수 있습니다.
제5조 (회원가입)
회원가입은 이용자가 약관에 동의하고 회사가 정한 절차에 따라 가입 신청을 하며, 회사가 이를 승인함으로써 완료됩니다.
회사는 다음 각 호에 해당하는 경우 가입 신청을 거절하거나 사후에 취소할 수 있습니다.
허위 정보를 기재한 경우
타인의 정보를 도용한 경우
법령 또는 본 약관을 위반한 경우
제6조 (이용자의 의무)
이용자는 다음 행위를 하여서는 안 됩니다.
타인의 저작권, 지식재산권을 침해하는 행위
불법적이거나 부적절한 콘텐츠를 저장·공유하는 행위
서비스의 정상적인 운영을 방해하는 행위
회사의 사전 동의 없이 서비스를 상업적으로 이용하는 행위
제7조 (콘텐츠의 저작권 및 이용)
이용자가 서비스에 저장한 콘텐츠의 저작권은 해당 이용자 또는 원저작권자에게 귀속됩니다.
회사는 서비스 제공을 위해 필요한 범위 내에서 해당 콘텐츠를 저장, 처리, 전송할 수 있습니다.
회사는 이용자의 명시적인 동의 없이 콘텐츠를 외부에 공개하거나 제3자에게 제공하지 않습니다.
제8조 (유료서비스 및 결제)
회사는 일부 기능에 대해 유료서비스를 제공할 수 있습니다.
유료서비스의 이용 요금, 결제 방식, 환불 정책은 별도로 안내합니다.
회원이 유료서비스 이용 요금을 정상적으로 결제하지 않을 경우 서비스 이용이 제한될 수 있습니다.
제9조 (서비스 이용 제한)
회사는 다음 각 호의 경우 사전 통지 없이 서비스 이용을 제한하거나 계약을 해지할 수 있습니다.
관련 법령 또는 본 약관을 위반한 경우
서비스의 안정적인 운영을 방해한 경우
장기간 서비스 이용이 없는 경우
제10조 (서비스 중단)
회사는 시스템 점검, 장애, 천재지변 등의 사유로 서비스 제공을 일시적으로 중단할 수 있습니다.
회사는 서비스 중단이 예상되는 경우 사전에 이를 공지합니다.
제11조 (책임의 제한)
회사는 이용자의 귀책 사유로 발생한 손해에 대해 책임을 지지 않습니다.
회사는 이용자가 서비스에 저장한 콘텐츠의 정확성, 완전성, 적법성에 대해 보증하지 않습니다.
제12조 (개인정보 보호)
회사는 이용자의 개인정보를 보호하기 위해 관련 법령을 준수하며, 개인정보 처리에 관한 사항은 개인정보처리방침에 따릅니다.
제13조 (분쟁 해결 및 관할)
회사와 이용자 간 발생한 분쟁은 상호 협의하여 해결함을 원칙으로 합니다.
협의가 이루어지지 않을 경우, 관할 법원은 회사 본점 소재지 관할 법원으로 합니다.
부칙
본 약관은 2026년 ○월 ○일부터 시행합니다.
        `}
          </div>
        </ScrollArea>
      </div>
    </Modal>
  );
};
