import { NextResponse } from "next/server";
import {
  initWhatsAppWeb,
  disconnectWhatsAppWeb,
  getWhatsAppWebStatus,
} from "@/lib/whatsapp-web";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const autoInit = searchParams.get("init") === "true";

    let status = getWhatsAppWebStatus();

    // If DISCONNECTED and client requested init, start connection
    if (autoInit && status.status === "DISCONNECTED") {
      // Fire init without blocking completely, or wait up to 1.5s for initial QR
      initWhatsAppWeb().catch((err) =>
        console.error("WhatsApp Web background init error:", err)
      );

      // Brief wait to give Baileys time to generate initial QR
      for (let i = 0; i < 6; i++) {
        await new Promise((r) => setTimeout(r, 250));
        status = getWhatsAppWebStatus();
        if (status.status === "SCAN_QR" || status.status === "CONNECTED") {
          break;
        }
      }
    }

    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to get WhatsApp Web status" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "start" || action === "refresh") {
      initWhatsAppWeb(true).catch((err) =>
        console.error("WhatsApp Web restart error:", err)
      );

      // Brief wait for QR generation
      let status = getWhatsAppWebStatus();
      for (let i = 0; i < 8; i++) {
        await new Promise((r) => setTimeout(r, 250));
        status = getWhatsAppWebStatus();
        if (status.status === "SCAN_QR" || status.status === "CONNECTED") {
          break;
        }
      }

      return NextResponse.json({
        success: true,
        status,
      });
    }

    if (action === "disconnect") {
      await disconnectWhatsAppWeb();
      return NextResponse.json({
        success: true,
        status: getWhatsAppWebStatus(),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to perform WhatsApp Web action" },
      { status: 500 }
    );
  }
}
