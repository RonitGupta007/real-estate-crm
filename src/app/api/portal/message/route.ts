import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, message } = body;

    if (!clientId || !message) {
      return NextResponse.json(
        { error: "Client ID and message content are required." },
        { status: 400 }
      );
    }

    const client = await prisma.lead.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    // Create Activity log
    const activity = await prisma.activity.create({
      data: {
        type: "NOTE",
        title: `VIP Portal Message: ${client.firstName} ${client.lastName}`,
        description: message,
        leadId: client.id,
      },
    });

    // Update lead's lastContactedAt
    await prisma.lead.update({
      where: { id: client.id },
      data: { lastContactedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Message dispatched to your assigned managing broker.",
      activity,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
