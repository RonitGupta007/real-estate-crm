"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Bell,
  Building2,
  Users,
  KanbanSquare,
  Calendar,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

interface NavbarProps {
  onOpenNewModal: (type: "property" | "lead" | "deal" | "showing") => void;
  onSearchChange?: (term: string) => void;
  searchTerm?: string;
}

export default function Navbar({
  onOpenNewModal,
  onSearchChange,
  searchTerm = "",
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search listings, clients, addresses, deals..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/60 rounded-full text-xs font-medium text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>CRM Live • SQLite Synced</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-900">Notifications</span>
                <span className="text-[10px] text-amber-600 font-medium">3 Unread</span>
              </div>
              <div className="py-2 space-y-2.5">
                <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-100/50">
                  <p className="font-medium text-slate-800">Alexander Wright submitted offer</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">$6.75M on Bel Air Modern Sanctuary</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-medium text-slate-800">Showing confirmed tomorrow 10:00 AM</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Sophia Chen at 64 Franklin St Loft</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-medium text-slate-800">Earnest money deposited</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Brickell Penthouse escrow opened</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Create Record</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setDropdownOpen(false)}
            >
              <button
                onClick={() => onOpenNewModal("lead")}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-2.5 transition"
              >
                <Users className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-medium text-slate-900">New Lead / Client</div>
                  <div className="text-[10px] text-slate-400">Add buyer, seller or investor</div>
                </div>
              </button>

              <button
                onClick={() => onOpenNewModal("property")}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-2.5 transition"
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-medium text-slate-900">New Property Listing</div>
                  <div className="text-[10px] text-slate-400">Publish or catalog listing</div>
                </div>
              </button>

              <button
                onClick={() => onOpenNewModal("deal")}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-2.5 transition"
              >
                <KanbanSquare className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-medium text-slate-900">New Pipeline Deal</div>
                  <div className="text-[10px] text-slate-400">Track offer or active escrow</div>
                </div>
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={() => onOpenNewModal("showing")}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-2.5 transition"
              >
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-medium text-slate-900">Schedule Showing</div>
                  <div className="text-[10px] text-slate-400">Book property tour or walkthrough</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
