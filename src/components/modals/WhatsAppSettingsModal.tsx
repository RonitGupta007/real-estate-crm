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
  QrCode,
  Smartphone,
  Power,
  Zap,
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
  const [activeTab, setActiveTab] = useState<"qr" | "twilio" | "meta">("qr");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);

  // QR Web state
  const [qrState, setQrState] = useState<{
    status: "DISCONNECTED" | "CONNECTING" | "SCAN_QR" | "CONNECTED";
    qrCode: string | null;
    user: { id?: string; name?: string; phone?: string } | null;
    isConnected: boolean;
    lastError?: string | null;
  }>({
    status: "DISCONNECTED",
    qrCode: null,
    user: null,
    isConnected: false,
  });
  const [qrLoading, setQrLoading] = useState(false);

  // Twilio state
  const [twilioForm, setTwilioForm] = useState({
    sid: "",
    token: "",
    from: "whatsapp:+14155238886",
    contentSid: "",
  });

  // Meta state
  const [metaForm, setMetaForm] = useState({
    token: "",
    phoneId: "",
  });

  const [testPhone, setTestPhone] = useState("+91");

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      loadQrStatus(true);
    }
  }, [isOpen]);

  // Polling for QR status while modal is open and QR tab is active
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      // Keep polling QR status if not connected or actively waiting for scan
      if (qrState.status !== "CONNECTED") {
        loadQrStatus(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, qrState.status]);

  async function loadStatus() {
    try {
      const res = await fetch("/api/settings/whatsapp");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.twilioFrom) {
          setTwilioForm((prev) => ({
            ...prev,
            from: data.twilioFrom,
            contentSid: data.twilioContentSid || prev.contentSid,
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadQrStatus(autoInit = false) {
    try {
      const res = await fetch(`/api/settings/whatsapp/qr?init=${autoInit}`);
      if (res.ok) {
        const data = await res.json();
        setQrState(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRefreshQr() {
    setQrLoading(true);
    try {
      const res = await fetch("/api/settings/whatsapp/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status) setQrState(data.status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setQrLoading(false);
    }
  }

  async function handleDisconnectQr() {
    if (!confirm("Are you sure you want to disconnect this WhatsApp Web session?")) {
      return;
    }
    setQrLoading(true);
    try {
      const res = await fetch("/api/settings/whatsapp/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status) setQrState(data.status);
        await loadStatus();
        onUpdated?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setQrLoading(false);
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
        payload.twilioContentSid = twilioForm.contentSid;
      } else if (activeTab === "meta") {
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

  const isConnected = qrState.isConnected || status?.active;
  const currentProvider = qrState.isConnected
    ? "WhatsApp Web (Linked Device)"
    : status?.provider?.toUpperCase() || "None";

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
                WhatsApp Dispatch Gateway
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    isConnected
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {isConnected ? `Connected (${currentProvider})` : "Setup Required"}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Direct WhatsApp link (no templates required) or Twilio/Meta API
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
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("qr")}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "qr"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct QR Link</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded-sm font-black">
                ZERO LIMITS
              </span>
            </button>
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
              <span>Twilio API</span>
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
              <span>Meta API</span>
            </button>
          </div>

          {/* TAB 1: Direct QR Scan (Baileys) */}
          {activeTab === "qr" && (
            <div className="space-y-4">
              {/* Feature highlight */}
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-950 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-[11px] text-emerald-900">
                    Direct WhatsApp Web Connection (Recommended)
                  </p>
                  <p className="text-[10px] text-emerald-800 leading-relaxed">
                    Scan the QR code once with your WhatsApp phone. EstateInt will send
                    automated and manual follow-ups directly from your personal or business
                    number — <strong>no template approvals, no ContentSid, no 24-hr session restrictions, and 100% free</strong>.
                  </p>
                </div>
              </div>

              {/* Status & QR Container */}
              {qrState.isConnected ? (
                /* Connected State */
                <div className="p-5 bg-slate-50 border border-emerald-200 rounded-2xl flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      WhatsApp Linked & Ready!
                    </h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Connected Device:{" "}
                      <span className="font-mono font-bold text-slate-800">
                        {qrState.user?.phone || "Connected Account"}
                      </span>
                    </p>
                    {qrState.user?.name && (
                      <p className="text-slate-400 text-[10px]">
                        Account: {qrState.user.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleDisconnectQr}
                      disabled={qrLoading}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 text-xs flex items-center gap-1.5 transition active:scale-98"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Disconnect Device</span>
                    </button>
                  </div>
                </div>
              ) : qrState.status === "SCAN_QR" && qrState.qrCode ? (
                /* Scan QR State */
                <div className="flex flex-col items-center p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="text-center space-y-1">
                    <p className="font-bold text-slate-900 text-xs flex items-center justify-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      Scan this QR code with WhatsApp
                    </p>
                    <ol className="text-[11px] text-slate-500 text-left list-decimal list-inside space-y-0.5">
                      <li>Open WhatsApp on your phone</li>
                      <li>
                        Tap <strong>Menu</strong> (Android) or <strong>Settings</strong> (iPhone)
                      </li>
                      <li>
                        Select <strong>Linked Devices</strong> → <strong>Link a device</strong>
                      </li>
                      <li>Point your phone camera at this QR code:</li>
                    </ol>
                  </div>

                  {/* QR Image Box */}
                  <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200 relative group">
                    <img
                      src={qrState.qrCode}
                      alt="WhatsApp QR Code"
                      className="w-56 h-56 object-contain rounded-lg"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <button
                      type="button"
                      onClick={handleRefreshQr}
                      disabled={qrLoading}
                      className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1 transition"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 text-slate-500 ${
                          qrLoading ? "animate-spin" : ""
                        }`}
                      />
                      <span>Refresh QR Code</span>
                    </button>
                    <span className="text-[10px] text-slate-400">
                      Auto-refreshes on phone scan
                    </span>
                  </div>
                </div>
              ) : (
                /* Connecting or Initializing State */
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs">
                      Initializing WhatsApp Web Socket...
                    </h3>
                    <p className="text-slate-500 text-[11px] mt-1">
                      Generating pairing QR code. Please wait 2-3 seconds.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshQr}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-100 text-xs"
                  >
                    Click to Start Link
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Twilio Configuration Form */}
          {activeTab === "twilio" && (
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

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Content SID / Template SID (Optional)</label>
                <input
                  type="text"
                  placeholder="HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={twilioForm.contentSid}
                  onChange={(e) => setTwilioForm({ ...twilioForm, contentSid: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                />
                <span className="text-[10px] text-slate-500 block leading-relaxed">
                  Only required if initiating messages outside 24-hr customer window without prior client opt-in.
                </span>
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
          )}

          {/* TAB 3: Meta Cloud API */}
          {activeTab === "meta" && (
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
              Test WhatsApp Auto-Delivery
            </h3>
            <p className="text-[11px] text-slate-500">
              Send an instant real automated notification to any WhatsApp number to verify delivery.
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
                      Delivery Successful!
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      Delivery Notice
                    </>
                  )}
                </p>
                <p className="text-[11px]">
                  {testResult.success
                    ? `Message delivered via ${testResult.result?.provider?.toUpperCase()} (ID: ${testResult.result?.messageId || "Sent"}) to ${testResult.result?.recipientPhone}. Check recipient's WhatsApp!`
                    : testResult.result?.error === "GATEWAY_NOT_CONFIGURED"
                    ? "Direct WhatsApp is not linked yet and Twilio/Meta credentials are not set. Scan the QR code above to link your WhatsApp in 5 seconds!"
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
