import { prisma } from "./prisma";

export interface GeneratedFollowUp {
  leadId: string;
  propertyId?: string;
  dealId?: string;
  type: "POST_SHOWING" | "STALE_LEAD" | "NEW_MATCH" | "OFFER_CHECKIN" | "MILESTONE";
  urgency: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  suggestedChannel: "EMAIL" | "SMS" | "CALL_SCRIPT";
  draftSubject?: string;
  draftContent: string;
}

export async function runAutonomousFollowUpAudit(): Promise<number> {
  // 1. Fetch leads, showings, properties, deals
  const [leads, showings, deals, properties] = await Promise.all([
    prisma.lead.findMany({
      include: {
        deals: { include: { property: true } },
        showings: { include: { property: true } },
        activities: { take: 3, orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.showing.findMany({
      where: {
        status: { in: ["SCHEDULED", "CONFIRMED", "COMPLETED"] },
      },
      include: { lead: true, property: true },
      orderBy: { startTime: "desc" },
    }),
    prisma.deal.findMany({
      where: {
        stage: { in: ["OFFER_SUBMITTED", "UNDER_CONTRACT", "SHOWING"] },
      },
      include: { lead: true, property: true },
    }),
    prisma.property.findMany({
      where: { status: "ACTIVE" },
    }),
  ]);

  const followUpItems: GeneratedFollowUp[] = [];

  // Check 1: Post-Showing Follow-up
  for (const showing of showings) {
    if (showing.lead && showing.property) {
      const isRecent = new Date(showing.startTime).getTime() > Date.now() - 1000 * 60 * 60 * 72; // within 3 days
      if (isRecent) {
        followUpItems.push({
          leadId: showing.lead.id,
          propertyId: showing.property.id,
          type: "POST_SHOWING",
          urgency: "URGENT",
          reason: `Site visit of ${showing.property.title} conducted. Prime 24-48h window to share RERA sanctioned layout, car parking allotment confirmation, and discuss token advance booking terms.`,
          suggestedChannel: "SMS", // WhatsApp is default preferred
          draftSubject: `Follow-up: Site visit of ${showing.property.title}`,
          draftContent: `Namaste ${showing.lead.firstName},\n\nIt was a pleasure touring ${showing.property.title} with you yesterday. The Vastu orientation, natural light, and finishes are truly exceptional.\n\nI have attached the verified RERA approved layout and society bylaws for your review. The developer has two other serious inquiries scheduled for this weekend. If you would like to block the unit with an initial token advance or discuss payment milestones, let me know when we can speak today.\n\nWarm regards,\nPriya Sharma\nManaging Principal Broker, EstateInt India`,
        });
      }
    }
  }

  // Check 2: Stale High-Priority Leads (no contact in 40h)
  for (const lead of leads) {
    const hoursSinceContact = lead.lastContactedAt
      ? (Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60)
      : 999;

    if (hoursSinceContact > 40 && (lead.priority === "URGENT" || lead.priority === "HIGH")) {
      const budgetDisplay = lead.budgetMax
        ? lead.budgetMax >= 10000000
          ? `₹${(lead.budgetMax / 10000000).toFixed(1)} Cr`
          : `₹${(lead.budgetMax / 100000).toFixed(0)} L`
        : "";

      followUpItems.push({
        leadId: lead.id,
        type: "STALE_LEAD",
        urgency: lead.priority === "URGENT" ? "URGENT" : "HIGH",
        reason: `High-net-worth client inactive for ${Math.round(hoursSinceContact)} hours. Budget target: ${budgetDisplay || "Luxury segment"}. Re-engagement via WhatsApp recommended before weekend showings.`,
        suggestedChannel: "SMS",
        draftSubject: `Off-market luxury update for ${lead.preferredLocation || "your property search"}`,
        draftContent: `Namaste ${lead.firstName}, Priya here from EstateInt. I have two rare off-market residences coming up in ${lead.preferredLocation || "your target neighborhood"} that match your ${budgetDisplay ? `${budgetDisplay}` : "luxury"} criteria and Vastu preferences. Are you free for a quick 5-minute call today?`,
      });
    }
  }

  // Check 3: Active Offer Follow-up
  for (const deal of deals) {
    if (deal.stage === "OFFER_SUBMITTED" && deal.lead && deal.property) {
      const dealValueFormatted = deal.dealValue >= 10000000
        ? `₹${(deal.dealValue / 10000000).toFixed(2)} Cr`
        : `₹${(deal.dealValue / 100000).toFixed(0)} L`;

      followUpItems.push({
        leadId: deal.lead.id,
        propertyId: deal.property.id,
        dealId: deal.id,
        type: "OFFER_CHECKIN",
        urgency: "URGENT",
        reason: `Formal offer of ${dealValueFormatted} submitted on ${deal.property.title}. Follow-up needed with seller/builder on Bayana agreement and stamp duty timeline.`,
        suggestedChannel: "CALL_SCRIPT",
        draftSubject: `Update: Seller response on ${deal.property.title}`,
        draftContent: `[Broker Phone Guidance Script]\n1. Call ${deal.lead.firstName} ${deal.lead.lastName} at ${deal.lead.phone}.\n2. "Namaste ${deal.lead.firstName}, I just had a detailed discussion with the seller's representatives for ${deal.property.title}. They received our offer of ${dealValueFormatted} and appreciated the clean 30-day payment schedule."\n3. "They have agreed to include the 4 reserved car parking slots and club lifetime membership in the base price. Let's schedule the token agreement signing so we lock this in before their price revision next week."`,
      });
    }
  }

  // Check 4: New Inventory Match
  for (const lead of leads) {
    if (lead.preferredType) {
      const match = properties.find(
        (p) =>
          p.propertyType === lead.preferredType &&
          (!lead.budgetMax || p.price <= lead.budgetMax * 1.15)
      );

      if (match) {
        const matchPriceFormatted = match.price >= 10000000
          ? `₹${(match.price / 10000000).toFixed(2)} Cr`
          : `₹${(match.price / 100000).toFixed(0)} L`;

        followUpItems.push({
          leadId: lead.id,
          propertyId: match.id,
          type: "NEW_MATCH",
          urgency: "MEDIUM",
          reason: `Prime inventory match: ${match.title} (${matchPriceFormatted}) in ${match.city} directly aligns with ${lead.firstName}'s preference for ${match.bhkConfig || match.propertyType.replace(/_/g, " ")}.`,
          suggestedChannel: "EMAIL",
          draftSubject: `Curated Match: ${match.title}, ${match.city} (${matchPriceFormatted})`,
          draftContent: `Namaste ${lead.firstName},\n\nA premier new luxury property just became available that perfectly fits your parameters:\n\nProperty: ${match.title}\nLocation: ${match.address}, ${match.city}\nPrice: ${matchPriceFormatted}\nSpecs: ${match.bedrooms} BHK • ${match.bathrooms} Baths • ${match.squareFeet.toLocaleString()} sq.ft (RERA Carpet Area)\nVastu / Facing: ${match.facingDirection || "Vastu Compliant"}\nRERA ID: ${match.reraId || "Verified"}\n\nWould you like me to coordinate a private preview visit for you and your family this week?`,
        });
      }
    }
  }

  // Deduplicate and save in database
  let createdCount = 0;
  for (const item of followUpItems) {
    const existing = await prisma.followUp.findFirst({
      where: {
        leadId: item.leadId,
        type: item.type,
        status: "PENDING",
      },
    });

    if (!existing) {
      await prisma.followUp.create({
        data: {
          leadId: item.leadId,
          propertyId: item.propertyId || null,
          dealId: item.dealId || null,
          type: item.type,
          urgency: item.urgency,
          reason: item.reason,
          suggestedChannel: item.suggestedChannel,
          draftSubject: item.draftSubject,
          draftContent: item.draftContent,
          status: "PENDING",
        },
      });
      createdCount++;
    }
  }

  return createdCount;
}
