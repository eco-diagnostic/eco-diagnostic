import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Sprout,
  Sparkles,
  ArrowRight,
  HardHat,
  Home,
} from "lucide-react";
import { buttonVariants } from "@/app/_components/ui/button";
import { cn } from "@/app/_lib/utils";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background px-4 py-8 text-foreground sm:py-12">
      {/* Marca d'água de folha ao fundo */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="relative size-[600px] opacity-[0.04] sm:size-[800px]">
          <Image
            src="/folha.png"
            alt=""
            fill
            sizes="(max-width: 768px) 600px, 800px"
            className="select-none object-contain"
            priority
          />
        </div>
        {/* Brilho radial sutil */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Cabeçalho / Identidade da marca */}
      <header className="relative z-10 flex w-full max-w-5xl items-center justify-between">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-primary/10 p-1.5 transition-transform group-hover:scale-105">
            <Image
              src="/folha.png"
              alt="Logo Eco Diagnóstico"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center text-lg font-bold tracking-tight">
              <span className="font-extrabold text-primary">Eco</span>
              <span className="text-foreground">Diagnóstico</span>
            </div>
            <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Sustentabilidade em Evolução
            </span>
          </div>
        </Link>
      </header>

      {/* Cartão Central / Hero 404 */}
      <main className="relative z-10 my-auto flex w-full max-w-xl flex-col items-center px-2 text-center">
        {/* Badge criativo */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-xs">
          <Sparkles className="size-3.5 animate-pulse text-primary" />
          <span>404 • Novidade a caminho</span>
          <span className="flex size-1.5 rounded-full bg-primary animate-ping" />
        </div>

        {/* Ilustração e Ícone estilizado */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="relative flex size-28 items-center justify-center rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent shadow-xl shadow-primary/5">
            <Sprout className="size-14 text-primary transition-transform duration-300 hover:scale-110" />

            {/* Mini badge de construção */}
            <div className="absolute -right-2 -bottom-2 flex size-9 items-center justify-center rounded-xl border border-background bg-primary text-primary-foreground shadow-md">
              <HardHat className="size-4.5" />
            </div>
          </div>
        </div>

        {/* Número 404 em destaque */}
        <div className="mb-2 select-none text-6xl font-black tracking-tight text-primary/80 sm:text-7xl">
          404
        </div>

        {/* Título Principal */}
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Estamos cultivando esta página! 🌱
        </h1>

        {/* Mensagem simpática e acolhedora */}
        <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
          Esta página está sendo desenvolvida com muito carinho pela nossa
          equipe. Em breve você terá acesso a novidades exclusivas, análises
          detalhadas e novas ferramentas para transformar a sustentabilidade da
          sua instituição.
        </p>

        {/* Pílula informativa */}
        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-4 py-2 text-xs text-muted-foreground shadow-xs">
          <span className="size-2 shrink-0 rounded-full bg-amber-500" />
          <span>Em fase de desenvolvimento • Volte em breve para conferir!</span>
        </div>

        {/* Botões de Ação */}
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 w-full cursor-pointer gap-2 rounded-xl px-6 font-semibold shadow-md transition-all hover:shadow-lg active:scale-95 sm:w-auto"
            )}
          >
            <LayoutDashboard className="size-4" />
            <span>Voltar ao Dashboard</span>
            <ArrowRight className="size-4" />
          </Link>

          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 w-full cursor-pointer gap-2 rounded-xl border-border px-5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95 sm:w-auto"
            )}
          >
            <Home className="size-4" />
            <span>Página Inicial</span>
          </Link>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="relative z-10 mt-8 text-center text-xs text-muted-foreground">
        <p>
          Eco Diagnóstico • Sistema de Diagnóstico e Gestão Ambiental
        </p>
      </footer>
    </div>
  );
}
