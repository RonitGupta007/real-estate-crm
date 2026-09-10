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
          reason: `Walkthrough of ${showing.property.title} conducted. Prime 24-48h window to address questions on square footage, architectural finishes, and gauge buyer offer intent.`,
          suggestedChannel: "EMAIL",
          draftSubject: `Following up on your tour of ${showing.property.title}`,
          draftContent: `Hi ${showing.lead.firstName},\n\nIt was a pleasure touring ${showing.property.title} with you. The natural light and bespoke architectural details on this property are truly distinctive.\n\nI wanted to check in to see what thoughts you and your team had after sleeping on it. The seller is currently scheduling two other private walkthroughs for this weekend, so if you have any questions regarding the disclosures, HOA documents, or offer terms, let's connect this afternoon.\n\nBest regards,\nSarah Jenkins\nManaging Principal Broker`,
        });
      }
    }
  }

  // Check 2: Stale High-Priority Leads (no contact in 48h)
  for (const lead of leads) {
    const hoursSinceContact = lead.lastContactedAt
      ? (Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60)
      : 999;

    if (hoursSinceContact > 40 && (lead.priority === "URGENT" || lead.priority === "HIGH")) {
      followUpItems.push({
        leadId: lead.id,
        type: "STALE_LEAD",
        urgency: lead.priority === "URGENT" ? "URGENT" : "HIGH",
        reason: `High-value ${lead.type.toLowerCase()} inactive for ${Math.round(hoursSinceContact)} hours. Inquiring on budget $${((lead.budgetMax || 0) / 1000000).toFixed(1)}M. Re-engagement needed to maintain deal momentum.`,
        suggestedChannel: "SMS",
        draftSubject: `Quick check-in regarding ${lead.preferredLocation || "your property search"}`,
        draftContent: `Hi ${lead.firstName}, Sarah here from Estatiq. I have two off-market opportunities coming up in ${lead.preferredLocation || "your target area"} that match your ${lead.budgetMax ? `$${(lead.budgetMax / 1000000).toFixed(1)}M` : ""} criteria. Do you have 5 minutes for a quick call today?`,
      });
    }
  }

  // Check 3: Active Offer Follow-up
  for (const deal of deals) {
    if (deal.stage === "OFFER_SUBMITTED" && deal.lead && deal.property) {
      followUpItems.push({
        leadId: deal.lead.id,
        propertyId: deal.property.id,
        dealId: deal.id,
        type: "OFFER_CHECKIN",
        urgency: "URGENT",
        reason: `Formal offer of $${deal.dealValue.toLocaleString()} submitted on ${deal.property.title}. Broker check-in required regarding counter-terms and earnest money escrow timeline.`,
        suggestedChannel: "CALL_SCRIPT",
        draftSubject: `Update: Seller response on ${deal.property.title}`,
        draftContent: `[Agent Phone Script]\n1. Call ${deal.lead.firstName} ${deal.lead.lastName} at ${deal.lead.phone}.\n2. "Hi ${deal.lead.firstName}, I just spoke with the listing broker for ${deal.property.title}. They received our offer and the seller was impressed with the clean 21-day escrow terms."\n3. "There is a slight counter on the closing timeline regarding the primary suite staging furnishings. Let's review the two options so we keep our position locked in."`,
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
        followUpItems.push({
          leadId: lead.id,
          propertyId: match.id,
          type: "NEW_MATCH",
          urgency: "MEDIUM",
          reason: `Prime match detected: ${match.title} ($${match.price.toLocaleString()}) fits ${lead.firstName}'s preference for ${lead.preferredType.replace(/_/g, " ")}.`,
          suggestedChannel: "EMAIL",
          draftSubject: `Curated Match: ${match.title} in ${match.city}`,
          draftContent: `Hi ${lead.firstName},\n\nA premier new listing just went live that aligns closely with your criteria: ${match.title} in ${match.city} ($${match.price.toLocaleString()}).\n\nIt features ${match.bedrooms} beds, ${match.bathrooms} baths, ${match.squareFeet.toLocaleString()} sqft, and luxury amenities including ${match.features ? JSON.parse(match.features).slice(0, 3).join(", ") : "premium finishes"}.\n\nWould you like me to reserve a private VIP walkthrough before public open houses this weekend?`,
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
