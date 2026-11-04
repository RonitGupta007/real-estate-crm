import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import pino from "pino";
import path from "path";
import fs from "fs";

export interface WhatsAppWebStatus {
  status: "DISCONNECTED" | "CONNECTING" | "SCAN_QR" | "CONNECTED";
  qrCode: string | null;
  user: { id?: string; name?: string; phone?: string } | null;
  isConnected: boolean;
  lastError?: string | null;
}

interface WAInternalState {
  socket: WASocket | null;
  status: "DISCONNECTED" | "CONNECTING" | "SCAN_QR" | "CONNECTED";
  qrCode: string | null;
  user: { id?: string; name?: string; phone?: string } | null;
  lastError: string | null;
  isStarting: boolean;
}

// Global persistent state across server reloads
const globalWA = globalThis as unknown as {
  __estateIntWAState?: WAInternalState;
};

if (!globalWA.__estateIntWAState) {
  globalWA.__estateIntWAState = {
    socket: null,
    status: "DISCONNECTED",
    qrCode: null,
    user: null,
    lastError: null,
    isStarting: false,
  };
}

const state = globalWA.__estateIntWAState;

const AUTH_FOLDER = path.join(process.cwd(), ".whatsapp_auth");

function ensureAuthDir() {
  if (!fs.existsSync(AUTH_FOLDER)) {
    fs.mkdirSync(AUTH_FOLDER, { recursive: true });
  }
}

export function getWhatsAppWebStatus(): WhatsAppWebStatus {
  return {
    status: state.status,
    qrCode: state.qrCode,
    user: state.user,
    isConnected: state.status === "CONNECTED" && Boolean(state.socket),
    lastError: state.lastError,
  };
}

export async function initWhatsAppWeb(forceRestart = false): Promise<WhatsAppWebStatus> {
  // If already connected and not forcing restart, return current state
  if (!forceRestart && state.socket && state.status === "CONNECTED") {
    return getWhatsAppWebStatus();
  }

  // If currently initializing, return current state
  if (state.isStarting) {
    return getWhatsAppWebStatus();
  }

  state.isStarting = true;
  state.status = "CONNECTING";
  state.lastError = null;

  try {
    ensureAuthDir();

    // Close previous socket if open
    if (state.socket) {
      try {
        state.socket.end(undefined);
      } catch (err) {
        // ignore close error
      }
      state.socket = null;
    }

    const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    const { version } = await fetchLatestBaileysVersion().catch(() => ({
      version: [2, 3000, 1015901307] as [number, number, number],
    }));

    const sock = makeWASocket({
      version,
      auth: authState,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["EstateInt Real Estate CRM", "Desktop", "1.0.0"],
      syncFullHistory: false,
      generateHighQualityLinkPreview: false,
      connectTimeoutMs: 60000,
    });

    state.socket = sock;

    // Credentials persistence
    sock.ev.on("creds.update", saveCreds);

    // Connection lifecycle
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          const qrDataUrl = await QRCode.toDataURL(qr, {
            errorCorrectionLevel: "M",
            margin: 2,
            width: 320,
            color: {
              dark: "#0f172a",
              light: "#ffffff",
            },
          });
          state.qrCode = qrDataUrl;
          state.status = "SCAN_QR";
        } catch (err: any) {
          console.error("Failed to generate QR code data URL", err);
        }
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;

        state.socket = null;
        state.qrCode = null;

        if (isLoggedOut) {
          state.status = "DISCONNECTED";
          state.user = null;
          state.lastError = "Logged out from device";
          // Clear session auth files on explicit logout
          try {
            if (fs.existsSync(AUTH_FOLDER)) {
              fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
            }
          } catch (e) {
            console.error("Error clearing auth directory", e);
          }
        } else {
          state.status = "DISCONNECTED";
          state.lastError = (lastDisconnect?.error as any)?.message || "Connection closed";
          // Attempt automatic reconnection if credentials exist
          setTimeout(() => {
            if (fs.existsSync(path.join(AUTH_FOLDER, "creds.json"))) {
              initWhatsAppWeb(false).catch(console.error);
            }
          }, 4000);
        }
      }

      if (connection === "open") {
        state.status = "CONNECTED";
        state.qrCode = null;
        state.lastError = null;

        const rawId = sock.user?.id || "";
        const cleanPhone = rawId ? rawId.split(":")[0].replace(/[^0-9]/g, "") : "";

        state.user = {
          id: rawId,
          name: sock.user?.name || "EstateInt Direct WhatsApp",
          phone: cleanPhone ? `+${cleanPhone}` : undefined,
        };
      }
    });

    return getWhatsAppWebStatus();
  } catch (err: any) {
    state.status = "DISCONNECTED";
    state.lastError = err?.message || "Failed to initialize WhatsApp Web";
    throw err;
  } finally {
    state.isStarting = false;
  }
}

export async function disconnectWhatsAppWeb(): Promise<void> {
  if (state.socket) {
    try {
      await state.socket.logout();
    } catch {
      try {
        state.socket.end(undefined);
      } catch {}
    }
  }

  state.socket = null;
  state.status = "DISCONNECTED";
  state.qrCode = null;
  state.user = null;
  state.lastError = null;

  try {
    if (fs.existsSync(AUTH_FOLDER)) {
      fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
    }
  } catch (e) {
    console.error("Failed to remove auth files", e);
  }
}

export async function sendWhatsAppWebMessage(to: string, body: string) {
  if (state.status !== "CONNECTED" || !state.socket) {
    // If not connected but credentials exist on disk, attempt quick reconnect
    if (fs.existsSync(path.join(AUTH_FOLDER, "creds.json"))) {
      await initWhatsAppWeb();
      // wait up to 3 seconds
      for (let i = 0; i < 6; i++) {
        if (state.status === "CONNECTED" && state.socket) break;
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  if (state.status !== "CONNECTED" || !state.socket) {
    throw new Error(
      "WhatsApp Web is not connected. Please scan the QR code in WhatsApp Settings to link your device."
    );
  }

  // Format recipient
  let digits = to.replace(/[^0-9]/g, "");
  if (digits.length === 10) {
    digits = `91${digits}`; // default India country code
  }

  const jid = `${digits}@s.whatsapp.net`;

  const result = await state.socket.sendMessage(jid, {
    text: body,
  });

  return {
    success: true,
    messageId: result?.key?.id,
    recipientPhone: `+${digits}`,
    provider: "whatsapp-web" as const,
  };
}
