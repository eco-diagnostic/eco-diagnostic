import { InstitutionSize } from "@prisma/client";
import { z } from "zod";

export const institutionFormSchema = z.object({
  name: z
    .string()
    .min(2, "O nome da instituição deve ter pelo menos 2 caracteres.")
    .max(120, "O nome não pode ultrapassar 120 caracteres."),
  sector: z
    .string()
    .min(2, "Informe o ramo ou setor de atuação da instituição.")
    .max(80, "O setor não pode ultrapassar 80 caracteres."),
  city: z
    .string()
    .min(2, "Informe a cidade sede.")
    .max(80, "A cidade não pode ultrapassar 80 caracteres."),
  state: z
    .string()
    .min(2, "Informe a sigla do estado (UF).")
    .max(2, "A sigla do estado deve ter exatamente 2 letras."),
  size: z.nativeEnum(InstitutionSize, {
    message: "Selecione o porte da instituição.",
  }),
  description: z
    .string()
    .max(500, "A descrição não pode ultrapassar 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type InstitutionFormData = z.infer<typeof institutionFormSchema>;

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}
