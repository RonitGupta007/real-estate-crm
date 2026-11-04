import {
  getWhatsAppWebStatus,
  sendWhatsAppWebMessage,
} from "./whatsapp-web";

export interface SendWhatsAppResult {
  success: boolean;
  messageId?: string;
  provider?: "whatsapp-web" | "twilio" | "meta" | "simulated";
  error?: string;
  recipientPhone: string;
}

/**
 * Normalizes Indian and international phone numbers for WhatsApp delivery.
 * e.g., '9820044120' -> '+919820044120'
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (!phone.startsWith("+") && digits.length > 10) {
    return `+${digits}`;
  }
  return phone.startsWith("+") ? phone : `+${digits}`;
}

/**
 * Sends a real automated WhatsApp message.
 * Priority 1: Direct WhatsApp Web link (zero restrictions, no ContentSid, no 24hr window).
 * Priority 2: Twilio WhatsApp API (if configured).
 * Priority 3: Meta WhatsApp Cloud API (if configured).
 * Fallback: GATEWAY_NOT_CONFIGURED error with instructions.
 */
export async function sendWhatsAppMessage({
  to,
  body,
}: {
  to: string;
  body: string;
}): Promise<SendWhatsAppResult> {
  const formattedTo = formatWhatsAppNumber(to);

  // 1. Direct WhatsApp Web (Zero restrictions, native delivery)
  const webStatus = getWhatsAppWebStatus();
  if (webStatus.isConnected) {
    try {
      const res = await sendWhatsAppWebMessage(to, body);
      return {
        success: true,
        messageId: res.messageId || undefined,
        provider: "whatsapp-web",
        recipientPhone: res.recipientPhone,
      };
    } catch (err: any) {
      console.warn("Direct WhatsApp Web send failed, attempting fallback:", err.message);
    }
  }

  // 2. Try Twilio WhatsApp API
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
  const twilioContentSid = process.env.TWILIO_CONTENT_SID;

  if (twilioSid && twilioToken) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");

      const params = new URLSearchParams();
      params.append(
        "From",
        twilioFrom.startsWith("whatsapp:") ? twilioFrom : `whatsapp:${twilioFrom}`
      );
      params.append("To", `whatsapp:${formattedTo}`);

      // If a pre-approved template ContentSid is configured, use Twilio Content API format
      if (twilioContentSid && twilioContentSid.startsWith("HX")) {
        params.append("ContentSid", twilioContentSid);
        params.append(
          "ContentVariables",
          JSON.stringify({ "1": body.slice(0, 100), "2": formattedTo })
        );
      } else {
        params.append("Body", body);
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const data = await response.json();
      if (response.ok && data.sid) {
        return {
          success: true,
          messageId: data.sid,
          provider: "twilio",
          recipientPhone: formattedTo,
        };
      } else {
        let errorMsg = data.message || `Twilio error ${response.status}`;
        if (data.code === 63016 || errorMsg.toLowerCase().includes("contentsid")) {
          errorMsg =
            "Twilio/Meta requires a ContentSid template outside 24h. Use Direct WhatsApp Web (Scan QR) above to send instantly with 0 restrictions!";
        }
        return {
          success: false,
          error: errorMsg,
          provider: "twilio",
          recipientPhone: formattedTo,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        provider: "twilio",
        recipientPhone: formattedTo,
      };
    }
  }

  // 3. Try Meta WhatsApp Business Cloud API
  const metaToken = process.env.META_WHATSAPP_TOKEN;
  const metaPhoneId = process.env.META_WHATSAPP_PHONE_ID;

  if (metaToken && metaPhoneId) {
    try {
      const url = `https://graph.facebook.com/v19.0/${metaPhoneId}/messages`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${metaToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: formattedTo.replace("+", ""),
          type: "text",
          text: { preview_url: true, body },
        }),
      });

      const data = await response.json();
      if (response.ok && data.messages?.[0]?.id) {
        return {
          success: true,
          messageId: data.messages[0].id,
          provider: "meta",
          recipientPhone: formattedTo,
        };
      } else {
        return {
          success: false,
          error: data.error?.message || "Meta WhatsApp API error",
          provider: "meta",
          recipientPhone: formattedTo,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        provider: "meta",
        recipientPhone: formattedTo,
      };
    }
  }

  // 4. Fallback when credentials are not yet configured
  return {
    success: false,
    error: "GATEWAY_NOT_CONFIGURED",
    provider: "simulated",
    recipientPhone: formattedTo,
  };
}

export function getWhatsAppGatewayStatus() {
  const waWeb = getWhatsAppWebStatus();
  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  );
  const hasMeta = Boolean(
    process.env.META_WHATSAPP_TOKEN && process.env.META_WHATSAPP_PHONE_ID
  );

  const active = waWeb.isConnected || hasTwilio || hasMeta;
  const provider = waWeb.isConnected
    ? ("whatsapp-web" as const)
    : hasTwilio
    ? ("twilio" as const)
    : hasMeta
    ? ("meta" as const)
    : ("none" as const);

  return {
    active,
    provider,
    isWhatsAppWebConnected: waWeb.isConnected,
    whatsappWebStatus: waWeb.status,
    whatsappWebUser: waWeb.user,
    twilioFrom: process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886",
    twilioContentSid: process.env.TWILIO_CONTENT_SID || "",
    hasTwilio,
    hasMeta,
  };
}
