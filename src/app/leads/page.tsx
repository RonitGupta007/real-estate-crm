"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  MapPin,
  X,
  MessageSquare,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useCRM } from "@/components/AppShell";

export default function LeadsPage() {
  const { openModal, refreshTrigger, triggerRefresh } = useCRM();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [newNote, setNewNote] = useState("");
  const [loggingNote, setLoggingNote] = useState(false);

  useEffect(() => {
    async function loadLeads() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (typeFilter !== "ALL") params.set("type", typeFilter);
        if (statusFilter !== "ALL") params.set("status", statusFilter);

        const res = await fetch(`/api/leads?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setLeads(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLeads();
  }, [search, typeFilter, statusFilter, refreshTrigger]);

  async function openLeadDetail(leadId: string) {
    try {
      const res = await fetch(`/api/leads/${leadId}`);
      if (res.ok) {
        const fullLead = await res.json();
        setSelectedLead(fullLead);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim() || !selectedLead) return;
    setLoggingNote(true);

    try {
      await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "NOTE",
          title: "Agent Logged Note",
          description: newNote,
          leadId: selectedLead.id,
        }),
      });

      setNewNote("");
      // Reload lead details
      await openLeadDetail(selectedLead.id);
      triggerRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoggingNote(false);
    }
  }

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800",
    CONTACTED: "bg-slate-100 text-slate-800",
    QUALIFIED: "bg-emerald-100 text-emerald-800",
    SHOWING: "bg-amber-100 text-amber-800",
    NEGOTIATING: "bg-purple-100 text-purple-800",
    WON: "bg-emerald-600 text-white",
    LOST: "bg-rose-100 text-rose-800",
  };

  const priorityBadges: Record<string, { label: string; color: string }> = {
    URGENT: { label: "Urgent", color: "text-rose-600 bg-rose-50 border-rose-200" },
    HIGH: { label: "High", color: "text-amber-600 bg-amber-50 border-amber-200" },
    MEDIUM: { label: "Medium", color: "text-slate-600 bg-slate-50 border-slate-200" },
    LOW: { label: "Low", color: "text-slate-500 bg-slate-50 border-slate-200" },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Client & Lead Relationship Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking {leads.length} active clients across buyers, sellers, and luxury investors.
          </p>
        </div>

        <button
          onClick={() => openModal("lead")}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, phone, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["ALL", "BUYER", "SELLER", "INVESTOR", "AGENT"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex-shrink-0 ${
                typeFilter === type
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none w-full md:w-44"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New Lead</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="SHOWING">Showing Tours</option>
          <option value="NEGOTIATING">Negotiating</option>
          <option value="WON">Closed Won</option>
          <option value="LOST">Lost</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-xs text-slate-500">
            Loading clients database...
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">No clients found</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting your search or create a new client.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Client Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Type / Source</th>
                  <th className="py-3.5 px-4">Status & Priority</th>
                  <th className="py-3.5 px-4">Budget Range</th>
                  <th className="py-3.5 px-4">Assigned Agent</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => {
                  const pBadge = priorityBadges[lead.priority] || priorityBadges.MEDIUM;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/70 transition cursor-pointer"
                      onClick={() => openLeadDetail(lead.id)}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center shadow-xs">
                            {lead.firstName[0]}
                            {lead.lastName[0]}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block hover:text-amber-600 transition">
                              {lead.firstName} {lead.lastName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {lead.preferredLocation || "Location unspecified"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <a
                            href={`mailto:${lead.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-700 hover:text-amber-600 flex items-center gap-1.5"
                          >
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{lead.email}</span>
                          </a>
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-500 hover:text-amber-600 flex items-center gap-1.5 text-[11px]"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{lead.phone}</span>
                          </a>
                        </div>
                      </td>

                      {/* Type & Source */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                          {lead.type}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          via {lead.source}
                        </span>
                      </td>

                      {/* Status & Priority */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            statusColors[lead.status] || "bg-slate-100"
                          }`}
                        >
                          {lead.status}
                        </span>
                        <div className="mt-1">
                          <span
                            className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${pBadge.color}`}
                          >
                            {pBadge.label}
                          </span>
                        </div>
                      </td>

                      {/* Budget Range */}
                      <td className="py-3.5 px-4">
                        {lead.budgetMin || lead.budgetMax ? (
                          <div>
                            <span className="font-semibold text-slate-800">
                              {lead.budgetMin ? formatCurrency(lead.budgetMin) : "₹0"} -{" "}
                              {lead.budgetMax ? formatCurrency(lead.budgetMax) : "No limit"}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {lead.preferredType?.replace(/_/g, " ") || "Any Property"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Unspecified</span>
                        )}
                      </td>

                      {/* Assigned Agent */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">
                          {lead.assignedAgent}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openLeadDetail(lead.id);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition"
                        >
                          View File
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Slideover */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden">
            {/* Slideover Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm shadow-xs">
                  {selectedLead.firstName[0]}
                  {selectedLead.lastName[0]}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedLead.firstName} {selectedLead.lastName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedLead.type} • Assigned to {selectedLead.assignedAgent}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slideover Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Quick Contact Bar */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition flex items-center gap-2 text-slate-800"
                >
                  <Mail className="w-4 h-4 text-amber-500" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block font-semibold">Email</span>
                    <span className="font-medium truncate block">{selectedLead.email}</span>
                  </div>
                </a>
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition flex items-center gap-2 text-slate-800"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block font-semibold">Phone</span>
                    <span className="font-medium truncate block">{selectedLead.phone}</span>
                  </div>
                </a>
              </div>

              {/* Requirements & Budget */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs">Buyer Profile & Targets</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Budget Range</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(selectedLead.budgetMin)} - {formatCurrency(selectedLead.budgetMax)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Target Location</span>
                    <span className="font-semibold text-slate-900">
                      {selectedLead.preferredLocation || "Flexible"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Lead Status</span>
                    <span className="font-semibold text-slate-900">{selectedLead.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Lead Priority</span>
                    <span className="font-semibold text-slate-900">{selectedLead.priority}</span>
                  </div>
                </div>
                {selectedLead.notes && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-slate-400 text-[10px] block font-semibold">Client Notes</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{selectedLead.notes}</p>
                  </div>
                )}
              </div>

              {/* Log Note / Activity Form */}
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  Log Note or Phone Call
                </h4>
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Log summary of conversation, offer discussion, or requirements update..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full p-2.5 bg-white border border-amber-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loggingNote || !newNote.trim()}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-xs transition disabled:opacity-50"
                    >
                      {loggingNote ? "Logging..." : "Save Activity"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Deals Linked to this Lead */}
              {selectedLead.deals && selectedLead.deals.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    Active Pipeline Deals ({selectedLead.deals.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedLead.deals.map((d: any) => (
                      <div
                        key={d.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{d.title}</p>
                          <p className="text-[11px] text-slate-500">
                            Stage: <span className="font-semibold">{d.stage}</span>
                          </p>
                        </div>
                        <span className="font-bold text-indigo-600">
                          {formatCurrency(d.dealValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interaction Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs">Interaction Timeline</h4>
                {selectedLead.activities && selectedLead.activities.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLead.activities.map((act: any) => (
                      <div
                        key={act.id}
                        className="p-2.5 rounded-lg border border-slate-100 bg-white space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{act.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(act.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{act.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No activity logged yet.</p>
                )}
              </div>
            </div>

            {/* Slideover Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <Link
                  href="/portal"
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>VIP Portal</span>
                </Link>
                <button
                  onClick={() => {
                    setSelectedLead(null);
                    openModal("deal");
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                >
                  Create Deal
                </button>
                <button
                  onClick={() => {
                    setSelectedLead(null);
                    openModal("showing");
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-semibold transition"
                >
                  Book Showing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
