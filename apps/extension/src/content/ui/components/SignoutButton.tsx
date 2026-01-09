import { Icon } from "@pickle/icons";
import { Confirm, useDialog } from "@pickle/ui";
import { useSession } from "@/shared/hooks/useSession";
import { useToastStore } from "@/shared/stores/useToastStore";

export function SignoutButton() {
  const dialog = useDialog();
  const { showToast } = useToastStore();
  const { isLoggedIn, signOut } = useSession();

  // if (!isLoggedIn) return null;

  const handleSignOut = () => {
    dialog.open(() => (
      <Confirm
        title="로그아웃"
        content="로그아웃 하시겠습니까?"
        confirmButtonText="로그아웃"
        onConfirm={() => {
          signOut();
          dialog.close();
          showToast({
            title: "로그아웃이 완료되었습니다.",
            kind: "success",
            durationMs: 4000,
          });
        }}
      />
    ));
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="inline-flex h-6 items-center gap-0.5 rounded-md px-1.5 font-medium text-base-muted-foreground text-xs active:scale-95"
    >
      <Icon name="logout_16" /> 로그아웃
    </button>
  );
}
