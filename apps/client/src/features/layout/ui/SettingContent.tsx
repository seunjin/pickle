import {
  ActionButton,
  Button,
  Checkbox,
  Confirm,
  Modal,
  ScrollArea,
  Spinner,
  useDialog,
  useToast,
} from "@pickle/ui";
import { cn } from "@pickle/ui/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { deleteAccount } from "@/features/auth/api/deleteAccount";
import { updateUser } from "@/features/auth/api/updateUser";
import { useSessionContext } from "@/features/auth/model/SessionContext";
import { useSignOut } from "@/features/auth/model/useSignOut";
import { logger } from "@/shared/lib/logger";
import { createClient } from "@/shared/lib/supabase";

export function SettingContent() {
  const dialog = useDialog();
  const toast = useToast();
  const { user, appUser, updateAppUser } = useSessionContext();
  const { signOut } = useSignOut();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingAgreement, setIsUpdatingAgreement] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success({ title: "계정이 삭제되었습니다." });
      navigate({ to: "/" });
    } catch (_error) {
      toast.error({
        title: "탈퇴 처리 중 오류가 발생했습니다.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-full">
      <div className="mx-auto h-full w-[min(100%,800px)]">
        <section>
          <h2 className="mb-6 font-semibold text-[20px] text-base-foreground">
            프로필
          </h2>
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
                      className={cn(
                        "flex cursor-pointer select-none items-center gap-3",
                        isUpdatingAgreement ? "cursor-not-allowed" : "",
                      )}
                    >
                      {isUpdatingAgreement ? (
                        <Spinner className="size-4" />
                      ) : (
                        <Checkbox
                          id="terms"
                          checked={appUser?.is_marketing_agreed ?? false}
                          disabled={isUpdatingAgreement}
                          onChange={async (
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            if (!user || !appUser || isUpdatingAgreement)
                              return;

                            const originalValue = appUser.is_marketing_agreed;
                            const newValue = e.target.checked;

                            setIsUpdatingAgreement(true);
                            updateAppUser({ is_marketing_agreed: newValue });

                            try {
                              const supabase = createClient();
                              await Promise.all([
                                updateUser(supabase, user.id, {
                                  is_marketing_agreed: newValue,
                                }),
                                new Promise((resolve) =>
                                  setTimeout(resolve, 1000),
                                ),
                              ]);

                              toast.success({
                                title:
                                  "마케팅 수신 설정이 업데이트 되었습니다.",
                              });
                            } catch (_error) {
                              updateAppUser({
                                is_marketing_agreed: originalValue,
                              });
                              toast.error({
                                title: "마케팅 수신 설정 저장에 실패했습니다.",
                              });
                              logger.error("Failed to update agreement", {
                                error: _error,
                              });
                            } finally {
                              setIsUpdatingAgreement(false);
                            }
                          }}
                        />
                      )}
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
                dialog.open(({ close }) => (
                  <Confirm
                    title="정말 탈퇴하시겠어요?"
                    content={`회원님의 모든 기록이 삭제됩니다.\n삭제된 정보는 복구할 수 없으니 신중하게 \n결정해주세요.`}
                    isPending={isDeleting}
                    onConfirm={async () => {
                      await handleDeleteAccount();
                      close();
                    }}
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
        <ScrollArea className="h-full overflow-auto px-6 text-[14px]">
          <div className="whitespace-pre-wrap">
            {`제1조 (목적) ... (약관 내용 생략)`}
          </div>
        </ScrollArea>
      </div>
    </Modal>
  );
};
