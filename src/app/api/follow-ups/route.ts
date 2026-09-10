import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAutonomousFollowUpAudit } from "@/lib/agentic-followup";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";
    const type = searchParams.get("type");
    const urgency = searchParams.get("urgency");

    const where: any = {};
    if (status !== "ALL") {
      where.status = status;
    }
    if (type && type !== "ALL") {
      where.type = type;
    }
    if (urgency && urgency !== "ALL") {
      where.urgency = urgency;
    }

    let followUps = await prisma.followUp.findMany({
      where,
      orderBy: [{ urgency: "asc" }, { createdAt: "desc" }],
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            type: true,
            priority: true,
            assignedAgent: true,
            budgetMax: true,
            preferredLocation: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            address: true,
            city: true,
            featuredImage: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
            stage: true,
            dealValue: true,
          },
        },
      },
    });

    // If zero pending follow-ups found on first load, auto-run audit
    if (followUps.length === 0 && status === "PENDING" && !type && !urgency) {
      await runAutonomousFollowUpAudit();
      followUps = await prisma.followUp.findMany({
        where: { status: "PENDING" },
        orderBy: [{ urgency: "asc" }, { createdAt: "desc" }],
        include: {
          lead: true,
          property: true,
          deal: true,
        },
      });
    }

    return NextResponse.json(followUps);
  } catch (error: any) {
    console.error("Error fetching follow-ups:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const count = await runAutonomousFollowUpAudit();
    return NextResponse.json({
      success: true,
      message: `Autonomous audit complete. Generated ${count} new follow-up recommendations.`,
      newCount: count,
    });
  } catch (error: any) {
    console.error("Error generating follow-ups:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
