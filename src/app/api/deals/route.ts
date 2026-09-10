import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage");

    const where: any = {};
    if (stage && stage !== "ALL") {
      where.stage = stage;
    }

    const deals = await prisma.deal.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            assignedAgent: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            state: true,
            featuredImage: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(deals);
  } catch (error: any) {
    console.error("Failed to fetch deals:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      dealValue,
      commissionRate = 3.0,
      stage = "DISCOVERY",
      probability = 50,
      closeDate,
      leadId,
      propertyId,
      notes,
    } = body;

    if (!title || !dealValue) {
      return NextResponse.json(
        { error: "Deal title and deal value are required." },
        { status: 400 }
      );
    }

    const val = parseFloat(dealValue);
    const rate = parseFloat(commissionRate) || 3.0;
    const expectedCommission = (val * rate) / 100;

    const deal = await prisma.deal.create({
      data: {
        title,
        dealValue: val,
        commissionRate: rate,
        expectedCommission,
        stage,
        probability: parseInt(probability) || 50,
        closeDate: closeDate ? new Date(closeDate) : null,
        leadId: leadId || null,
        propertyId: propertyId || null,
        notes,
      },
      include: {
        lead: true,
        property: true,
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: "NOTE",
        title: "Deal Created",
        description: `New deal '${deal.title}' initialized at stage ${deal.stage} ($${deal.dealValue.toLocaleString()}).`,
        dealId: deal.id,
        leadId: deal.leadId || undefined,
        propertyId: deal.propertyId || undefined,
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create deal:", error);
    return NextResponse.json(
      { error: "Failed to create deal", details: error.message },
      { status: 500 }
    );
  }
}
