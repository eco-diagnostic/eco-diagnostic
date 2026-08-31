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
    // DIV GERAL
    <div className="grid h-screen grid-cols-2">
      {/* ESQUERDA */}
      <div className="relative">
        <Image
          src="/background.png"
          alt="background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
          <div>
            <Image src="/folha.png" alt="logo" width={100} height={100} />
          </div>
          <div>
            <span className="text-4xl font-bold text-green-400">Eco</span>
            <span className="text-4xl font-bold text-green-500">
              Diagnóstico
            </span>
          </div>
          <p className="font-medium text-white">
            Sistema de diagnóstico ambiental
          </p>
        </div>
      </div>

      {/* DIREIRA */}
      <div className="mx-auto flex w-100 flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Bem-vindo!</h1>
        <p className="text-muted-foreground">
          Este é o seu sistema de diagnóstico ambiental. Faça login para acessar
          o sistema e começar a utilizar as funcionalidades disponíveis.
        </p>
        <SignInButton mode="modal">
          <Button variant="outline" className="text-primary gap-2 px-6 py-3">
            <LogInIcon />
            Acessar Sistema
          </Button>
        </SignInButton>
      </div>
    </div>
  );
}
