import Image from "next/image";
import { Button } from "./_components/ui/button";
import { LogInIcon } from "lucide-react";

export default function Home() {
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
        <Button variant="outline" className="gap-2 px-6 py-3 text-green-500">
          <LogInIcon />
          Acessar Sistema
        </Button>
      </div>
    </div>
  );
}
