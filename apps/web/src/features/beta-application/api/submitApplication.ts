import {
  type SubmitApplicationInput,
  submitApplicationSchema,
} from "@pickle/contracts";
import { logger } from "@/shared/lib/logger";
import { createClient } from "@/shared/lib/supabase/client";

/**
 * 일반 사용자가 참여 의사를 제출합니다.
 */
export const submitApplication = async (params: SubmitApplicationInput) => {
  const supabase = createClient();

  // 1. 유효성 검사
  const parsed = submitApplicationSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const { email, is_confirmed, message } = parsed.data;

  // 2. 신청 내역 저장
  const { error } = await supabase.from("beta_applications").insert({
    email,
    is_confirmed,
    message,
    status: "pending",
  });

  if (error) {
    // 중복 신청 처리
    if (error.code === "23505") {
      throw new Error("이미 신청된 이메일입니다.");
    }

    logger.error("Failed to submit application", { email, error });
    throw new Error(
      "신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }

  return { success: true };
};
