"use client";

import { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";

interface NewShowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewShowingModal({
  isOpen,
  onClose,
  onSuccess,
}: NewShowingModalProps) {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "VIP Site Visit & Walkthrough",
    type: "PROPERTY_VIEWING",
    startTime: "",
    endTime: "",
    status: "SCHEDULED",
    location: "",
    agentName: "Priya Sharma",
    leadId: "",
    propertyId: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        fetch("/api/leads").then((r) => r.json()),
        fetch("/api/properties").then((r) => r.json()),
      ]).then(([leadsData, propsData]) => {
        setLeads(Array.isArray(leadsData) ? leadsData : []);
        setProperties(Array.isArray(propsData) ? propsData : []);
      });

      // Default next day 10:00 AM
      const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
      d.setHours(10, 0, 0, 0);
      const startIso = d.toISOString().slice(0, 16);
      d.setHours(11, 0, 0, 0);
      const endIso = d.toISOString().slice(0, 16);
      setFormData((prev) => ({ ...prev, startTime: startIso, endTime: endIso }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/showings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to schedule showing");
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
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Schedule Showing / Event</h2>
              <p className="text-xs text-slate-500">Book client tour, inspection, or open house</p>
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
            <label className="font-semibold text-slate-700">Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Event Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              >
                <option value="PROPERTY_VIEWING">Site Visit & Property Tour</option>
                <option value="OPEN_HOUSE">Developer Showcase / Open House</option>
                <option value="CLIENT_MEETING">Client Consultation & Vastu Review</option>
                <option value="INSPECTION">Structural & Technical Inspection</option>
                <option value="CLOSING">Sub-Registrar Registration Signing</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Assigned Broker</label>
              <select
                value={formData.agentName}
                onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              >
                <option value="Priya Sharma">Priya Sharma</option>
                <option value="Vikram Malhotra">Vikram Malhotra</option>
                <option value="Rajesh Verma">Rajesh Verma</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Start Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">End Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Property</label>
              <select
                value={formData.propertyId}
                onChange={(e) => {
                  const prop = properties.find((p) => p.id === e.target.value);
                  setFormData({
                    ...formData,
                    propertyId: e.target.value,
                    location: prop ? `${prop.address}, ${prop.city}` : formData.location,
                  });
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              >
                <option value="">Select Property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Client / Buyer</label>
              <select
                value={formData.leadId}
                onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
              >
                <option value="">Select Client</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.firstName} {l.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Location / Meeting Address</label>
            <input
              type="text"
              placeholder="e.g. Worli Sea Face, Tower A Lobby, Mumbai"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Notes & Key Points</label>
            <textarea
              rows={2}
              placeholder="Security clearance pass, builder site contact, specific Vastu queries..."
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
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {loading ? "Scheduling..." : "Confirm Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
