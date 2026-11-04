"use client";

import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Send,
  Phone,
  Mail,
  MessageSquare,
  Building2,
  User,
  KanbanSquare,
  AlertCircle,
  FileText,
} from "lucide-react";

interface NewFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialLeadId?: string;
}

export default function NewFollowUpModal({
  isOpen,
  onClose,
  onSuccess,
  initialLeadId,
}: NewFollowUpModalProps) {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    leadId: initialLeadId || "",
    propertyId: "",
    dealId: "",
    type: "MANUAL",
    urgency: "HIGH",
    suggestedChannel: "SMS",
    reason: "",
    draftSubject: "",
    draftContent: "",
  });

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        fetch("/api/leads").then((r) => r.json()),
        fetch("/api/properties").then((r) => r.json()),
        fetch("/api/deals").then((r) => r.json()),
      ]).then(([leadsData, propsData, dealsData]) => {
        const lList = Array.isArray(leadsData) ? leadsData : [];
        setLeads(lList);
        setProperties(Array.isArray(propsData) ? propsData : []);
        setDeals(Array.isArray(dealsData) ? dealsData : []);

        const activeLeadId = initialLeadId || (lList[0]?.id || "");
        setFormData((prev) => ({
          ...prev,
          leadId: activeLeadId,
          reason: prev.reason || "Manual high-touch broker outreach.",
          draftContent: prev.draftContent || getDefaultMessage(lList.find((l: any) => l.id === activeLeadId)),
        }));
      });
    }
  }, [isOpen, initialLeadId]);

  function getDefaultMessage(lead?: any) {
    const name = lead ? lead.firstName : "there";
    return `Namaste ${name},\n\nI hope you are having a productive week. Following up regarding your luxury property search and recent discussions. Would you be available for a brief 5-minute call today to review updated options and builder terms?\n\nWarm regards,\nPriya Sharma\nManaging Principal Broker, EstateInt India`;
  }

  function applyTemplate(templateType: string) {
    const selectedLead = leads.find((l) => l.id === formData.leadId);
    const selectedProp = properties.find((p) => p.id === formData.propertyId);
    const clientName = selectedLead ? selectedLead.firstName : "[Client Name]";
    const propTitle = selectedProp ? selectedProp.title : "the property";

    if (templateType === "SITE_VISIT") {
      setFormData((prev) => ({
        ...prev,
        type: "POST_SHOWING",
        reason: `Follow-up after site visit of ${propTitle}. Sharing RERA layout & discussing token advance.`,
        draftSubject: `Follow-up: Site visit of ${propTitle}`,
        draftContent: `Namaste ${clientName},\n\nIt was a pleasure touring ${propTitle} with you. The Vastu orientation, natural light, and finishes are truly exceptional.\n\nI have the verified RERA approved layout and society bylaws ready for your review. If you would like to proceed with a formal token advance (Bayana) to block this unit before upcoming price revisions, please let me know.\n\nWarm regards,\nPriya Sharma\nEstateInt India`,
      }));
    } else if (templateType === "BAYANA") {
      setFormData((prev) => ({
        ...prev,
        type: "OFFER_CHECKIN",
        urgency: "URGENT",
        reason: `Offer & Bayana agreement milestones for ${propTitle}.`,
        draftSubject: `Update: Seller terms on ${propTitle}`,
        draftContent: `Namaste ${clientName},\n\nRegarding our discussions for ${propTitle}, the developer/seller has agreed in principle to include the reserved car parking slots in the base price. Let's schedule the 10% Bayana agreement signing so we can lock in these terms.\n\nWarm regards,\nPriya Sharma\nEstateInt India`,
      }));
    } else if (templateType === "NEW_MATCH") {
      setFormData((prev) => ({
        ...prev,
        type: "NEW_MATCH",
        reason: `Curated off-market inventory match for ${clientName}.`,
        draftSubject: `Curated Off-Market Match: ${propTitle}`,
        draftContent: `Namaste ${clientName},\n\nA premier new luxury residence just became available that directly matches your configuration and Vastu criteria:\n\nProperty: ${propTitle}\n\nWould you like me to coordinate a private preview walkthrough for you and your family this week?\n\nWarm regards,\nPriya Sharma\nEstateInt India`,
      }));
    } else if (templateType === "CALL_LOG") {
      setFormData((prev) => ({
        ...prev,
        suggestedChannel: "CALL_SCRIPT",
        reason: `Phone consultation discussion notes with ${clientName}.`,
        draftContent: `[Phone Guidance & Discussion Notes]\n1. Contact ${clientName} at ${selectedLead?.phone || "client phone"}.\n2. Confirm budget range and key preferences.\n3. Discuss legal due diligence (RERA status, encumbrance verification).\n4. Schedule next site visit for this weekend.`,
      }));
    }
  }

  if (!isOpen) return null;

  async function handleSubmit(saveStatus: "PENDING" | "SENT") {
    if (!formData.leadId) {
      alert("Please select a client/lead.");
      return;
    }
    if (!formData.draftContent.trim()) {
      alert("Please provide the message or call guidance notes.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: saveStatus,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create follow-up");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedLead = leads.find((l) => l.id === formData.leadId);
  const relevantDeals = deals.filter(
    (d) => !formData.leadId || d.leadId === formData.leadId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                New Manual Follow-Up
              </h2>
              <p className="text-[11px] text-slate-400">
                Create a high-touch outreach task, client check-in, or phone guidance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Client / Lead Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" />
                Select Client / Lead *
              </label>
              <select
                value={formData.leadId}
                onChange={(e) => {
                  const newLeadId = e.target.value;
                  const ld = leads.find((l) => l.id === newLeadId);
                  setFormData((prev) => ({
                    ...prev,
                    leadId: newLeadId,
                    draftContent: prev.draftContent || getDefaultMessage(ld),
                  }));
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 font-medium"
                required
              >
                <option value="">-- Choose Client --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.firstName} {l.lastName} • {l.phone} ({l.type})
                  </option>
                ))}
              </select>
              {selectedLead && (
                <p className="text-[10px] text-slate-500 pt-0.5">
                  Location: <span className="font-semibold text-slate-700">{selectedLead.preferredLocation || "All Metros"}</span>
                  {selectedLead.budgetMax && ` • Budget: ₹${(selectedLead.budgetMax / 10000000).toFixed(1)} Cr`}
                </p>
              )}
            </div>

            {/* Related Property (Optional) */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                Related Property (Optional)
              </label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 font-medium"
              >
                <option value="">-- No Specific Property --</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.city} • ₹{(p.price / 10000000).toFixed(2)} Cr)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trigger Type, Urgency & Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Follow-Up Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
              >
                <option value="MANUAL">Manual Broker Outreach</option>
                <option value="POST_SHOWING">Post-Site Visit Review</option>
                <option value="OFFER_CHECKIN">Offer & Bayana Discussion</option>
                <option value="STALE_LEAD">Client Re-engagement</option>
                <option value="NEW_MATCH">Property Match Presentation</option>
                <option value="MILESTONE">Contract / Legal Milestone</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Priority Urgency</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
              >
                <option value="URGENT">🚨 URGENT (Immediate)</option>
                <option value="HIGH">⚡ HIGH (Today)</option>
                <option value="MEDIUM">MEDIUM (This Week)</option>
                <option value="LOW">LOW (Routine)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Channel</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, suggestedChannel: "SMS" })}
                  className={`py-1.5 rounded-md font-semibold text-[11px] flex items-center justify-center gap-1 transition ${
                    formData.suggestedChannel === "SMS"
                      ? "bg-white text-emerald-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, suggestedChannel: "CALL_SCRIPT" })}
                  className={`py-1.5 rounded-md font-semibold text-[11px] flex items-center justify-center gap-1 transition ${
                    formData.suggestedChannel === "CALL_SCRIPT"
                      ? "bg-white text-purple-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Phone className="w-3 h-3 text-purple-600" />
                  <span>Call</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, suggestedChannel: "EMAIL" })}
                  className={`py-1.5 rounded-md font-semibold text-[11px] flex items-center justify-center gap-1 transition ${
                    formData.suggestedChannel === "EMAIL"
                      ? "bg-white text-blue-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Mail className="w-3 h-3 text-blue-600" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>

          {/* Rationale / Follow-up Objective */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Follow-Up Rationale / Context</label>
            <input
              type="text"
              placeholder="e.g. Inquire on carpet area feedback, parking allotment & Bayana deposit schedule."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Quick Script Autofill Templates */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Quick Real Estate Templates:
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => applyTemplate("SITE_VISIT")}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md font-semibold text-[10px] border border-amber-200/70 transition flex-shrink-0"
              >
                + Post-Site Visit
              </button>
              <button
                type="button"
                onClick={() => applyTemplate("BAYANA")}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-md font-semibold text-[10px] border border-indigo-200/70 transition flex-shrink-0"
              >
                + Bayana & Terms
              </button>
              <button
                type="button"
                onClick={() => applyTemplate("NEW_MATCH")}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md font-semibold text-[10px] border border-emerald-200/70 transition flex-shrink-0"
              >
                + Off-Market Match
              </button>
              <button
                type="button"
                onClick={() => applyTemplate("CALL_LOG")}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-md font-semibold text-[10px] border border-purple-200/70 transition flex-shrink-0"
              >
                + Phone Call Guide
              </button>
            </div>
          </div>

          {/* Subject Line (if Email) */}
          {formData.suggestedChannel === "EMAIL" && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Email Subject Line</label>
              <input
                type="text"
                placeholder="e.g. Follow-up: Luxury Residence Details & Sanctioned Layout"
                value={formData.draftSubject}
                onChange={(e) => setFormData({ ...formData, draftSubject: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          )}

          {/* Message / Guidance Script Editor */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              {formData.suggestedChannel === "CALL_SCRIPT"
                ? "Phone Call Guidance Script"
                : "Message Draft (WhatsApp / SMS / Email) *"}
            </label>
            <textarea
              rows={5}
              required
              value={formData.draftContent}
              onChange={(e) => setFormData({ ...formData, draftContent: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 leading-relaxed text-slate-800"
              placeholder="Type your message or call points here..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit("PENDING")}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-lg transition active:scale-98 disabled:opacity-50"
            >
              Save as Recommendation
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit("SENT")}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-98 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>{formData.suggestedChannel === "CALL_SCRIPT" ? "Log Call Completed" : "Send & Log Dispatched"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
