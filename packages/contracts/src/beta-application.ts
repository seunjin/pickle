import { z } from "zod";

export const betaApplicationStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);

export type BetaApplicationStatus = z.infer<typeof betaApplicationStatusSchema>;

export const betaApplicationSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  is_confirmed: z.boolean().refine((val) => val === true, {
    message: "신청 안내 사항을 확인해 주세요.",
  }),
  status: betaApplicationStatusSchema.default("pending"),
  message: z
    .string()
    .max(500, "메시지는 500자 이내로 작성해 주세요.")
    .optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type BetaApplication = z.infer<typeof betaApplicationSchema>;

export const submitApplicationSchema = betaApplicationSchema.pick({
  email: true,
  is_confirmed: true,
  message: true,
});

export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>;
