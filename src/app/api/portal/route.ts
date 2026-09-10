import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await prisma.lead.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        type: true,
        assignedAgent: true,
        preferredLocation: true,
        budgetMax: true,
        deals: {
          select: {
            id: true,
            title: true,
            stage: true,
            dealValue: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
