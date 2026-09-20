"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  KanbanSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  Sparkles,
  Plus,
  ChevronRight,
  Flame,
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useCRM } from "@/components/AppShell";

export default function DashboardPage() {
  const { openModal, refreshTrigger, triggerRefresh } = useCRM();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [refreshTrigger]);

  async function updateShowingStatus(showingId: string, status: string) {
    try {
      await fetch(`/api/showings/${showingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium">Loading brokerage intelligence...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Active Portfolio Value",
      value: formatCurrency(stats?.totalPortfolioValue || 0),
      subtitle: `${stats?.activeListingsCount || 0} active luxury listings`,
      icon: Building2,
      color: "from-amber-500 to-amber-600",
      link: "/properties",
    },
    {
      title: "Active Deal Pipeline",
      value: formatCurrency(stats?.totalPipelineValue || 0),
      subtitle: `${stats?.activeDealsCount || 0} transactions in progress`,
      icon: KanbanSquare,
      color: "from-blue-600 to-indigo-600",
      link: "/pipeline",
    },
    {
      title: "Commission Earned (YTD)",
      value: formatCurrency(stats?.earnedCommission || 0),
      subtitle: `${formatCurrency(stats?.closedSalesVolume || 0)} closed volume`,
      icon: DollarSign,
      color: "from-emerald-600 to-teal-600",
      link: "/analytics",
    },
    {
      title: "Active Clients & Leads",
      value: `${stats?.totalLeadsCount || 0}`,
      subtitle: "High-net-worth buyers & sellers",
      icon: Users,
      color: "from-purple-600 to-violet-600",
      link: "/leads",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Executive Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Executive Brokerage Dashboard
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-800 rounded-md">
              Priya Sharma Realty Partners • Mumbai & NCR
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time overview of active listings, pending token agreements, scheduled site visits, and brokerage revenue.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/follow-ups"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-900 to-slate-900 hover:from-indigo-800 hover:to-slate-800 text-amber-400 rounded-lg text-xs font-semibold shadow-xs transition border border-indigo-700/50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI Follow-Ups Hub</span>
          </Link>

          <button
            onClick={() => openModal("lead")}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-lg text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </button>

          <button
            onClick={() => openModal("showing")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Site Visit</span>
          </button>
        </div>
      </div>

      {/* Agentic Follow-Up Copilot Recommendation Strip */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-indigo-50/60 p-4 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Agentic Outreach Copilot: Active Follow-Up Signals Detected</span>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-200/80 text-amber-900 rounded-full">
                Action Required
              </span>
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Post-visit window active for Rohan Kapoor (Kingfisher Towers) • Token advance terms pending for Vikramaditya Singhania.
            </p>
          </div>
        </div>

        <Link
          href="/follow-ups"
          className="flex-shrink-0 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
        >
          <span>Review AI Drafts</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={idx}
              href={kpi.link}
              className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">{kpi.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight group-hover:text-amber-600 transition-colors">
                    {kpi.value}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">{kpi.subtitle}</p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white shadow-md shadow-slate-900/10`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-amber-600 transition-colors">
                <span>View details</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Deal Pipeline Funnel Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <KanbanSquare className="w-4 h-4 text-amber-500" />
              Deal Pipeline Velocity
            </h2>
            <p className="text-xs text-slate-500">
              Weighted Projected Commission:{" "}
              <span className="font-semibold text-emerald-600">
                {formatCurrency(stats?.projectedCommission || 0)}
              </span>
            </p>
          </div>
          <Link
            href="/pipeline"
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>Open Pipeline Kanban</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Funnel Stage Badges */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {(stats?.dealsByStage || []).slice(0, 6).map((stageItem: any) => {
            const stageLabels: Record<string, string> = {
              DISCOVERY: "Discovery / Vastu",
              SHOWING: "Site Visit",
              OFFER_SUBMITTED: "Token / Bayana",
              UNDER_CONTRACT: "BBA / Loan",
              CLOSING: "Stamp & Registry",
              CLOSED_WON: "Possession & Khata",
            };

            const colors: Record<string, string> = {
              DISCOVERY: "bg-slate-50 border-slate-200 text-slate-700",
              SHOWING: "bg-blue-50/60 border-blue-200 text-blue-900",
              OFFER_SUBMITTED: "bg-amber-50/70 border-amber-200 text-amber-900",
              UNDER_CONTRACT: "bg-indigo-50/70 border-indigo-200 text-indigo-900",
              CLOSING: "bg-purple-50/70 border-purple-200 text-purple-900",
              CLOSED_WON: "bg-emerald-50 border-emerald-200 text-emerald-900",
            };

            return (
              <div
                key={stageItem.stage}
                className={`p-3 rounded-xl border ${colors[stageItem.stage] || "bg-slate-50 border-slate-200"} flex flex-col justify-between`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                    {stageLabels[stageItem.stage] || stageItem.stage}
                  </span>
                  <span className="text-base font-bold block mt-1">
                    {formatCurrency(stageItem.value)}
                  </span>
                </div>
                <div className="mt-2 text-[11px] font-medium opacity-80 flex items-center justify-between">
                  <span>{stageItem.count} {stageItem.count === 1 ? "deal" : "deals"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Upcoming Showings & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upcoming Showings (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">Upcoming Showings & Tours</h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-full">
                {stats?.upcomingShowings?.length || 0} scheduled
              </span>
            </div>
            <Link
              href="/schedule"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>Full Calendar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="py-3 space-y-3.5 flex-1">
            {stats?.upcomingShowings && stats.upcomingShowings.length > 0 ? (
              stats.upcomingShowings.map((showing: any) => (
                <div
                  key={showing.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    {showing.property?.featuredImage ? (
                      <img
                        src={showing.property.featuredImage}
                        alt="Property thumbnail"
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        {showing.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {showing.location || showing.property?.address || "Address pending"}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-800">
                          {showing.lead
                            ? `${showing.lead.firstName} ${showing.lead.lastName}`
                            : "Direct Walkthrough"}
                        </span>
                        <span>•</span>
                        <span className="text-amber-700 font-medium">
                          Agent: {showing.agentName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-[11px] font-semibold text-slate-900 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDateTime(showing.startTime)}
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full mt-1 ${
                          showing.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : showing.status === "COMPLETED"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {showing.status}
                      </span>
                    </div>

                    {showing.status !== "COMPLETED" && (
                      <button
                        onClick={() => updateShowingStatus(showing.id, "COMPLETED")}
                        className="text-[10px] font-medium text-slate-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">
                No upcoming showings scheduled. Book a showing using the button above.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live CRM Activity Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">Live Activity Feed</h2>
            </div>
            <button
              onClick={() => openModal("deal")}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              + Log Deal
            </button>
          </div>

          <div className="py-3 space-y-3.5 flex-1 overflow-y-auto">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((act: any) => {
                const typeColors: Record<string, string> = {
                  CALL: "bg-blue-50 text-blue-600 border-blue-100",
                  STAGE_CHANGE: "bg-emerald-50 text-emerald-600 border-emerald-100",
                  MEETING: "bg-purple-50 text-purple-600 border-purple-100",
                  SHOWING: "bg-amber-50 text-amber-600 border-amber-100",
                  NOTE: "bg-slate-100 text-slate-600 border-slate-200",
                };

                return (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        typeColors[act.type] || typeColors.NOTE
                      }`}
                    >
                      {act.type === "CALL" ? (
                        <Phone className="w-3.5 h-3.5" />
                      ) : act.type === "STAGE_CHANGE" ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : act.type === "SHOWING" ? (
                        <Calendar className="w-3.5 h-3.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-slate-800 truncate">
                          {act.title}
                        </p>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {formatDate(act.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {act.description}
                      </p>
                      {act.lead && (
                        <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {act.lead.firstName} {act.lead.lastName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">
                No recent activity logged.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
