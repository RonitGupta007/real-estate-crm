"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import NewPropertyModal from "./modals/NewPropertyModal";
import NewLeadModal from "./modals/NewLeadModal";
import NewDealModal from "./modals/NewDealModal";
import NewShowingModal from "./modals/NewShowingModal";

import { usePathname } from "next/navigation";

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
        {/* Persistent Dark Luxury Sidebar */}
        <Sidebar onOpenNewModal={handleOpenModal} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar
            onOpenNewModal={handleOpenModal}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            {children}
          </main>
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
