import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAutonomousFollowUpAudit } from "@/lib/agentic-followup";
import { sendWhatsAppMessage, formatWhatsAppNumber } from "@/lib/whatsapp";

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
    const body = await request.json().catch(() => ({}));

    // If manual follow-up creation payload with leadId
    if (body.leadId) {
      const {
        leadId,
        propertyId,
        dealId,
        type = "MANUAL",
        urgency = "HIGH",
        reason,
        suggestedChannel = "SMS",
        draftSubject,
        draftContent,
        status = "PENDING",
      } = body;

      if (!draftContent || !draftContent.trim()) {
        return NextResponse.json(
          { error: "Follow-up message or discussion notes are required." },
          { status: 400 }
        );
      }

      const followUp = await prisma.followUp.create({
        data: {
          leadId,
          propertyId: propertyId || undefined,
          dealId: dealId || undefined,
          type,
          urgency,
          reason: reason || "Manual follow-up logged by broker.",
          suggestedChannel,
          draftSubject: draftSubject || undefined,
          draftContent: draftContent.trim(),
          status,
        },
        include: {
          lead: true,
          property: true,
          deal: true,
        },
      });

      // If created as immediately SENT, attempt WhatsApp send (if channel is SMS) and update lead
      if (status === "SENT") {
        let waResult = null;
        if (suggestedChannel === "SMS" && followUp.lead?.phone) {
          waResult = await sendWhatsAppMessage({
            to: followUp.lead.phone,
            body: followUp.draftContent,
          });
        }

        await prisma.lead.update({
          where: { id: leadId },
          data: {
            lastContactedAt: new Date(),
            status: followUp.lead.status === "NEW" ? "CONTACTED" : undefined,
          },
        });

        const activityType =
          suggestedChannel === "CALL_SCRIPT"
            ? "CALL"
            : suggestedChannel === "EMAIL"
            ? "EMAIL"
            : "NOTE";

        let actTitle = `Broker Follow-Up (${suggestedChannel}): ${followUp.lead.firstName} ${followUp.lead.lastName}`;
        let actDesc = `Manual follow-up conducted: "${followUp.draftContent.slice(0, 160)}..." Rationale: ${followUp.reason}`;

        if (waResult?.success) {
          actTitle = `WhatsApp Auto-Sent (${waResult.provider?.toUpperCase()}): ${followUp.lead.firstName} ${followUp.lead.lastName}`;
          actDesc = `Delivered to ${waResult.recipientPhone} (SID: ${waResult.messageId}). Message: "${followUp.draftContent.slice(0, 160)}..."`;
        }

        await prisma.activity.create({
          data: {
            type: activityType,
            title: actTitle,
            description: actDesc,
            leadId: followUp.leadId,
            propertyId: followUp.propertyId || undefined,
            dealId: followUp.dealId || undefined,
          },
        });
      } else {
        // Log planned follow-up task activity
        await prisma.activity.create({
          data: {
            type: "NOTE",
            title: `Follow-Up Scheduled: ${followUp.lead.firstName} ${followUp.lead.lastName}`,
            description: `Priority ${urgency} follow-up scheduled via ${suggestedChannel}. Topic: ${followUp.reason}`,
            leadId: followUp.leadId,
            propertyId: followUp.propertyId || undefined,
            dealId: followUp.dealId || undefined,
          },
        });
      }

      return NextResponse.json(followUp, { status: 201 });
    }

    // Otherwise, trigger the autonomous audit
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
