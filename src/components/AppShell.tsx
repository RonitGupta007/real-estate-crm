"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import NewPropertyModal from "./modals/NewPropertyModal";
import NewLeadModal from "./modals/NewLeadModal";
import NewDealModal from "./modals/NewDealModal";
import NewShowingModal from "./modals/NewShowingModal";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  KanbanSquare,
  Sparkles,
} from "lucide-react";

interface CRMContextType {
  openModal: (type: "property" | "lead" | "deal" | "showing") => void;
  searchTerm: string;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const CRMContext = createContext<CRMContextType>({
  openModal: () => {},
  searchTerm: "",
  refreshTrigger: 0,
  triggerRefresh: () => {},
});

export const useCRM = () => useContext(CRMContext);

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [modalType, setModalType] = useState<"property" | "lead" | "deal" | "showing" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleOpenModal = (type: "property" | "lead" | "deal" | "showing") => {
    setModalType(type);
  };

  // If on VIP Client Portal route, render portal in immersive full-screen view
  if (pathname?.startsWith("/portal")) {
    return (
      <CRMContext.Provider
        value={{
          openModal: handleOpenModal,
          searchTerm,
          refreshTrigger,
          triggerRefresh,
        }}
      >
        <div className="h-screen w-screen overflow-y-auto bg-slate-950 text-slate-100">
          {children}
        </div>
      </CRMContext.Provider>
    );
  }

  const mobileNavItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Listings", href: "/properties", icon: Building2 },
    { name: "Clients", href: "/leads", icon: Users },
    { name: "Pipeline", href: "/pipeline", icon: KanbanSquare },
    { name: "AI Outreach", href: "/follow-ups", icon: Sparkles },
  ];

  return (
    <CRMContext.Provider
      value={{
        openModal: handleOpenModal,
        searchTerm,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
        {/* Sidebar (Desktop persistent, Mobile slide-over drawer) */}
        <Sidebar
          onOpenNewModal={handleOpenModal}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar
            onOpenNewModal={handleOpenModal}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 pb-24 md:pb-8">
            {children}
          </main>

          {/* Mobile Bottom Navigation Bar (< md screens) */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
            {mobileNavItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition text-[10px] font-medium ${
                    isActive
                      ? "text-amber-600 font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mb-0.5 ${
                      isActive ? "text-amber-500 stroke-[2.5]" : "text-slate-400"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Global Record Modals */}
        <NewPropertyModal
          isOpen={modalType === "property"}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            triggerRefresh();
          }}
        />

        <NewLeadModal
          isOpen={modalType === "lead"}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            triggerRefresh();
          }}
        />

        <NewDealModal
          isOpen={modalType === "deal"}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            triggerRefresh();
          }}
        />

        <NewShowingModal
          isOpen={modalType === "showing"}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            triggerRefresh();
          }}
        />
      </div>
    </CRMContext.Provider>
  );
}
