export interface SendWhatsAppResult {
  success: boolean;
  messageId?: string;
  provider?: "twilio" | "meta" | "simulated";
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
 * Sends a real automated WhatsApp message via Twilio or Meta WhatsApp Cloud API.
 * If credentials are not yet set in .env, returns simulated status with configuration guide.
 */
export async function sendWhatsAppMessage({
  to,
  body,
}: {
  to: string;
  body: string;
}): Promise<SendWhatsAppResult> {
  const formattedTo = formatWhatsAppNumber(to);

  // 1. Try Twilio WhatsApp API
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

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
      params.append("Body", body);

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
        return {
          success: false,
          error: data.message || `Twilio error ${response.status}`,
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

  // 2. Try Meta WhatsApp Business Cloud API
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

  // 3. Fallback when credentials are not yet configured
  return {
    success: false,
    error: "GATEWAY_NOT_CONFIGURED",
    provider: "simulated",
    recipientPhone: formattedTo,
  };
}

export function getWhatsAppGatewayStatus() {
  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  );
  const hasMeta = Boolean(
    process.env.META_WHATSAPP_TOKEN && process.env.META_WHATSAPP_PHONE_ID
  );

  return {
    active: hasTwilio || hasMeta,
    provider: hasTwilio ? "twilio" : hasMeta ? "meta" : "none",
    twilioFrom: process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886",
    hasTwilio,
    hasMeta,
  };
}
