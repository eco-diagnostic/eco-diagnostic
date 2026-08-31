"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import {
  institutionFormSchema,
  InstitutionFormData,
  ActionResponse,
} from "./institution-schema";

export type { InstitutionFormData, ActionResponse };

/**
 * Cria ou atualiza a Instituição do usuário no primeiro login / onboarding
 */
export async function createInstitutionAction(
  data: InstitutionFormData
): Promise<ActionResponse> {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: "Usuário não autenticado. Faça login para continuar.",
    };
  }

  const validationResult = institutionFormSchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || "Dados inválidos.",
    };
  }

  const validData = validationResult.data;

  try {
    // Verifica se já existe instituição vinculada a este usuário
    const existing = await prisma.institution.findUnique({
      where: { userId },
    });

    if (existing) {
      // Atualiza caso já exista
      await prisma.institution.update({
        where: { id: existing.id },
        data: {
          name: validData.name.trim(),
          sector: validData.sector.trim(),
          city: validData.city.trim(),
          state: validData.state.trim().toUpperCase(),
          size: validData.size,
          description: validData.description?.trim() || null,
        },
      });
    } else {
      // Cria nova instituição
      await prisma.institution.create({
        data: {
          userId,
          name: validData.name.trim(),
          sector: validData.sector.trim(),
          city: validData.city.trim(),
          state: validData.state.trim().toUpperCase(),
          size: validData.size,
          description: validData.description?.trim() || null,
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/(dashboard)", "layout");
    revalidatePath("/onboarding");

    return {
      success: true,
      message: "Instituição cadastrada com sucesso!",
    };
  } catch (err: unknown) {
    console.error("Erro ao salvar instituição:", err);
    return {
      success: false,
      error: "Ocorreu um erro ao salvar os dados da instituição. Tente novamente.",
    };
  }
}

/**
 * Busca a Instituição do usuário autenticado atual
 */
export async function getCurrentUserInstitutionAction() {
  const { userId } = await auth();
  if (!userId) return null;

  return await prisma.institution.findUnique({
    where: { userId },
  });
}
