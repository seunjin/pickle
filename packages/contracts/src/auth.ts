import { z } from "zod";

/**
 * Onboarding Schema
 * 가입 후 추가 정보 입력 (약관 동의 등)
 */
export const onboardingSchema = z.object({
  terms_agreed: z.boolean().refine((val) => val === true, {
    message: "이용약관에 동의해야 합니다.",
  }),
  privacy_agreed: z.boolean().refine((val) => val === true, {
    message: "개인정보 처리방침에 동의해야 합니다.",
  }),
  marketing_agreed: z.boolean().optional().default(false),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
