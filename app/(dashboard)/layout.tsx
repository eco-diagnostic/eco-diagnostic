import type { Metadata } from "next";
import "../globals.css";
import { SidebarProvider, SidebarTrigger } from "../_components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import Image from "next/image";
import { Toaster } from "sonner";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

import { prisma } from "../_lib/prisma";

export const metadata: Metadata = {
  title: "Eco Diagnóstico - Painel",
  description: "Sistema de diagnóstico e evolução da sustentabilidade",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  // Verifica se o usuário possui instituição cadastrada no banco
  const institution = await prisma.institution.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!institution) {
    redirect("/onboarding");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <Toaster />
      <main className="bg-primary/5 min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
          </div>

          <div className="flex items-center gap-3">
            <UserButton showName />
          </div>
        </header>

        <div className="relative isolate overflow-hidden p-4">
          <Image
            src="/folha.png"
            alt=""
            aria-hidden="true"
            fill
            className="z-0 scale-[0.7] object-contain opacity-[0.05]"
          />

          <div className="relative z-10">{children}</div>
        </div>
      </main>
    </SidebarProvider>
  );
}
