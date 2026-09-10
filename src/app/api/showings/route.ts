import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const showings = await prisma.showing.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            price: true,
            featuredImage: true,
          },
        },
      },
    });

    return NextResponse.json(showings);
  } catch (error: any) {
    console.error("Failed to fetch showings:", error);
    return NextResponse.json(
      { error: "Failed to fetch showings", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      type = "PROPERTY_VIEWING",
      startTime,
      endTime,
      status = "SCHEDULED",
      location,
      notes,
      agentName = "Sarah Jenkins",
      leadId,
      propertyId,
    } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Title, start time, and end time are required." },
        { status: 400 }
      );
    }

    const showing = await prisma.showing.create({
      data: {
        title,
        type,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status,
        location,
        notes,
        agentName,
        leadId: leadId || null,
        propertyId: propertyId || null,
      },
      include: {
        lead: true,
        property: true,
      },
    });

    // Activity log
    await prisma.activity.create({
      data: {
        type: "SHOWING",
        title: "Showing Scheduled",
        description: `'${showing.title}' scheduled for ${new Date(
          showing.startTime
        ).toLocaleDateString()} with ${showing.agentName}.`,
        leadId: showing.leadId || undefined,
        propertyId: showing.propertyId || undefined,
      },
    });

    return NextResponse.json(showing, { status: 201 });
  } catch (error: any) {
    console.error("Failed to schedule showing:", error);
    return NextResponse.json(
      { error: "Failed to schedule showing", details: error.message },
      { status: 500 }
    );
  }
}
