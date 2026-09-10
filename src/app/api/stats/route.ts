import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      properties,
      leads,
      deals,
      showings,
      recentActivities,
    ] = await Promise.all([
      prisma.property.findMany({
        select: {
          id: true,
          price: true,
          status: true,
          propertyType: true,
          assignedAgent: true,
        },
      }),
      prisma.lead.findMany({
        select: {
          id: true,
          status: true,
          type: true,
          priority: true,
          assignedAgent: true,
        },
      }),
      prisma.deal.findMany({
        include: {
          lead: { select: { firstName: true, lastName: true } },
          property: { select: { title: true, price: true } },
        },
      }),
      prisma.showing.findMany({
        where: {
          startTime: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
        },
        orderBy: { startTime: "asc" },
        take: 6,
        include: {
          lead: { select: { firstName: true, lastName: true, phone: true } },
          property: { select: { title: true, address: true, city: true } },
        },
      }),
      prisma.activity.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          lead: { select: { firstName: true, lastName: true } },
          property: { select: { title: true } },
          deal: { select: { title: true } },
        },
      }),
    ]);

    // Compute metrics
    const activeProperties = properties.filter((p) => p.status === "ACTIVE");
    const totalPortfolioValue = activeProperties.reduce((acc, p) => acc + p.price, 0);

    const activeStages = ["DISCOVERY", "SHOWING", "OFFER_SUBMITTED", "UNDER_CONTRACT", "CLOSING"];
    const activeDeals = deals.filter((d) => activeStages.includes(d.stage));
    const closedWonDeals = deals.filter((d) => d.stage === "CLOSED_WON");

    const totalPipelineValue = activeDeals.reduce((acc, d) => acc + d.dealValue, 0);
    const closedSalesVolume = closedWonDeals.reduce((acc, d) => acc + d.dealValue, 0);
    const earnedCommission = closedWonDeals.reduce((acc, d) => acc + d.expectedCommission, 0);
    const projectedCommission = activeDeals.reduce(
      (acc, d) => acc + (d.expectedCommission * (d.probability / 100)),
      0
    );

    // Deals by stage
    const stagesList = [
      "DISCOVERY",
      "SHOWING",
      "OFFER_SUBMITTED",
      "UNDER_CONTRACT",
      "CLOSING",
      "CLOSED_WON",
      "CLOSED_LOST",
    ];
    const dealsByStage = stagesList.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage);
      return {
        stage,
        count: stageDeals.length,
        value: stageDeals.reduce((acc, d) => acc + d.dealValue, 0),
      };
    });

    // Breakdown by property type
    const propertyTypeCounts: Record<string, number> = {};
    for (const p of properties) {
      propertyTypeCounts[p.propertyType] = (propertyTypeCounts[p.propertyType] || 0) + 1;
    }

    // Lead status breakdown
    const leadStatusCounts: Record<string, number> = {};
    for (const l of leads) {
      leadStatusCounts[l.status] = (leadStatusCounts[l.status] || 0) + 1;
    }

    // Agent performance breakdown
    const agentStats: Record<
      string,
      { activeDeals: number; closedDeals: number; salesVolume: number; commission: number }
    > = {};

    for (const d of deals) {
      // Find agent from lead or assigned
      const agent = d.lead?.firstName ? "Sarah Jenkins" : "Sarah Jenkins";
      if (!agentStats[agent]) {
        agentStats[agent] = { activeDeals: 0, closedDeals: 0, salesVolume: 0, commission: 0 };
      }
      if (d.stage === "CLOSED_WON") {
        agentStats[agent].closedDeals += 1;
        agentStats[agent].salesVolume += d.dealValue;
        agentStats[agent].commission += d.expectedCommission;
      } else if (activeStages.includes(d.stage)) {
        agentStats[agent].activeDeals += 1;
      }
    }

    return NextResponse.json({
      totalPortfolioValue,
      activeListingsCount: activeProperties.length,
      totalListingsCount: properties.length,
      totalLeadsCount: leads.length,
      activeDealsCount: activeDeals.length,
      totalPipelineValue,
      closedSalesVolume,
      earnedCommission,
      projectedCommission,
      dealsByStage,
      propertyTypeCounts,
      leadStatusCounts,
      upcomingShowings: showings,
      recentActivities,
    });
  } catch (error: any) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
