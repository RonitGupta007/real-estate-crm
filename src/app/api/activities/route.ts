import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const leadId = searchParams.get("leadId");
    const propertyId = searchParams.get("propertyId");

    const where: any = {};
    if (leadId) where.leadId = leadId;
    if (propertyId) where.propertyId = propertyId;

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        lead: {
          select: { id: true, firstName: true, lastName: true },
        },
        property: {
          select: { id: true, title: true },
        },
        deal: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(activities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type = "NOTE", title, description, leadId, propertyId, dealId } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Activity title and description are required." },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        title,
        description,
        leadId: leadId || null,
        propertyId: propertyId || null,
        dealId: dealId || null,
      },
    });

    // If linked to lead, update lead's lastContactedAt
    if (leadId) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { lastContactedAt: new Date() },
      });
    }

    return NextResponse.json(activity, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
