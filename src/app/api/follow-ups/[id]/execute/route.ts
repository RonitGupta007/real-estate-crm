import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage, formatWhatsAppNumber } from "@/lib/whatsapp";

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

    // 1. If WhatsApp channel, attempt automated gateway delivery
    let waResult = null;
    if (channel === "SMS") {
      waResult = await sendWhatsAppMessage({
        to: followUp.lead.phone,
        body: messageContent,
      });
    }

    // 2. Mark follow-up as SENT
    const updatedFollowUp = await prisma.followUp.update({
      where: { id },
      data: {
        status: "SENT",
        draftContent: messageContent,
        suggestedChannel: channel,
      },
    });

    // 3. Update Lead last contacted timestamp
    await prisma.lead.update({
      where: { id: followUp.leadId },
      data: {
        lastContactedAt: new Date(),
        status: followUp.lead.status === "NEW" ? "CONTACTED" : undefined,
      },
    });

    // 4. Log Activity with real WhatsApp delivery audit details
    const activityType =
      channel === "CALL_SCRIPT" ? "CALL" : channel === "SMS" ? "NOTE" : "EMAIL";

    let activityTitle = `AI Outreach (${channel}): ${followUp.lead.firstName} ${followUp.lead.lastName}`;
    let activityDesc =
      channel === "CALL_SCRIPT"
        ? `Phone conversation conducted using AI guidance script: "${followUp.reason}"`
        : `Delivered message: "${messageContent.slice(0, 160)}..."`;

    if (waResult?.success) {
      activityTitle = `WhatsApp Automated Send (${waResult.provider?.toUpperCase()}): ${followUp.lead.firstName} ${followUp.lead.lastName}`;
      activityDesc = `Delivered to ${waResult.recipientPhone} (Message SID: ${waResult.messageId}). Message: "${messageContent.slice(0, 160)}..."`;
    } else if (waResult && waResult.error === "GATEWAY_NOT_CONFIGURED") {
      activityTitle = `WhatsApp Logged (Pre-filled Mode): ${followUp.lead.firstName} ${followUp.lead.lastName}`;
      activityDesc = `Logged for ${formatWhatsAppNumber(followUp.lead.phone)}. Message: "${messageContent.slice(0, 160)}..."`;
    }

    await prisma.activity.create({
      data: {
        type: activityType,
        title: activityTitle,
        description: activityDesc,
        leadId: followUp.leadId,
        propertyId: followUp.propertyId || undefined,
        dealId: followUp.dealId || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: waResult?.success
        ? `WhatsApp message delivered via ${waResult.provider} to ${waResult.recipientPhone}`
        : `Follow-up outreach recorded for ${followUp.lead.firstName} ${followUp.lead.lastName}`,
      followUp: updatedFollowUp,
      whatsAppResult: waResult,
    });
  } catch (error: any) {
    console.error("Execute follow-up error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
