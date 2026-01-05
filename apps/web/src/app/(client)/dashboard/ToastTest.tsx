"use client";
import { Button, toast } from "@pickle/ui";

export function ToastTest() {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        onClick={() =>
          toast.success({
            title: "토스 성공 테스트",
            description: "토스트 성공 테스트",
          })
        }
      >
        토스트:성공
      </Button>
      <Button
        type="button"
        onClick={() =>
          toast.error({
            title: "토스 에러 테스트",
            description: "토스트 에러 테스트",
          })
        }
      >
        토스트:에러
      </Button>
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
    </div>
  );
}
