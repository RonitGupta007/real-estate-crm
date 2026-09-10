import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const followUp = await prisma.followUp.findUnique({
      where: { id },
      include: {
        lead: true,
        property: true,
        deal: true,
      },
    });

    if (!followUp) {
      return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });
    }

    const channel = body.channel || followUp.suggestedChannel;
    const messageContent = body.draftContent || followUp.draftContent;

    // 1. Mark follow-up as SENT
    const updatedFollowUp = await prisma.followUp.update({
      where: { id },
      data: {
        status: "SENT",
        draftContent: messageContent,
        suggestedChannel: channel,
      },
    });

    // 2. Update Lead last contacted timestamp
    await prisma.lead.update({
      where: { id: followUp.leadId },
      data: {
        lastContactedAt: new Date(),
        status: followUp.lead.status === "NEW" ? "CONTACTED" : undefined,
      },
    });

    // 3. Log Activity
    const activityType =
      channel === "CALL_SCRIPT" ? "CALL" : channel === "SMS" ? "NOTE" : "EMAIL";

    await prisma.activity.create({
      data: {
        type: activityType,
        title: `AI Agentic Outreach (${channel}): ${followUp.lead.firstName} ${followUp.lead.lastName}`,
        description:
          channel === "CALL_SCRIPT"
            ? `Phone conversation conducted using AI guidance script: "${followUp.reason}"`
            : `Delivered message: "${messageContent.slice(0, 160)}..."`,
        leadId: followUp.leadId,
        propertyId: followUp.propertyId || undefined,
        dealId: followUp.dealId || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Follow-up outreach dispatched to ${followUp.lead.firstName} ${followUp.lead.lastName}`,
      followUp: updatedFollowUp,
    });
  } catch (error: any) {
    console.error("Execute follow-up error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
