"use client";
import { Button, toast } from "@pickle/ui";

export function ToastTest() {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        onClick={() =>
          toast.info({
            title: "토스 정보 테스트",
            description: "토스트 정보 테스트",
          })
        }
      >
        토스트:정보
      </Button>
      <Button
        type="button"
        onClick={() =>
          toast.loading({
            title: "토스 로딩 테스트",
            description: "토스트 로딩 테스트 sdsadd dsadsad flfjwle lorem",
          })
        }
      >
        토스트:로딩
      </Button>
      <Button
        type="button"
        onClick={() =>
          toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
              loading: "로딩중",
              success: "성공이요",
              error: "에러입니다.",
            },
            {
              description: "promise 테스트",
            },
          )
        }
      >
        토스트:promise 테스트
      </Button>
    </div>
  );
}
