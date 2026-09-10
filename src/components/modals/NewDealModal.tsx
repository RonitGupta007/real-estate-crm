"use client";

import { useState, useEffect } from "react";
import { X, KanbanSquare } from "lucide-react";

interface NewDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewDealModal({
  isOpen,
  onClose,
  onSuccess,
}: NewDealModalProps) {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    dealValue: "3500000",
    commissionRate: "3.0",
    stage: "DISCOVERY",
    probability: "50",
    closeDate: "",
    leadId: "",
    propertyId: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      // Load leads and properties for dropdowns
      Promise.all([
        fetch("/api/leads").then((r) => r.json()),
        fetch("/api/properties").then((r) => r.json()),
      ]).then(([leadsData, propsData]) => {
        setLeads(Array.isArray(leadsData) ? leadsData : []);
        setProperties(Array.isArray(propsData) ? propsData : []);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create deal");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <KanbanSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">New Pipeline Deal</h2>
              <p className="text-xs text-slate-500">Track active transactions and forecasted commissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Deal Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Bel Air Villa - Smith Purchase"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Deal Value ($) *</label>
              <input
                type="number"
                required
                placeholder="2500000"
                value={formData.dealValue}
                onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Commission Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Pipeline Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              >
                <option value="DISCOVERY">Discovery / Consultation</option>
                <option value="SHOWING">Touring & Showings</option>
                <option value="OFFER_SUBMITTED">Offer Submitted</option>
                <option value="UNDER_CONTRACT">Under Contract (Escrow)</option>
                <option value="CLOSING">Closing & Final Walkthrough</option>
                <option value="CLOSED_WON">Closed (Won)</option>
                <option value="CLOSED_LOST">Closed (Lost)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Win Probability (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Associated Client</label>
              <select
                value={formData.leadId}
                onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              >
                <option value="">None / Select Client</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.firstName} {l.lastName} ({l.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Associated Property</label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              >
                <option value="">None / Select Property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (${p.price?.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Target Closing Date</label>
            <input
              type="date"
              value={formData.closeDate}
              onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Deal Notes</label>
            <textarea
              rows={3}
              placeholder="Contingencies, appraisal conditions, loan terms..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Add to Pipeline"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
