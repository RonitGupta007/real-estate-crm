"use client";

import { useEffect, useState } from "react";
import {
  KanbanSquare,
  Plus,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Building2,
  User,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCRM } from "@/components/AppShell";

const STAGES = [
  { id: "DISCOVERY", title: "Discovery / Vastu Match", color: "border-t-slate-500", badge: "bg-slate-100 text-slate-700" },
  { id: "SHOWING", title: "Site Visit & Inspection", color: "border-t-blue-500", badge: "bg-blue-50 text-blue-800" },
  { id: "OFFER_SUBMITTED", title: "Token / Booking (Bayana)", color: "border-t-amber-500", badge: "bg-amber-50 text-amber-800" },
  { id: "UNDER_CONTRACT", title: "BBA & Loan Sanction", color: "border-t-indigo-600", badge: "bg-indigo-50 text-indigo-800" },
  { id: "CLOSING", title: "Stamp Duty & Registry", color: "border-t-purple-500", badge: "bg-purple-50 text-purple-800" },
  { id: "CLOSED_WON", title: "Possession & Khata", color: "border-t-emerald-500", badge: "bg-emerald-100 text-emerald-800" },
];

export default function PipelinePage() {
  const { openModal, refreshTrigger, triggerRefresh } = useCRM();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingDealId, setUpdatingDealId] = useState<string | null>(null);

  useEffect(() => {
    async function loadDeals() {
      try {
        setLoading(true);
        const res = await fetch("/api/deals");
        if (res.ok) {
          const data = await res.json();
          setDeals(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDeals();
  }, [refreshTrigger]);

  async function handleMoveStage(dealId: string, nextStage: string) {
    try {
      setUpdatingDealId(dealId);
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: nextStage }),
      });

      if (res.ok) {
        // Optimistically or locally update
        setDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, stage: nextStage } : d))
        );
        triggerRefresh();
      }
    } catch (e) {
      console.error("Failed to move deal stage:", e);
    } finally {
      setUpdatingDealId(null);
    }
  }

  const totalPipelineValue = deals
    .filter((d) => d.stage !== "CLOSED_WON" && d.stage !== "CLOSED_LOST")
    .reduce((acc, d) => acc + (d.dealValue || 0), 0);

  const totalCommissions = deals.reduce((acc, d) => acc + (d.expectedCommission || 0), 0);

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <KanbanSquare className="w-5 h-5 text-indigo-600" />
            Deals & Transactions Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Active pipeline volume:{" "}
            <span className="font-semibold text-slate-900">
              {formatCurrency(totalPipelineValue)}
            </span>{" "}
            • Total projected commission:{" "}
            <span className="font-semibold text-emerald-600">
              {formatCurrency(totalCommissions)}
            </span>
          </p>
        </div>

        <button
          onClick={() => openModal("deal")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Deal</span>
        </button>
      </div>

      {/* Kanban Board Container */}
      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500">
          Loading deal pipeline...
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[600px] items-start snap-x snap-mandatory scroll-smooth">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            const stageTotal = stageDeals.reduce((acc, d) => acc + (d.dealValue || 0), 0);

            return (
              <div
                key={stage.id}
                className="w-[85vw] sm:w-80 flex-shrink-0 bg-slate-100/70 rounded-2xl border border-slate-200/90 flex flex-col max-h-[800px] snap-start"
              >
                {/* Stage Header */}
                <div
                  className={`p-4 border-t-4 ${stage.color} rounded-t-2xl bg-white border-b border-slate-200/80`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 tracking-tight">
                      {stage.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stage.badge}`}>
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Volume</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(stageTotal)}
                    </span>
                  </div>
                </div>

                {/* Stage Cards List */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {stageDeals.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs italic">
                      No deals in this stage
                    </div>
                  ) : (
                    stageDeals.map((deal) => {
                      const currentStageIndex = STAGES.findIndex((s) => s.id === deal.stage);
                      const prevStage = STAGES[currentStageIndex - 1];
                      const nextStage = STAGES[currentStageIndex + 1];

                      return (
                        <div
                          key={deal.id}
                          className={`bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-3 relative group ${
                            updatingDealId === deal.id ? "opacity-50 pointer-events-none" : ""
                          }`}
                        >
                          {/* Deal Title */}
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 leading-snug">
                              {deal.title}
                            </h4>
                            {deal.property && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                <span className="truncate">{deal.property.title}</span>
                              </p>
                            )}
                          </div>

                          {/* Deal Values */}
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">
                                Value
                              </span>
                              <span className="text-sm font-bold text-slate-900">
                                {formatCurrency(deal.dealValue)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block uppercase">
                                Commission ({deal.commissionRate || 3}%)
                              </span>
                              <span className="text-xs font-bold text-emerald-600">
                                {formatCurrency(deal.expectedCommission)}
                              </span>
                            </div>
                          </div>

                          {/* Lead / Client Info */}
                          {deal.lead && (
                            <div className="flex items-center gap-2 text-[11px] text-slate-600">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="font-medium text-slate-800">
                                {deal.lead.firstName} {deal.lead.lastName}
                              </span>
                            </div>
                          )}

                          {/* Probability Bar */}
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span>Win Probability</span>
                              <span className="font-semibold text-slate-700">
                                {deal.probability}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                          </div>

                          {/* Closing Date */}
                          {deal.closeDate && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>Target Close: {formatDate(deal.closeDate)}</span>
                            </div>
                          )}

                          {/* Stage Transition Controls */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            {prevStage ? (
                              <button
                                onClick={() => handleMoveStage(deal.id, prevStage.id)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded text-[10px] flex items-center gap-0.5"
                                title={`Move back to ${prevStage.title}`}
                              >
                                <ChevronLeft className="w-3 h-3" />
                                <span>Back</span>
                              </button>
                            ) : (
                              <div></div>
                            )}

                            {nextStage ? (
                              <button
                                onClick={() => handleMoveStage(deal.id, nextStage.id)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-semibold text-[10px] flex items-center gap-1 transition"
                                title={`Advance to ${nextStage.title}`}
                              >
                                <span>Advance</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Won
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
