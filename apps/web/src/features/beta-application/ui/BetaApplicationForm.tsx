"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type SubmitApplicationInput,
  submitApplicationSchema,
} from "@pickle/contracts";
import {
  Button,
  Checkbox,
  Input,
  PickleCausticGlass,
  Textarea,
  toast,
} from "@pickle/ui";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSessionContext } from "@/features/auth/model/SessionContext";
import { submitApplication } from "../api/submitApplication";

export function BetaApplicationForm() {
  // ... 기존 상태 및 로직 유지 ...
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useSessionContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<SubmitApplicationInput>({
    resolver: zodResolver(submitApplicationSchema),
    defaultValues: {
      email: user?.email || "",
      is_confirmed: false,
      message: "",
    },
  });

  useEffect(() => {
    if (user?.email) {
      setValue("email", user.email);
    }
  }, [user?.email, setValue]);

  const onSubmit = async (data: SubmitApplicationInput) => {
    try {
      await submitApplication(data);
      toast.success({
        title: "신청이 완료되었습니다!",
        description: "관리자 승인 후 안내 메일이 발송됩니다.",
      });
      setIsSubmitted(true);
      reset();
    } catch (error) {
      toast.error({
        title: "신청 실패",
        description:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      });
    }
  };

  if (isSubmitted) {
    return (
      <PickleCausticGlass className="w-full max-w-[480px]">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="text-[24px]">✅</div>
          <h3 className="font-bold text-[20px]">신청이 접수되었습니다!</h3>
          <p className="text-gray-400">
            빠른 시일 내에 검토 후 연락드리겠습니다. <br />
            조금만 기다려 주세요!
          </p>
          <Button
            variant="secondary"
            onClick={() => setIsSubmitted(false)}
            className="mt-2"
          >
            추가 신청하기
          </Button>
        </div>
      </PickleCausticGlass>
    );
  }

  return (
    <PickleCausticGlass className="w-full max-w-[480px]">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-[20px] text-white">
            오픈 베타 참여 신청
          </h3>
          <p className="text-gray-400 text-sm">
            현재 서비스는 초대 기반으로 운영되고 있습니다. <br />
            신청해 주시면 순차적으로 승인해 드립니다.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-medium text-gray-300 text-sm">
            이메일 주소
          </label>
          <Input
            id="email"
            type="email"
            placeholder="example@gmail.com"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <span className="text-red-500 text-xs">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="message"
            className="font-medium text-gray-300 text-sm"
          >
            하고 싶은 말 (선택)
          </label>
          <Textarea
            id="message"
            placeholder="피클에 기대하는 점이나 사용 목적을 적어주세요."
            className="min-h-[100px]"
            {...register("message")}
          />
          {errors.message && (
            <span className="text-red-500 text-xs">
              {errors.message.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <Checkbox id="is_confirmed" {...register("is_confirmed")} />
            <label
              htmlFor="is_confirmed"
              className="cursor-pointer select-none text-gray-400 text-sm leading-tight"
            >
              오픈 베타 기간 중 기능 및 정책에 변경이 있을 수 있음을 확인했으며,
              개인정보(이메일) 수집 및 안내 메일 발송에 동의합니다.
            </label>
          </div>
          {errors.is_confirmed && (
            <span className="text-red-500 text-xs">
              {errors.is_confirmed.message}
            </span>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          isPending={isSubmitting}
        >
          베타 참여 신청하기
        </Button>
      </form>
    </PickleCausticGlass>
  );
}
