"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  Building2,
  User,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Zap,
  Plus,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCRM } from "@/components/AppShell";
import WhatsAppSettingsModal from "@/components/modals/WhatsAppSettingsModal";

export default function FollowUpsPage() {
  const { openModal, refreshTrigger, triggerRefresh } = useCRM();
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [whatsAppStatus, setWhatsAppStatus] = useState<any>(null);

  useEffect(() => {
    loadFollowUps();
    loadWhatsAppStatus();
  }, [activeTab, typeFilter, refreshTrigger]);

  async function loadWhatsAppStatus() {
    try {
      const res = await fetch("/api/settings/whatsapp");
      if (res.ok) {
        const data = await res.json();
        setWhatsAppStatus(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadFollowUps() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("status", activeTab);
      if (typeFilter !== "ALL") params.set("type", typeFilter);

      const res = await fetch(`/api/follow-ups?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFollowUps(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunAudit() {
    try {
      setAuditing(true);
      const res = await fetch("/api/follow-ups", { method: "POST" });
      if (res.ok) {
        const result = await res.json();
        await loadFollowUps();
        triggerRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuditing(false);
    }
  }

  async function handleExecuteFollowUp(id: string, channel: string, content: string) {
    try {
      setExecutingId(id);
      const res = await fetch(`/api/follow-ups/${id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, draftContent: content }),
      });

      if (res.ok) {
        // Remove from current pending list or update
        setFollowUps((prev) => prev.filter((item) => item.id !== id));
        triggerRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExecutingId(null);
    }
  }

  async function handleDismiss(id: string) {
    try {
      await fetch(`/api/follow-ups/${id}`, { method: "DELETE" });
      setFollowUps((prev) => prev.filter((item) => item.id !== id));
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const pendingCount = followUps.filter((f) => f.status === "PENDING").length;

  const typeLabels: Record<string, { label: string; badge: string }> = {
    MANUAL: { label: "Manual Broker Outreach", badge: "bg-blue-100 text-blue-900 border-blue-200" },
    POST_SHOWING: { label: "Post-Showing Tour", badge: "bg-amber-100 text-amber-900 border-amber-200" },
    STALE_LEAD: { label: "Stale High-Value Lead", badge: "bg-rose-100 text-rose-900 border-rose-200" },
    OFFER_CHECKIN: { label: "Offer / Counter Check-in", badge: "bg-indigo-100 text-indigo-900 border-indigo-200" },
    NEW_MATCH: { label: "Inventory Match", badge: "bg-emerald-100 text-emerald-900 border-emerald-200" },
    MILESTONE: { label: "Contract Milestone", badge: "bg-purple-100 text-purple-900 border-purple-200" },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 rounded-2xl text-white shadow-md border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Autonomous Brokerage AI
            </span>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
              Live Agentic Audit
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Agentic Follow-Up & Outreach Copilot
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Continuous background analysis of property tours, client inactivity, and offer milestones.
            Schedule manual high-touch outreach or review AI-synthesized communication drafts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-2.5 z-10">
          <button
            onClick={() => setWhatsAppModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-400 hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs shadow-md transition active:scale-98 border border-slate-200/60"
            title="Configure automated WhatsApp sending (Twilio / Meta)"
          >
            <MessageSquare className={`w-4 h-4 ${whatsAppStatus?.active ? "text-emerald-600" : "text-amber-500"}`} />
            <span>{whatsAppStatus?.active ? "WhatsApp: Active" : "WhatsApp Setup"}</span>
            <span className={`w-2 h-2 rounded-full ${whatsAppStatus?.active ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
          </button>
          <button
            onClick={() => openModal("followup")}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs shadow-md transition active:scale-98"
          >
            <Plus className="w-4 h-4 text-amber-600" />
            <span>New Follow-Up</span>
          </button>
          <button
            onClick={handleRunAudit}
            disabled={auditing}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition active:scale-98 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${auditing ? "animate-spin" : ""}`} />
            <span>{auditing ? "Scanning Signals..." : "Run AI Audit"}</span>
          </button>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Intelligence Performance Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Pending Actions
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">{followUps.length}</p>
          <span className="text-[11px] text-amber-600 font-medium">Requiring broker review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Deal Velocity Impact
          </span>
          <p className="text-xl font-bold text-emerald-600 mt-1">+34%</p>
          <span className="text-[11px] text-slate-500">Faster tour-to-offer speed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Time Saved
          </span>
          <p className="text-xl font-bold text-indigo-600 mt-1">~5.2 hrs/wk</p>
          <span className="text-[11px] text-slate-500">Autonomous draft synthesis</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Pipeline Retained
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">$22.5M</p>
          <span className="text-[11px] text-slate-500">Zero lead leakage</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === "PENDING"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Active Recommendations</span>
          </button>
          <button
            onClick={() => setActiveTab("SENT")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
              activeTab === "SENT"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Dispatched History
          </button>
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
              activeTab === "ALL"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Items
          </button>
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium focus:outline-none"
        >
          <option value="ALL">All Trigger Types</option>
          <option value="MANUAL">Manual Broker Follow-Ups</option>
          <option value="POST_SHOWING">Post-Showing Tours</option>
          <option value="STALE_LEAD">Stale High-Value Leads</option>
          <option value="OFFER_CHECKIN">Offer Check-ins</option>
          <option value="NEW_MATCH">Inventory Matches</option>
          <option value="MILESTONE">Contract Milestones</option>
        </select>
      </div>

      {/* Action Cards List */}
      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500">
          Analyzing client signals...
        </div>
      ) : followUps.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">All Client Follow-Ups Up to Date!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your pipeline has no unattended tours or stale high-priority clients.
            You can create a custom follow-up task or trigger a fresh AI scan across your database.
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => openModal("followup")}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-xs transition"
            >
              + Create Manual Follow-Up
            </button>
            <button
              onClick={handleRunAudit}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
            >
              Scan for New Opportunities
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {followUps.map((item) => {
            const typeInfo = typeLabels[item.type] || {
              label: item.type,
              badge: "bg-slate-100 text-slate-800 border-slate-200",
            };

            return (
              <FollowUpCard
                key={item.id}
                item={item}
                typeInfo={typeInfo}
                isExecuting={executingId === item.id}
                copied={copiedId === item.id}
                onCopy={(text) => handleCopy(text, item.id)}
                onExecute={(channel, content) =>
                  handleExecuteFollowUp(item.id, channel, content)
                }
                onDismiss={() => handleDismiss(item.id)}
              />
            );
          })}
        </div>
      )}

      {/* WhatsApp Gateway Settings Modal */}
      <WhatsAppSettingsModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        onUpdated={() => loadWhatsAppStatus()}
      />
    </div>
  );
}

// Subcomponent for each FollowUp Recommendation Card
function FollowUpCard({
  item,
  typeInfo,
  isExecuting,
  copied,
  onCopy,
  onExecute,
  onDismiss,
}: {
  item: any;
  typeInfo: { label: string; badge: string };
  isExecuting: boolean;
  copied: boolean;
  onCopy: (text: string) => void;
  onExecute: (channel: string, content: string) => void;
  onDismiss: () => void;
}) {
  const [selectedChannel, setSelectedChannel] = useState(
    item.suggestedChannel || "EMAIL"
  );
  const [message, setMessage] = useState(item.draftContent);
  const [subject, setSubject] = useState(item.draftSubject || "");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition overflow-hidden">
      {/* Top Banner with AI Context */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeInfo.badge}`}
          >
            {typeInfo.label}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              item.urgency === "URGENT"
                ? "bg-rose-100 text-rose-800"
                : item.urgency === "HIGH"
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {item.urgency} PRIORITY
          </span>
          <span className="text-[11px] text-slate-400">• Detected {formatDate(item.createdAt)}</span>
        </div>

        {/* Lead Identity Summary */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center">
            {item.lead.firstName[0]}
            {item.lead.lastName[0]}
          </div>
          <span className="text-xs font-bold text-slate-900">
            {item.lead.firstName} {item.lead.lastName}
          </span>
          <span className="text-[10px] text-slate-400">({item.lead.type})</span>
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-5 space-y-4 text-xs">
        {/* AI Insight Reason */}
        <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-amber-900">AI Follow-Up Rationale:</p>
            <p className="text-xs text-amber-950 mt-0.5 leading-relaxed">{item.reason}</p>
          </div>
        </div>

        {/* Property Context if available */}
        {item.property && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {item.property.featuredImage && (
                <img
                  src={item.property.featuredImage}
                  alt={item.property.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div>
                <p className="font-bold text-slate-900">{item.property.title}</p>
                <p className="text-[11px] text-slate-500">
                  {item.property.address}, {item.property.city}
                </p>
              </div>
            </div>
            <span className="font-bold text-slate-900">
              {formatCurrency(item.property.price)}
            </span>
          </div>
        )}

        {/* Outreach Channel Switcher */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Channel:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedChannel("EMAIL")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                  selectedChannel === "EMAIL"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Email</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedChannel("SMS")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                  selectedChannel === "SMS"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>SMS / WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedChannel("CALL_SCRIPT")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                  selectedChannel === "CALL_SCRIPT"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                <span>Call Script</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => onCopy(message)}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Draft</span>
              </>
            )}
          </button>
        </div>

        {/* Email Subject Field */}
        {selectedChannel === "EMAIL" && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        )}

        {/* Message Editor */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700">
            {selectedChannel === "CALL_SCRIPT"
              ? "Agent Phone Guidance Script"
              : "Personalized Message Content"}
          </label>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 leading-relaxed text-slate-800"
          />
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-rose-600 transition font-medium flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Dismiss</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Quick Direct Launch Actions */}
          {selectedChannel === "SMS" && item.lead?.phone && (
            <a
              href={`https://wa.me/${(() => {
                const digits = item.lead.phone.replace(/[^0-9]/g, "");
                return digits.length === 10 ? `91${digits}` : digits;
              })()}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition"
              title="Open draft in WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}

          {selectedChannel === "CALL_SCRIPT" && item.lead?.phone && (
            <a
              href={`tel:${item.lead.phone}`}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition"
              title="Call Client"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dial Client</span>
            </a>
          )}

          {selectedChannel === "EMAIL" && item.lead?.email && (
            <a
              href={`mailto:${item.lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition"
              title="Open Email Client"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open Mail</span>
            </a>
          )}

          {item.status === "SENT" ? (
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Dispatched & Logged
            </span>
          ) : (
            <button
              onClick={() => onExecute(selectedChannel, message)}
              disabled={isExecuting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-2 transition active:scale-98 disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : selectedChannel === "CALL_SCRIPT" ? (
                <>
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Log Call Completed</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>Send Follow-Up Outreach</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
