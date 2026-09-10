"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  KanbanSquare,
  Calendar,
  BarChart3,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  onOpenNewModal?: (type: "property" | "lead" | "deal" | "showing") => void;
}

export default function Sidebar({ onOpenNewModal }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "AI Follow-Ups", href: "/follow-ups", icon: Sparkles, badge: "AI" },
    { name: "Properties", href: "/properties", icon: Building2 },
    { name: "Leads & Clients", href: "/leads", icon: Users },
    { name: "Deals Pipeline", href: "/pipeline", icon: KanbanSquare },
    { name: "Schedule & Tours", href: "/schedule", icon: Calendar },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "VIP Client Portal", href: "/portal", icon: ShieldCheck, badge: "VIP" },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white block leading-none">
              ESTATIQ
            </span>
            <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold">
              LUXURY CRM
            </span>
          </div>
        </Link>
      </div>

      {/* Main Nav links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Core Brokerage
        </div>
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-slate-950" : "text-slate-400"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && !isActive && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/40 animate-pulse">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-slate-950" />}
              </div>
            </Link>
          );
        })}

        {/* Quick Actions in Sidebar */}
        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Quick Actions
        </div>
        <div className="space-y-1 px-1">
          <button
            onClick={() => onOpenNewModal?.("lead")}
            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-md transition flex items-center justify-between"
          >
            <span>+ New Lead / Client</span>
          </button>
          <button
            onClick={() => onOpenNewModal?.("property")}
            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-md transition flex items-center justify-between"
          >
            <span>+ New Listing</span>
          </button>
          <button
            onClick={() => onOpenNewModal?.("deal")}
            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-md transition flex items-center justify-between"
          >
            <span>+ New Pipeline Deal</span>
          </button>
          <button
            onClick={() => onOpenNewModal?.("showing")}
            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-md transition flex items-center justify-between"
          >
            <span>+ Book Showing</span>
          </button>
        </div>
      </div>

      {/* Broker Profile Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Sarah Jenkins"
              className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate flex items-center gap-1">
              Sarah Jenkins
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            </p>
            <p className="text-[11px] text-slate-400 truncate">Managing Principal Broker</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
