import { isMatch } from "date-fns";
import { z } from "zod";

export const generateAiReportSchema = z.object({
  diagnosticId: z.string().optional(),
  month: z
    .string()
    .refine((value) => isMatch(value, "MM"), {
      message: "Formato de mês inválido. Use 'MM' (ex: '08')",
    })
    .optional(),
  type: z.enum(["diagnostic", "monthly"]).default("diagnostic").optional(),
  forceRegenerate: z.boolean().default(false).optional(),
});

// Alias mantido para compatibilidade
export const generareAiReportSchema = generateAiReportSchema;

export type GenerateAiReportSchema = z.infer<typeof generateAiReportSchema>;

