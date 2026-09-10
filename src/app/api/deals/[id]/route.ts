import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        lead: true,
        property: true,
        activities: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.deal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    let dealValue = body.dealValue !== undefined ? parseFloat(body.dealValue) : existing.dealValue;
    let commissionRate =
      body.commissionRate !== undefined ? parseFloat(body.commissionRate) : existing.commissionRate;
    let expectedCommission = (dealValue * commissionRate) / 100;

    const updated = await prisma.deal.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : existing.title,
        stage: body.stage !== undefined ? body.stage : existing.stage,
        dealValue,
        commissionRate,
        expectedCommission,
        probability: body.probability !== undefined ? parseInt(body.probability) : existing.probability,
        closeDate: body.closeDate ? new Date(body.closeDate) : existing.closeDate,
        leadId: body.leadId !== undefined ? body.leadId : existing.leadId,
        propertyId: body.propertyId !== undefined ? body.propertyId : existing.propertyId,
        notes: body.notes !== undefined ? body.notes : existing.notes,
      },
      include: {
        lead: true,
        property: true,
      },
    });

    // If stage changed, log activity
    if (body.stage && body.stage !== existing.stage) {
      await prisma.activity.create({
        data: {
          type: "STAGE_CHANGE",
          title: `Deal Stage Updated`,
          description: `Moved from '${existing.stage.replace(/_/g, " ")}' to '${body.stage.replace(/_/g, " ")}'.`,
          dealId: updated.id,
          leadId: updated.leadId || undefined,
          propertyId: updated.propertyId || undefined,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.deal.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Deal deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
