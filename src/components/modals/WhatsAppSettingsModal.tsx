"use client";

import { useState, useEffect } from "react";
import {
  X,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Send,
  Key,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface WhatsAppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export default function WhatsAppSettingsModal({
  isOpen,
  onClose,
  onUpdated,
}: WhatsAppSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"twilio" | "meta">("twilio");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);

  const [twilioForm, setTwilioForm] = useState({
    sid: "",
    token: "",
    from: "whatsapp:+14155238886",
  });

  const [metaForm, setMetaForm] = useState({
    token: "",
    phoneId: "",
  });

  const [testPhone, setTestPhone] = useState("+91");

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  async function loadStatus() {
    try {
      const res = await fetch("/api/settings/whatsapp");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.twilioFrom) {
          setTwilioForm((prev) => ({ ...prev, from: data.twilioFrom }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTestResult(null);

    try {
      const payload: any = { action: "save" };
      if (activeTab === "twilio") {
        payload.twilioSid = twilioForm.sid;
        payload.twilioToken = twilioForm.token;
        payload.twilioFrom = twilioForm.from;
      } else {
        payload.metaToken = metaForm.token;
        payload.metaPhoneId = metaForm.phoneId;
      }

      const res = await fetch("/api/settings/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await loadStatus();
        onUpdated?.();
        alert("WhatsApp settings saved successfully!");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save settings");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleTestSend(e: React.FormEvent) {
    e.preventDefault();
    if (!testPhone || testPhone === "+91") {
      alert("Please enter a valid recipient phone number with country code.");
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/settings/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          testPhone,
          testMessage:
            "Namaste! This is a test automated message from EstateInt Luxury Real Estate CRM WhatsApp Engine.",
        }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                WhatsApp Auto-Send Gateway
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    status?.active
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {status?.active ? `Connected (${status.provider?.toUpperCase()})` : "Setup Required"}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Configure Twilio or Meta API for automated WhatsApp delivery
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Provider Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("twilio")}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "twilio"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Key className="w-3.5 h-3.5 text-rose-500" />
              <span>Twilio WhatsApp API</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("meta")}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "meta"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Meta WhatsApp Cloud API</span>
            </button>
          </div>

          {/* Twilio Configuration Form */}
          {activeTab === "twilio" ? (
            <form onSubmit={handleSaveCredentials} className="space-y-3.5">
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  Twilio Sandbox / Registered Number Setup
                </p>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  For free testing: Join the Twilio WhatsApp Sandbox by sending{" "}
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">join &lt;your-code&gt;</code>{" "}
                  from WhatsApp to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">+1 415 523 8886</code>.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Twilio Account SID</label>
                <input
                  type="text"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={twilioForm.sid}
                  onChange={(e) => setTwilioForm({ ...twilioForm, sid: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Twilio Auth Token</label>
                <input
                  type="password"
                  placeholder="Your Twilio Auth Token"
                  value={twilioForm.token}
                  onChange={(e) => setTwilioForm({ ...twilioForm, token: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Twilio WhatsApp Sender Number</label>
                <input
                  type="text"
                  placeholder="whatsapp:+14155238886"
                  value={twilioForm.from}
                  onChange={(e) => setTwilioForm({ ...twilioForm, from: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                />
                <span className="text-[10px] text-slate-400 block">Default Sandbox: whatsapp:+14155238886</span>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition active:scale-98 disabled:opacity-50"
                >
                  {loading ? "Saving Credentials..." : "Save Twilio Credentials"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSaveCredentials} className="space-y-3.5">
              <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  Meta WhatsApp Cloud API Setup
                </p>
                <p className="text-[11px] text-blue-900 leading-relaxed">
                  Generated from developers.facebook.com WhatsApp product setup.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">System User Access Token</label>
                <input
                  type="password"
                  placeholder="EAA..."
                  value={metaForm.token}
                  onChange={(e) => setMetaForm({ ...metaForm, token: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">WhatsApp Phone Number ID</label>
                <input
                  type="text"
                  placeholder="e.g. 106543219876543"
                  value={metaForm.phoneId}
                  onChange={(e) => setMetaForm({ ...metaForm, phoneId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition active:scale-98 disabled:opacity-50"
                >
                  {loading ? "Saving Credentials..." : "Save Meta Credentials"}
                </button>
              </div>
            </form>
          )}

          {/* Test Delivery Section */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              Test Live WhatsApp Delivery
            </h3>
            <p className="text-[11px] text-slate-500">
              Send a test automated notification to your personal WhatsApp number to verify credentials.
            </p>

            <form onSubmit={handleTestSend} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="+919820044120"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                disabled={testing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition flex items-center gap-1.5 active:scale-98 disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Test</span>
                  </>
                )}
              </button>
            </form>

            {/* Test Result Box */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  testResult.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-rose-50 border-rose-200 text-rose-950"
                }`}
              >
                <p className="font-bold flex items-center gap-1.5">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Test Delivery Successful!
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      Test Delivery Notice
                    </>
                  )}
                </p>
                <p className="text-[11px]">
                  {testResult.success
                    ? `Delivered via ${testResult.result?.provider?.toUpperCase()} (Message SID: ${testResult.result?.messageId}) to ${testResult.result?.recipientPhone}. Check your WhatsApp!`
                    : testResult.result?.error === "GATEWAY_NOT_CONFIGURED"
                    ? "Twilio / Meta credentials are not configured yet. Enter your Account SID & Token above, or WhatsApp will continue using the 1-click pre-filled browser link."
                    : testResult.result?.error || testResult.error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">EstateInt WhatsApp Dispatch Service</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
