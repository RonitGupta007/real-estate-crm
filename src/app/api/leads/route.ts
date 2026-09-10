import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { preferredLocation: { contains: search } },
      ];
    }

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (priority && priority !== "ALL") {
      where.priority = priority;
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        deals: {
          select: { id: true, title: true, stage: true, dealValue: true },
        },
        showings: {
          select: { id: true, title: true, startTime: true, status: true },
        },
        _count: {
          select: { activities: true, deals: true, showings: true },
        },
      },
    });

    return NextResponse.json(leads);
  } catch (error: any) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      type = "BUYER",
      status = "NEW",
      source = "WEBSITE",
      budgetMin,
      budgetMax,
      preferredLocation,
      preferredType,
      priority = "MEDIUM",
      notes,
      assignedAgent = "Sarah Jenkins",
    } = body;

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: "First name, last name, email, and phone are required." },
        { status: 400 }
      );
    }

    // Check existing email
    const existing = await prisma.lead.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A contact with this email already exists." },
        { status: 409 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        type,
        status,
        source,
        budgetMin: budgetMin ? parseFloat(budgetMin) : null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        preferredLocation,
        preferredType,
        priority,
        notes,
        assignedAgent,
        lastContactedAt: new Date(),
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: "NOTE",
        title: "Lead Created",
        description: `New ${type.toLowerCase()} lead '${lead.firstName} ${lead.lastName}' registered via ${source}.`,
        leadId: lead.id,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead", details: error.message },
      { status: 500 }
    );
  }
}
