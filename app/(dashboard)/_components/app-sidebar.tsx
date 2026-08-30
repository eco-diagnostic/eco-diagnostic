"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/_components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import {
  ChartNoAxesColumn,
  ClipboardList,
  FileChartColumn,
  LayoutDashboard,
  Lightbulb,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Diagnósticos",
    href: "/diagnosticos",
    icon: Stethoscope,
  },
  {
    title: "Questionários",
    href: "/questionarios",
    icon: ClipboardList,
  },
  {
    title: "Resultados",
    href: "/resultados",
    icon: ChartNoAxesColumn,
  },
  {
    title: "Evolução",
    href: "/evolucao",
    icon: TrendingUp,
  },
  {
    title: "Recomendações",
    href: "/recomendacoes",
    icon: Lightbulb,
  },
  {
    title: "Relatórios",
    href: "/relatorios",
    icon: FileChartColumn,
  },
];
export function AppSidebar() {
  const pathName = usePathname();
  return (
    <Sidebar
      collapsible="icon"
      className="border-border/80 border-r bg-green-100"
    >
      <SidebarHeader>
        <div className="flex items-center justify-center">
          <Image
            src="/folha.png"
            alt="Logo"
            width={32}
            height={32}
            className="shrink-0"
          />

          <div className="whitespace-nowrap group-data-[collapsible=icon]:hidden">
            <span className="text-2xl font-bold text-green-500">Eco</span>
            <span className="text-2xl font-bold text-green-800">
              Diagnóstico
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="mt-4 gap-2 px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathName === item.href;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  tooltip={item.title}
                  isActive={isActive}
                  className={`p-2 ${
                    isActive
                      ? "rounded-lg hover:bg-green-500/10 data-active:bg-green-500/20 data-active:text-green-700"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon />
                      <span>{item.title}</span>
                    </div>
                    <div>
                      {isActive && (
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      )}
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <div className="text-muted-foreground p-2 text-sm">
          <UserButton showName />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
