"use client";

import { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Eye,
} from "lucide-react";
import { formatDateTime, formatDate } from "@/lib/utils";
import { useCRM } from "@/components/AppShell";

export default function SchedulePage() {
  const { openModal, refreshTrigger, triggerRefresh } = useCRM();
  const [showings, setShowings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadShowings() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter !== "ALL") params.set("status", statusFilter);

        const res = await fetch(`/api/showings?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setShowings(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadShowings();
  }, [statusFilter, refreshTrigger]);

  async function updateStatus(id: string, newStatus: string) {
    try {
      await fetch(`/api/showings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  }

  const typeLabels: Record<string, { label: string; color: string }> = {
    PROPERTY_VIEWING: { label: "Site Visit & Walkthrough", color: "bg-blue-50 text-blue-800 border-blue-200" },
    OPEN_HOUSE: { label: "VIP Open House Showcase", color: "bg-purple-50 text-purple-800 border-purple-200" },
    CLIENT_MEETING: { label: "Vastu & Layout Consultation", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    INSPECTION: { label: "Structural & Snag Inspection", color: "bg-amber-50 text-amber-800 border-amber-200" },
    CLOSING: { label: "Sub-Registrar Registry & Signing", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-500" />
            Site Visits, Tours & Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {showings.length} scheduled site visits and client walkthroughs across luxury listings.
          </p>
        </div>

        <button
          onClick={() => openModal("showing")}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Event</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {["ALL", "SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === st
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Showings List */}
      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500">
          Loading schedule...
        </div>
      ) : showings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No events found</p>
          <p className="text-xs text-slate-400">Schedule your next property site visit or VIP walkthrough.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {showings.map((showing) => {
            const typeInfo = typeLabels[showing.type] || {
              label: showing.type,
              color: "bg-slate-50 text-slate-800 border-slate-200",
            };

            return (
              <div
                key={showing.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left details */}
                <div className="flex items-start gap-4">
                  {showing.property?.featuredImage ? (
                    <img
                      src={showing.property.featuredImage}
                      alt="Property"
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">
                        {showing.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeInfo.color}`}
                      >
                        {typeInfo.label}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          showing.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : showing.status === "COMPLETED"
                            ? "bg-slate-200 text-slate-700"
                            : showing.status === "CANCELLED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {showing.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>{showing.location || showing.property?.address || "Address upon confirmation"}</span>
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                      {showing.lead && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold text-slate-800">
                            {showing.lead.firstName} {showing.lead.lastName}
                          </span>
                        </div>
                      )}

                      <span>•</span>
                      <span>Agent: <span className="font-semibold text-slate-800">{showing.agentName}</span></span>
                    </div>

                    {showing.notes && (
                      <p className="text-[11px] text-slate-500 pt-1 italic">
                        Note: {showing.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions & Time */}
                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-3">
                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5 md:justify-end">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {formatDateTime(showing.startTime)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Duration: ~1 hour
                    </p>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5">
                    {showing.status !== "CONFIRMED" && showing.status !== "COMPLETED" && (
                      <button
                        onClick={() => updateStatus(showing.id, "CONFIRMED")}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-200 transition"
                      >
                        Confirm
                      </button>
                    )}

                    {showing.status !== "COMPLETED" && (
                      <button
                        onClick={() => updateStatus(showing.id, "COMPLETED")}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md transition"
                      >
                        Done
                      </button>
                    )}

                    {showing.status !== "CANCELLED" && (
                      <button
                        onClick={() => updateStatus(showing.id, "CANCELLED")}
                        className="px-2 py-1 text-slate-400 hover:text-rose-600 text-xs font-semibold transition"
                        title="Cancel Site Visit"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
