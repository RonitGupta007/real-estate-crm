"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Award,
  PieChart,
  Calculator,
  ShieldCheck,
  Building2,
  Users,
  Target,
} from "lucide-react";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { useCRM } from "@/components/AppShell";

export default function AnalyticsPage() {
  const { refreshTrigger } = useCRM();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Commission Simulator state
  const [calcPrice, setCalcPrice] = useState(4500000);
  const [calcRate, setCalcRate] = useState(3.0);
  const [calcSplit, setCalcSplit] = useState(80); // 80/20 broker split

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [refreshTrigger]);

  const grossCommission = (calcPrice * calcRate) / 100;
  const agentTakeHome = (grossCommission * calcSplit) / 100;
  const brokerageShare = grossCommission - agentTakeHome;

  if (loading && !stats) {
    return (
      <div className="text-center py-24 text-xs text-slate-500">
        Loading analytics...
      </div>
    );
  }

  const agents = [
    {
      name: "Sarah Jenkins",
      role: "Managing Principal Broker",
      volume: 15650000,
      earned: 469500,
      activeDeals: 3,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80",
    },
    {
      name: "Michael Vance",
      role: "Associate Partner",
      volume: 6825000,
      earned: 204750,
      activeDeals: 2,
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&h=120&q=80",
    },
    {
      name: "Elena Rostova",
      role: "Luxury Estate Specialist",
      volume: 7350000,
      earned: 194500,
      activeDeals: 2,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-500" />
          Brokerage Intelligence & Performance Metrics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Comprehensive analysis of closed sales volume, commission pipeline, inventory exposure, and agent production.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Closed Sales Volume</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(stats?.closedSalesVolume || 0)}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            +18.4% vs last quarter
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Commission Earned</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {formatCurrency(stats?.earnedCommission || 0)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">100% of realized settlements</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Weighted Forecast</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {formatCurrency(stats?.projectedCommission || 0)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Across {stats?.activeDealsCount || 0} active pipeline deals</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Portfolio Value</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {formatCurrency(stats?.totalPortfolioValue || 0)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{stats?.activeListingsCount || 0} active listings</p>
        </div>
      </div>

      {/* Two Column Section: Pipeline Funnel Breakdown & Inventory Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Deal Pipeline Funnel (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" />
            Pipeline Stage Distribution
          </h2>

          <div className="space-y-3 pt-2">
            {(stats?.dealsByStage || []).map((st: any) => {
              const maxVal = Math.max(
                ...stats.dealsByStage.map((s: any) => s.value || 0),
                1
              );
              const pct = Math.round((st.value / maxVal) * 100);

              return (
                <div key={st.stage} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-700">{st.stage.replace(/_/g, " ")}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-normal">{st.count} deals</span>
                      <span className="text-slate-900">{formatCurrency(st.value)}</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Property Type Mix (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-500" />
            Inventory Asset Mix
          </h2>

          <div className="space-y-3 pt-2">
            {stats?.propertyTypeCounts &&
              Object.entries(stats.propertyTypeCounts).map(([type, count]: [string, any]) => (
                <div
                  key={type}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-semibold text-slate-800">
                      {type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 px-2 py-0.5 bg-white rounded-md border border-slate-200">
                    {count} {count === 1 ? "Property" : "Properties"}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Agent Leaderboard & Interactive Commission Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Agent Leaderboard (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Agent Production Leaderboard
            </h2>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Q3 Top Producers</span>
          </div>

          <div className="divide-y divide-slate-100">
            {agents.map((ag, i) => (
              <div key={ag.name} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-400 w-4">#{i + 1}</span>
                  <img
                    src={ag.avatar}
                    alt={ag.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{ag.name}</p>
                    <p className="text-[11px] text-slate-400">{ag.role}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-900">{formatCurrency(ag.volume)}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">
                    {formatCurrency(ag.earned)} earned
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Commission Simulator (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-500" />
            Commission Earnings Simulator
          </h2>
          <p className="text-xs text-slate-500">
            Model forecasted payouts for upcoming transactions and splits.
          </p>

          <div className="space-y-3 text-xs pt-1">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Sale Price</span>
                <span className="text-slate-900">{formatCurrency(calcPrice)}</span>
              </div>
              <input
                type="range"
                min="500000"
                max="15000000"
                step="250000"
                value={calcPrice}
                onChange={(e) => setCalcPrice(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Commission %</label>
                <input
                  type="number"
                  step="0.25"
                  value={calcRate}
                  onChange={(e) => setCalcRate(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Agent Split %</label>
                <input
                  type="number"
                  value={calcSplit}
                  onChange={(e) => setCalcSplit(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 mt-4">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Gross Total Commission:</span>
                <span className="font-bold text-white">{formatCurrency(grossCommission)}</span>
              </div>
              <div className="flex justify-between text-xs text-amber-400 font-bold border-t border-slate-800 pt-2">
                <span>Agent Take-Home ({calcSplit}%):</span>
                <span>{formatCurrency(agentTakeHome)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Brokerage Retained:</span>
                <span>{formatCurrency(brokerageShare)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
