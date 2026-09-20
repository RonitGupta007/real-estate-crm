"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle2,
  Clock,
  MapPin,
  Download,
  Send,
  Bed,
  Bath,
  Maximize2,
  Phone,
  Mail,
  ArrowLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export default function ClientPortalPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Message state
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  // Tour request state
  const [selectedPropForTour, setSelectedPropForTour] = useState<any | null>(null);
  const [tourDate, setTourDate] = useState("");
  const [tourNotes, setTourNotes] = useState("");
  const [tourRequested, setTourRequested] = useState(false);

  // 1. Fetch clients for switcher
  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch("/api/portal");
        if (res.ok) {
          const data = await res.json();
          setClients(data);
          if (data.length > 0) setSelectedClientId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadClients();
  }, []);

  // 2. Fetch selected client's data
  useEffect(() => {
    if (!selectedClientId) return;

    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/portal/${selectedClientId}`);
        if (res.ok) {
          const data = await res.json();
          setPortalData(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedClientId]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !selectedClientId) return;

    try {
      setSendingMessage(true);
      const res = await fetch("/api/portal/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId, message }),
      });

      if (res.ok) {
        setMessage("");
        setMessageSent(true);
        setTimeout(() => setMessageSent(false), 4000);
        // Refresh data
        const updated = await fetch(`/api/portal/${selectedClientId}`).then((r) => r.json());
        setPortalData(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleRequestTour() {
    if (!selectedPropForTour || !tourDate) {
      alert("Please choose a date and time for the walkthrough.");
      return;
    }

    try {
      const res = await fetch("/api/portal/request-tour", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          propertyId: selectedPropForTour.id,
          requestedDate: tourDate,
          notes: tourNotes,
        }),
      });

      if (res.ok) {
        setSelectedPropForTour(null);
        setTourDate("");
        setTourNotes("");
        setTourRequested(true);
        setTimeout(() => setTourRequested(false), 4000);
        const updated = await fetch(`/api/portal/${selectedClientId}`).then((r) => r.json());
        setPortalData(updated);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const client = portalData?.client;
  const activeDeal = portalData?.activeDeals?.[0];

  // Simplified 4-step Indian transaction roadmap
  const dealSteps = [
    {
      title: "Token & Booking (Bayana)",
      subtitle: "Unit blocked & advance KYC receipt issued",
      isComplete: ["OFFER_SUBMITTED", "UNDER_CONTRACT", "CLOSING", "CLOSED_WON"].includes(activeDeal?.stage),
      isCurrent: activeDeal?.stage === "OFFER_SUBMITTED",
    },
    {
      title: "BBA & Bank Loan Sanction",
      subtitle: "Builder-Buyer Agreement signed & loan sanctioned",
      isComplete: ["UNDER_CONTRACT", "CLOSING", "CLOSED_WON"].includes(activeDeal?.stage),
      isCurrent: activeDeal?.stage === "UNDER_CONTRACT",
    },
    {
      title: "Stamp Duty & Registry",
      subtitle: "Challan paid & Sub-Registrar deed registered",
      isComplete: ["CLOSING", "CLOSED_WON"].includes(activeDeal?.stage),
      isCurrent: activeDeal?.stage === "CLOSING",
    },
    {
      title: "Possession & Khata Transfer",
      subtitle: "OC obtained, keys handed over & Khata updated",
      isComplete: activeDeal?.stage === "CLOSED_WON",
      isCurrent: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar: Return to CRM & Discreet Client Switcher */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Broker CRM</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Previewing Client:</span>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs outline-none focus:border-amber-500"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Luxury Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">EstateInt</span>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  Private Client Vault • India
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Welcome back,{" "}
                <span className="text-white font-semibold">
                  {client ? `${client.firstName} ${client.lastName}` : "Valued Client"}
                </span>
              </p>
            </div>
          </div>

          {/* Broker Contact Card */}
          <div className="flex items-center gap-3 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold flex items-center justify-center text-xs shadow-xs">
              PS
            </div>
            <div>
              <p className="font-bold text-white text-xs">
                {client?.assignedAgent || "Priya Sharma"}
              </p>
              <p className="text-[10px] text-slate-400">Managing Principal Broker</p>
            </div>
            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-3">
              <a
                href="https://wa.me/919820044120"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 rounded-lg transition"
                title="WhatsApp Broker"
              >
                <MessageSquare className="w-3 h-3" />
              </a>
              <a
                href="tel:+919820044120"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition"
                title="Call Broker"
              >
                <Phone className="w-3 h-3" />
              </a>
              <a
                href="mailto:priya@estateint.in"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition"
                title="Email Broker"
              >
                <Mail className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Unified Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
        {loading ? (
          <div className="py-32 text-center text-xs text-slate-500">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading your private portfolio...
          </div>
        ) : (
          <>
            {/* Feedback Notifications */}
            {messageSent && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-600/80 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Message sent directly to your managing broker.</span>
              </div>
            )}
            {tourRequested && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-600/80 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Private tour requested! Your broker will confirm timing shortly.</span>
              </div>
            )}

            {/* SECTION 1: ACTIVE TRANSACTION ROADMAP (IF APPLICABLE) */}
            {activeDeal && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Active Transaction Roadmap
                    </span>
                    <h2 className="text-xl font-bold text-white mt-0.5">
                      {activeDeal.title}
                    </h2>
                    {activeDeal.property && (
                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 mt-1">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          {activeDeal.property.address}, {activeDeal.property.city}
                        </p>
                        {activeDeal.property.reraId && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                            {activeDeal.property.reraId}
                          </span>
                        )}
                        {activeDeal.property.facingDirection && (
                          <span className="text-[10px] text-emerald-400 font-medium">
                            • {activeDeal.property.facingDirection}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                      Agreed Price
                    </span>
                    <span className="text-xl font-bold text-white">
                      {formatCurrency(activeDeal.dealValue)}
                    </span>
                  </div>
                </div>

                {/* 4-Step Progress Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                  {dealSteps.map((step, i) => (
                    <div
                      key={step.title}
                      className={`p-3.5 rounded-xl border transition ${
                        step.isCurrent
                          ? "bg-amber-500/10 border-amber-500/50 text-amber-100"
                          : step.isComplete
                          ? "bg-slate-950/70 border-slate-800 text-slate-300"
                          : "bg-slate-950/30 border-slate-900 text-slate-500"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            step.isComplete
                              ? "bg-emerald-500 text-slate-950"
                              : step.isCurrent
                              ? "bg-amber-500 text-slate-950"
                              : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          {step.isComplete ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                        </div>
                        <span className="text-xs font-bold text-white">{step.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{step.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: TWO-COLUMN MAIN WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (7 cols): Upcoming Tours & Curated Matches */}
              <div className="lg:col-span-7 space-y-6">
                {/* Upcoming Showing / Tour */}
                {portalData?.scheduledTours?.length > 0 && (
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        Next Private Showing
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                        {portalData.scheduledTours[0].status}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <h4 className="font-bold text-white">
                          {portalData.scheduledTours[0].title}
                        </h4>
                        <p className="text-slate-400 flex items-center gap-1 mt-0.5 text-[11px]">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          {portalData.scheduledTours[0].location || "Location provided upon confirmation"}
                        </p>
                      </div>

                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className="font-bold text-amber-400 flex items-center gap-1 sm:justify-end">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(portalData.scheduledTours[0].startTime)}
                        </p>
                        <p className="text-[10px] text-slate-500">Accompanied Tour</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Curated Properties for Client */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                        <Building2 className="w-4 h-4 text-amber-500" />
                        Curated Properties for You
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Handpicked by your broker matching your location and budget.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {portalData?.curatedProperties?.slice(0, 3).map((prop: any) => (
                      <div
                        key={prop.id}
                        className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prop.featuredImage}
                            alt={prop.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="text-xs">
                            <h4 className="font-bold text-white leading-snug">{prop.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {prop.city}, {prop.state} • {prop.bhkConfig || `${prop.bedrooms} BHK`} • {prop.squareFeet ? `${prop.squareFeet.toLocaleString()} sq.ft` : ""}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-bold text-amber-400">
                                {formatCurrency(prop.price)}
                              </span>
                              {prop.reraId && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-amber-300/80 rounded font-medium">
                                  RERA Approved
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedPropForTour(prop);
                            const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
                            d.setHours(11, 0, 0, 0);
                            setTourDate(d.toISOString().slice(0, 16));
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 flex-shrink-0 transition"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Request Tour</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Key Documents & Direct Message */}
              <div className="lg:col-span-5 space-y-6">
                {/* Key Transaction Documents */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-amber-500" />
                    Transaction Documents
                  </h3>

                  <div className="space-y-2">
                    {portalData?.documents && portalData.documents.length > 0 ? (
                      portalData.documents.slice(0, 3).map((doc: any) => (
                        <div
                          key={doc.id}
                          className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span className="text-white font-medium truncate">{doc.title}</span>
                          </div>
                          <button
                            onClick={() => alert(`Downloading: ${doc.title}`)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-md transition flex-shrink-0"
                            title="Download Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 py-3 text-center">
                        Documents will appear here once contracts are initiated.
                      </p>
                    )}
                  </div>
                </div>

                {/* Direct Message Box */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                      <MessageSquare className="w-4 h-4 text-amber-500" />
                      Message Your Broker
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Direct line to Priya Sharma.
                    </p>
                  </div>

                  <form onSubmit={handleSendMessage} className="space-y-2.5 text-xs">
                    <textarea
                      rows={3}
                      required
                      placeholder="Ask a question about closing, schedule a tour, or share feedback..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-amber-500 placeholder:text-slate-600 leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={sendingMessage || !message.trim()}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />
                        <span>{sendingMessage ? "Sending..." : "Send Message"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* MODAL: TOUR REQUEST DIALOG */}
            {selectedPropForTour && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="text-sm font-bold text-white">
                      Request Private Walkthrough
                    </h4>
                    <button
                      onClick={() => setSelectedPropForTour(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">{selectedPropForTour.title}</p>
                    <p className="text-[11px] text-slate-400">{selectedPropForTour.address}, {selectedPropForTour.city}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">Preferred Date & Time</label>
                    <input
                      type="datetime-local"
                      value={tourDate}
                      onChange={(e) => setTourDate(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">Notes / Questions (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Bringing contractor, interested in lot boundary..."
                      value={tourNotes}
                      onChange={(e) => setTourNotes(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setSelectedPropForTour(null)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRequestTour}
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold"
                    >
                      Confirm Request
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
