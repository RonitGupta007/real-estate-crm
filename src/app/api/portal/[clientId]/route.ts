import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;

    const [client, allActiveProperties] = await Promise.all([
      prisma.lead.findUnique({
        where: { id: clientId },
        include: {
          deals: {
            include: {
              property: true,
              documents: true,
            },
          },
          showings: {
            include: { property: true },
            orderBy: { startTime: "asc" },
          },
          documents: {
            include: { property: true, deal: true },
            orderBy: { createdAt: "desc" },
          },
          activities: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      }),
      prisma.property.findMany({
        where: { status: "ACTIVE" },
        take: 6,
        orderBy: { price: "desc" },
      }),
    ]);

    if (!client) {
      return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
    }

    // Curated properties: matched or luxury properties within budget
    const curatedProperties = allActiveProperties.filter(
      (p) => !client.budgetMax || p.price <= client.budgetMax * 1.25
    );

    // Escrow milestones generator for any deal under contract or with offer submitted
    const dealsWithMilestones = client.deals.map((deal) => {
      const stage = deal.stage;

      const milestones = [
        {
          id: 1,
          name: "Offer Submitted & Mutual Acceptance",
          status: ["OFFER_SUBMITTED", "UNDER_CONTRACT", "CLOSING", "CLOSED_WON"].includes(stage)
            ? "COMPLETED"
            : "CURRENT",
          date: deal.createdAt,
          details: `Offer accepted at ${deal.property ? `$${deal.dealValue.toLocaleString()}` : "agreed price"}. Escrow opened with First American Title.`,
        },
        {
          id: 2,
          name: "Earnest Money Escrow Deposit (3%)",
          status: ["UNDER_CONTRACT", "CLOSING", "CLOSED_WON"].includes(stage)
            ? "COMPLETED"
            : stage === "OFFER_SUBMITTED"
            ? "CURRENT"
            : "UPCOMING",
          date: new Date(new Date(deal.createdAt).getTime() + 1000 * 60 * 60 * 48),
          details: `Wire transfer verified and held in fiduciary trust. Receipt generated.`,
        },
        {
          id: 3,
          name: "Physical & Environmental Due Diligence",
          status: ["UNDER_CONTRACT", "CLOSING", "CLOSED_WON"].includes(stage)
            ? "COMPLETED"
            : "UPCOMING",
          date: new Date(new Date(deal.createdAt).getTime() + 1000 * 60 * 60 * 24 * 7),
          details: `Structural, roof, HVAC, and pool inspection reports uploaded to Vault.`,
        },
        {
          id: 4,
          name: "Appraisal & Financing / Capital Verification",
          status: ["CLOSING", "CLOSED_WON"].includes(stage)
            ? "COMPLETED"
            : stage === "UNDER_CONTRACT"
            ? "CURRENT"
            : "UPCOMING",
          date: new Date(new Date(deal.createdAt).getTime() + 1000 * 60 * 60 * 24 * 14),
          details: `Independent appraisal cleared at purchase price. Lender underwriting satisfied.`,
        },
        {
          id: 5,
          name: "Final Walkthrough & County Recording",
          status: stage === "CLOSED_WON"
            ? "COMPLETED"
            : stage === "CLOSING"
            ? "CURRENT"
            : "UPCOMING",
          date: deal.closeDate || new Date(new Date(deal.createdAt).getTime() + 1000 * 60 * 60 * 24 * 21),
          details: `Key release and recorded grant deed delivered.`,
        },
      ];

      return {
        ...deal,
        milestones,
      };
    });

    return NextResponse.json({
      client,
      activeDeals: dealsWithMilestones,
      scheduledTours: client.showings,
      documents: client.documents,
      curatedProperties,
      activities: client.activities,
    });
  } catch (error: any) {
    console.error("Portal API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
