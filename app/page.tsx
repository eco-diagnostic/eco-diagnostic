import Image from "next/image";
import { Button } from "./_components/ui/button";
import { LogInIcon } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./_lib/prisma";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    const institution = await prisma.institution.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!institution) {
      redirect("/onboarding");
    } else {
      redirect("/dashboard");
    }
  }
  return (
    // DIV GERAL RESPONSIVA (Mobile vertical / Desktop 2 colunas)
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* SEÇÃO DA MARCA / LOGO */}
      <div className="relative min-h-[320px] md:min-h-screen">
        <Image
          src="/background.png"
          alt="background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-6 text-center backdrop-blur-[2px]">
          <div className="mb-2">
            <Image src="/folha.png" alt="logo" width={96} height={96} priority />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-green-400 sm:text-4xl">Eco</span>
            <span className="text-3xl font-extrabold text-green-500 sm:text-4xl">
              Diagnóstico
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-white/90 sm:text-base">
            Sistema de diagnóstico ambiental
          </p>
        </div>
      </div>

      {/* SEÇÃO DE LOGIN */}
      <div className="flex flex-col items-center justify-center p-6 text-center md:p-12">
        <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Bem-vindo!</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Este é o seu sistema de diagnóstico ambiental. Faça login para acessar
            o sistema e começar a utilizar as funcionalidades disponíveis.
          </p>
          <SignInButton mode="modal">
            <Button
              variant="outline"
              className="text-primary hover:bg-primary/10 mt-2 h-12 w-full max-w-xs gap-2 px-6 py-3 font-semibold shadow-sm transition-all sm:w-auto"
            >
              <LogInIcon className="size-5" />
              Acessar Sistema
            </Button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
