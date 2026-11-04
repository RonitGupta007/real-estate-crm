import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getWhatsAppGatewayStatus, sendWhatsAppMessage } from "@/lib/whatsapp";

export async function GET() {
  try {
    const status = getWhatsAppGatewayStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Action 1: Send a test WhatsApp message
    if (action === "test") {
      const { testPhone, testMessage } = body;
      if (!testPhone) {
        return NextResponse.json(
          { error: "Recipient phone number is required for test." },
          { status: 400 }
        );
      }

      const result = await sendWhatsAppMessage({
        to: testPhone,
        body:
          testMessage ||
          "Namaste! This is a test automated message from EstateInt Luxury CRM WhatsApp Engine.",
      });

      return NextResponse.json({
        success: result.success,
        result,
      });
    }

    // Action 2: Save credentials into .env
    if (action === "save") {
      const {
        twilioSid,
        twilioToken,
        twilioFrom,
        metaToken,
        metaPhoneId,
      } = body;

      const envPath = path.join(process.cwd(), ".env");
      let envContent = "";
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf-8");
      }

      const updates: Record<string, string> = {};
      if (twilioSid !== undefined) updates["TWILIO_ACCOUNT_SID"] = twilioSid;
      if (twilioToken !== undefined) updates["TWILIO_AUTH_TOKEN"] = twilioToken;
      if (twilioFrom !== undefined) updates["TWILIO_WHATSAPP_FROM"] = twilioFrom;
      if (metaToken !== undefined) updates["META_WHATSAPP_TOKEN"] = metaToken;
      if (metaPhoneId !== undefined) updates["META_WHATSAPP_PHONE_ID"] = metaPhoneId;

      let lines = envContent.split(/\r?\n/);
      for (const [key, val] of Object.entries(updates)) {
        process.env[key] = val; // Apply to live environment
        const regex = new RegExp(`^${key}=.*$`, "m");
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}="${val}"`);
        } else {
          envContent += `\n${key}="${val}"`;
        }
      }

      fs.writeFileSync(envPath, envContent.trim() + "\n", "utf-8");

      return NextResponse.json({
        success: true,
        message: "WhatsApp credentials saved successfully.",
        status: getWhatsAppGatewayStatus(),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
