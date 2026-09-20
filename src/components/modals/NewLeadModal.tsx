"use client";

import { useState } from "react";
import { X, Users, Check } from "lucide-react";

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewLeadModal({
  isOpen,
  onClose,
  onSuccess,
}: NewLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+91 ",
    type: "BUYER",
    status: "NEW",
    source: "MAGICBRICKS",
    budgetMin: "15000000",
    budgetMax: "30000000",
    preferredLocation: "Worli Sea Face / Bandra West, Mumbai",
    preferredType: "APARTMENT_4BHK",
    priority: "HIGH",
    assignedAgent: "Priya Sharma",
    notes: "",
  });

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create lead");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">New Client / Lead</h2>
              <p className="text-xs text-slate-500">Add buyer, seller, investor or referral</p>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">First Name *</label>
              <input
                type="text"
                required
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Last Name *</label>
              <input
                type="text"
                required
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Email Address *</label>
              <input
                type="email"
                required
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Phone / WhatsApp Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98200 12345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Client Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              >
                <option value="BUYER">Buyer</option>
                <option value="SELLER">Seller</option>
                <option value="INVESTOR">Investor / HNI</option>
                <option value="AGENT">Channel Partner (CP)</option>
                <option value="RENTER">Corporate Tenant</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (Hot Lead)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Lead Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              >
                <option value="MAGICBRICKS">MagicBricks</option>
                <option value="99ACRES">99acres</option>
                <option value="HOUSING_COM">Housing.com</option>
                <option value="WHATSAPP">WhatsApp Direct</option>
                <option value="REFERRAL">HNI Referral</option>
                <option value="OPEN_HOUSE">Site Visit Walk-in</option>
                <option value="WEBSITE">Direct Website</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Budget Min (₹ INR)</label>
              <input
                type="number"
                placeholder="10000000"
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Budget Max (₹ INR)</label>
              <input
                type="number"
                placeholder="25000000"
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Preferred Location</label>
              <input
                type="text"
                placeholder="e.g. Worli, Mumbai or Indiranagar, Bengaluru"
                value={formData.preferredLocation}
                onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Assigned Broker</label>
              <select
                value={formData.assignedAgent}
                onChange={(e) => setFormData({ ...formData, assignedAgent: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              >
                <option value="Priya Sharma">Priya Sharma (Principal Broker)</option>
                <option value="Vikram Malhotra">Vikram Malhotra (Partner - North India)</option>
                <option value="Rajesh Verma">Rajesh Verma (Associate - South India)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Client Preferences & Notes</label>
            <textarea
              rows={3}
              placeholder="e.g. Cash buyer, pre-approved with Morgan Stanley, needs 4 bedrooms and pool."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
