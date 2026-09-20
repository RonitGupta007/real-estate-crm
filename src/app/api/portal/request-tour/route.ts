import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, propertyId, requestedDate, notes } = body;

    if (!clientId || !propertyId) {
      return NextResponse.json(
        { error: "Client ID and Property ID are required." },
        { status: 400 }
      );
    }

    const [client, property] = await Promise.all([
      prisma.lead.findUnique({ where: { id: clientId } }),
      prisma.property.findUnique({ where: { id: propertyId } }),
    ]);

    if (!client || !property) {
      return NextResponse.json(
        { error: "Client or Property not found." },
        { status: 404 }
      );
    }

    const startTime = requestedDate
      ? new Date(requestedDate)
      : new Date(Date.now() + 1000 * 60 * 60 * 48); // default 2 days out
    const endTime = new Date(startTime.getTime() + 1000 * 60 * 60 * 1.5);

    const showing = await prisma.showing.create({
      data: {
        title: `VIP Client Walkthrough: ${property.title}`,
        type: "PROPERTY_VIEWING",
        startTime,
        endTime,
        status: "SCHEDULED",
        location: `${property.address}, ${property.city}`,
        agentName: client.assignedAgent || "Priya Sharma",
        leadId: client.id,
        propertyId: property.id,
        notes: notes || "Requested by client via VIP Client Portal.",
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: "SHOWING",
        title: `Tour Request via Portal: ${property.title}`,
        description: `Client ${client.firstName} ${client.lastName} requested a private tour for ${startTime.toLocaleDateString()}.`,
        leadId: client.id,
        propertyId: property.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Showing tour requested. Your broker has been notified to confirm.",
      showing,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
