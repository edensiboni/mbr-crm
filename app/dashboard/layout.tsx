"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wrench, LayoutDashboard, FolderOpen, Users, Bot, ExternalLink, Settings, ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/cases", label: "Cases", icon: FolderOpen },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/store", label: "Store", icon: ShoppingBag },
  { href: "/dashboard/agent", label: "AI Agent", icon: Bot },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-60 bg-gray-900 flex-col shrink-0">
        <div className="h-16 flex items-center px-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-none">M.B.R</div>
              <div className="text-gray-400 text-xs">Engineer Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4 space-y-1 border-t border-gray-800 pt-4">
          <Link href="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <ExternalLink className="w-4 h-4" />Customer Site
          </Link>
          <Link href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <Settings className="w-4 h-4" />Settings
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm">M.B.R</span>
          </div>
          <Link href="/dashboard/settings" className="text-gray-400 hover:text-white">
            <Settings className="w-5 h-5" />
          </Link>
        </div>

        {children}
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-gray-900 border-t border-gray-800 flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs font-medium transition-colors",
              isActive(item.href)
                ? "text-blue-400"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            <item.icon className={cn("w-5 h-5", isActive(item.href) && "text-blue-400")} />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
