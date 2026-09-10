import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { address: { contains: search } },
        { city: { contains: search } },
        { state: { contains: search } },
      ];
    }

    if (type && type !== "ALL") {
      where.propertyType = type;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const properties = await prisma.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        deals: {
          select: { id: true, title: true, stage: true, dealValue: true },
        },
        showings: {
          select: { id: true, startTime: true, status: true },
        },
      },
    });

    return NextResponse.json(properties);
  } catch (error: any) {
    console.error("Failed to fetch properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      address,
      city,
      state,
      zipCode,
      country = "USA",
      price,
      propertyType,
      status = "ACTIVE",
      listingType = "FOR_SALE",
      bedrooms,
      bathrooms,
      squareFeet,
      yearBuilt,
      lotSize,
      description,
      featuredImage,
      images,
      features,
      assignedAgent = "Sarah Jenkins",
    } = body;

    if (!title || !address || !city || !state || !price) {
      return NextResponse.json(
        { error: "Title, address, city, state, and price are required." },
        { status: 400 }
      );
    }

    const slug =
      title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);

    const priceVal = parseFloat(price);
    const sqFtVal = parseInt(squareFeet) || 1000;
    const pricePerSqFt = Math.round(priceVal / sqFtVal);

    const property = await prisma.property.create({
      data: {
        title,
        slug,
        address,
        city,
        state,
        zipCode: zipCode || "00000",
        country,
        price: priceVal,
        propertyType: propertyType || "SINGLE_FAMILY",
        status,
        listingType,
        bedrooms: parseInt(bedrooms) || 3,
        bathrooms: parseFloat(bathrooms) || 2,
        squareFeet: sqFtVal,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
        lotSize: lotSize || null,
        description: description || "Gorgeous property with prime location and premium finishes.",
        featuredImage:
          featuredImage ||
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        images:
          typeof images === "string"
            ? images
            : JSON.stringify(
                images && images.length > 0
                  ? images
                  : [
                      featuredImage ||
                        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
                    ]
              ),
        features:
          typeof features === "string"
            ? features
            : JSON.stringify(features || ["Central AC", "Garage", "Modern Kitchen"]),
        pricePerSqFt,
        assignedAgent,
      },
    });

    // Also log an activity
    await prisma.activity.create({
      data: {
        type: "NOTE",
        title: "New Property Listed",
        description: `New listing '${property.title}' added with price $${property.price.toLocaleString()}.`,
        propertyId: property.id,
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create property:", error);
    return NextResponse.json(
      { error: "Failed to create property", details: error.message },
      { status: 500 }
    );
  }
}
