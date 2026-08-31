import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/_lib/prisma";
import { OnboardingForm } from "./_components/onboarding-form";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { Toaster } from "sonner";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Se o usuário já possui instituição cadastrada, redireciona diretamente ao Dashboard
  const existingInstitution = await prisma.institution.findUnique({
    where: { userId },
  });

  if (existingInstitution) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <Toaster />

      {/* BACKGROUND DECORATIVO */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="/folha.png"
          alt=""
          aria-hidden="true"
          fill
          className="scale-[0.5] object-contain opacity-[0.03] dark:opacity-[0.02]"
        />
      </div>

      {/* HEADER SIMPLES */}
      <header className="relative z-10 flex h-16 w-full items-center justify-between border-b bg-white/80 px-6 backdrop-blur dark:bg-slate-900/80">
        <div className="flex items-center gap-2">
          <Image src="/folha.png" alt="Logo" width={28} height={28} />
          <div className="flex items-center">
            <span className="text-xl font-bold text-green-500">Eco</span>
            <span className="text-xl font-bold text-green-800 dark:text-green-400">
              Diagnóstico
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            Configuração Inicial
          </span>
          <UserButton showName />
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-8">
        <OnboardingForm />
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 py-4 text-center text-xs text-muted-foreground">
        Eco Diagnóstico &copy; {new Date().getFullYear()} — Plataforma de Diagnóstico e Gestão de Sustentabilidade
      </footer>
    </div>
  );
}
