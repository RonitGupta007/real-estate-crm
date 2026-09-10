import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        deals: {
          include: { lead: true },
        },
        showings: {
          include: { lead: true },
          orderBy: { startTime: "asc" },
        },
        activities: {
          orderBy: { createdAt: "desc" },
        },
        interestedLeads: {
          include: { lead: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const priceVal = body.price ? parseFloat(body.price) : undefined;
    const sqFtVal = body.squareFeet ? parseInt(body.squareFeet) : undefined;
    let pricePerSqFt;
    if (priceVal && sqFtVal) {
      pricePerSqFt = Math.round(priceVal / sqFtVal);
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...body,
        price: priceVal,
        squareFeet: sqFtVal,
        bedrooms: body.bedrooms ? parseInt(body.bedrooms) : undefined,
        bathrooms: body.bathrooms ? parseFloat(body.bathrooms) : undefined,
        yearBuilt: body.yearBuilt ? parseInt(body.yearBuilt) : undefined,
        pricePerSqFt: pricePerSqFt ?? undefined,
        images: Array.isArray(body.images) ? JSON.stringify(body.images) : body.images,
        features: Array.isArray(body.features) ? JSON.stringify(body.features) : body.features,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Property deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
