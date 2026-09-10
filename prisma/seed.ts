import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning existing database...");
  await prisma.activity.deleteMany();
  await prisma.showing.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.leadPropertyInterest.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.property.deleteMany();

  console.log("Seeding properties...");

  const propertiesData = [
    {
      title: "The Bel Air Modern Sanctuary",
      slug: "bel-air-modern-sanctuary",
      address: "1048 Stradella Rd",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90077",
      country: "USA",
      price: 6850000,
      propertyType: "LUXURY_ESTATE",
      status: "ACTIVE",
      listingType: "FOR_SALE",
      bedrooms: 6,
      bathrooms: 7.5,
      squareFeet: 7420,
      yearBuilt: 2022,
      lotSize: "0.85 Acres",
      pricePerSqFt: 923,
      hoaFees: 450,
      assignedAgent: "Sarah Jenkins",
      featuredImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      ]),
      features: JSON.stringify([
        "Infinity Edge Pool",
        "Wine Cellar (800 Bottles)",
        "Automated Smart Home",
        "Private Home Theater",
        "Panoramic City Views",
        "3-Car Showroom Garage",
      ]),
      description:
        "An architectural triumph nestled in upper Bel Air. Floor-to-ceiling glass walls seamlessly dissolve indoor/outdoor boundaries. Custom Italian cabinetry, primary retreat with dual spa baths, and an entertainer's backyard with infinity pool overlooking city lights.",
    },
    {
      title: "Tribeca Cast-Iron Loft",
      slug: "tribeca-cast-iron-loft",
      address: "64 Franklin St, Apt 4B",
      city: "New York",
      state: "NY",
      zipCode: "10013",
      country: "USA",
      price: 3450000,
      propertyType: "CONDO",
      status: "ACTIVE",
      listingType: "FOR_SALE",
      bedrooms: 3,
      bathrooms: 3.0,
      squareFeet: 2850,
      yearBuilt: 1910,
      lotSize: "N/A",
      pricePerSqFt: 1210,
      hoaFees: 1850,
      assignedAgent: "Sarah Jenkins",
      featuredImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      ]),
      features: JSON.stringify([
        "13ft Ceilings",
        "Keyed Elevator Access",
        "Original Exposed Brick",
        "Chef's Gaggenau Kitchen",
        "Radiant Heated Floors",
        "Private Storage Room",
      ]),
      description:
        "Historic Tribeca cast-iron residence restored to perfection. Authentic timber beams, wide-plank oak floors, southern exposure through oversized arched windows, and ultra-quiet master suite with deep soaking marble tub.",
    },
    {
      title: "The Horizon Glass Penthouse",
      slug: "horizon-glass-penthouse",
      address: "1000 Brickell Plaza, PH-52",
      city: "Miami",
      state: "FL",
      zipCode: "33131",
      country: "USA",
      price: 4950000,
      propertyType: "CONDO",
      status: "PENDING",
      listingType: "FOR_SALE",
      bedrooms: 4,
      bathrooms: 4.5,
      squareFeet: 4120,
      yearBuilt: 2021,
      lotSize: "N/A",
      pricePerSqFt: 1201,
      hoaFees: 2400,
      assignedAgent: "Michael Vance",
      featuredImage: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      ]),
      features: JSON.stringify([
        "Private Rooftop Deck & Plunge Pool",
        "Biscayne Bay 360 Views",
        "24/7 Concierge & Valet",
        "Sub-Zero & Wolf Appliances",
        "Private 2-Car Sky Garage",
      ]),
      description:
        "Crown jewel of Brickell. 52nd-floor corner penthouse with sweeping views over Biscayne Bay and Atlantic Ocean. Wraparound terrace with private rooftop plunge pool and summer kitchen.",
    },
    {
      title: "The Woodlands Modern Farmhouse",
      slug: "woodlands-modern-farmhouse",
      address: "4208 Pine Valley Trail",
      city: "Austin",
      state: "TX",
      zipCode: "78746",
      country: "USA",
      price: 2150000,
      propertyType: "SINGLE_FAMILY",
      status: "ACTIVE",
      listingType: "FOR_SALE",
      bedrooms: 5,
      bathrooms: 4.0,
      squareFeet: 4300,
      yearBuilt: 2023,
      lotSize: "0.52 Acres",
      pricePerSqFt: 500,
      hoaFees: 75,
      assignedAgent: "Elena Rostova",
      featuredImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1200&q=80",
      ]),
      features: JSON.stringify([
        "Heated Lap Pool",
        "Detached Guest Casita",
        "Solar Energy Array",
        "Outdoor Kitchen & Firepit",
        "Eanes ISD School District",
      ]),
      description:
        "Westlake Hills contemporary farmhouse combining warm organic textures with refined finishes. Expansive covered patio, soaring 16ft cedar ceilings, custom quartz waterfall island, and private home office.",
    },
    {
      title: "Pacific Heights Victorian Manor",
      slug: "pacific-heights-victorian-manor",
      address: "2490 Broadway St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94115",
      country: "USA",
      price: 8900000,
      propertyType: "LUXURY_ESTATE",
      status: "UNDER_CONTRACT",
      listingType: "FOR_SALE",
      bedrooms: 6,
      bathrooms: 6.5,
      squareFeet: 6800,
      yearBuilt: 1898,
      lotSize: "0.18 Acres",
      pricePerSqFt: 1308,
      hoaFees: 0,
      assignedAgent: "Sarah Jenkins",
      featuredImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
      ]),
      features: JSON.stringify([
        "Golden Gate & Bay Views",
        "Preserved Historic Millwork",
        "Elevator to All 4 Levels",
        "Landscaped English Courtyard",
        "Full Wine Tasting Cellar",
      ]),
      description:
        "Grand scale Pacific Heights trophy asset overlooking the Bay and Palace of Fine Arts. Meticulously seismically retrofitted and upgraded with high-end modern amenities while preserving Victorian period grandeur.",
    },
    {
      title: "Lincoln Park Designer Brownstone",
      slug: "lincoln-park-designer-brownstone",
      address: "1842 N Cleveland Ave",
      city: "Chicago",
      state: "IL",
      zipCode: "60614",
      country: "USA",
      price: 1875000,
      propertyType: "TOWNHOUSE",
      status: "ACTIVE",
      listingType: "FOR_SALE",
      bedrooms: 4,
      bathrooms: 3.5,
      squareFeet: 3600,
      yearBuilt: 2018,
      lotSize: "0.08 Acres",
      pricePerSqFt: 520,
      hoaFees: 0,
      assignedAgent: "Michael Vance",
      featuredImage: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
      ]),
      features: JSON.stringify([
        "Rooftop Terrace with City Skyline Views",
        "Private Garage with EV Charger",
        "Custom Poliform Closets",
        "Heated Lower Level Suite",
      ]),
      description:
        "Pristine limestone brownstone located on coveted tree-lined Cleveland Ave. Features sun-drenched multi-level living, private terrace with outdoor fireplace, and heated 2-car garage.",
    },
    {
      title: "Sunset Strip Creative HQ & Commercial Gallery",
      slug: "sunset-strip-creative-hq",
      address: "8840 Sunset Blvd",
      city: "West Hollywood",
      state: "CA",
      zipCode: "90069",
      country: "USA",
      price: 5200000,
      propertyType: "COMMERCIAL",
      status: "ACTIVE",
      listingType: "FOR_SALE",
      bedrooms: 0,
      bathrooms: 4.0,
      squareFeet: 5100,
      yearBuilt: 2015,
      lotSize: "0.22 Acres",
      pricePerSqFt: 1019,
      hoaFees: 0,
      assignedAgent: "Elena Rostova",
      featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      ]),
      features: JSON.stringify([
        "High Foot Traffic Sunset Strip Frontage",
        "Private Executive Suites & Studio",
        "Underground Secure Parking (10 spaces)",
        "Turnkey Creative Tech or Design Showroom",
      ]),
      description:
        "Prime commercial showroom and creative executive headquarters on prime Sunset Boulevard. High ceilings, glass partition conference rooms, motorized security screens, and dedicated fiber connectivity.",
    },
  ];

  const createdProperties = [];
  for (const prop of propertiesData) {
    const p = await prisma.property.create({ data: prop });
    createdProperties.push(p);
  }
  console.log(`Created ${createdProperties.length} properties.`);

  console.log("Seeding leads / clients...");

  const leadsData = [
    {
      firstName: "Alexander",
      lastName: "Wright",
      email: "alexander.wright@techventures.io",
      phone: "+1 (310) 555-0182",
      type: "BUYER",
      status: "NEGOTIATING",
      source: "REFERRAL",
      budgetMin: 6000000,
      budgetMax: 7500000,
      preferredLocation: "Los Angeles (Bel Air, Beverly Hills)",
      preferredType: "LUXURY_ESTATE",
      priority: "URGENT",
      notes: "Tech founder relocating from SF. Wants privacy, high security, and infinity pool. Toured Stradella Rd twice.",
      assignedAgent: "Sarah Jenkins",
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    },
    {
      firstName: "Sophia",
      lastName: "Chen",
      email: "sophia.chen@chelseacapital.com",
      phone: "+1 (212) 555-0193",
      type: "BUYER",
      status: "SHOWING",
      source: "WEBSITE",
      budgetMin: 3000000,
      budgetMax: 4000000,
      preferredLocation: "New York (Tribeca, SoHo)",
      preferredType: "CONDO",
      priority: "HIGH",
      notes: "Hedge fund partner looking for high-ceiling loft in Tribeca. Very interested in Franklin St.",
      assignedAgent: "Sarah Jenkins",
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      firstName: "Marcus",
      lastName: "Sterling",
      email: "marcus@sterlinginvestments.com",
      phone: "+1 (305) 555-0144",
      type: "INVESTOR",
      status: "UNDER_CONTRACT",
      source: "ZILLOW",
      budgetMin: 4500000,
      budgetMax: 5500000,
      preferredLocation: "Miami (Brickell, Sunny Isles)",
      preferredType: "CONDO",
      priority: "HIGH",
      notes: "All-cash buyer. Escrow deposit made on Horizon Glass Penthouse. Target closing in 2 weeks.",
      assignedAgent: "Michael Vance",
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    },
    {
      firstName: "David & Olivia",
      lastName: "Miller",
      email: "olivia.miller@gmail.com",
      phone: "+1 (512) 555-0167",
      type: "BUYER",
      status: "QUALIFIED",
      source: "OPEN_HOUSE",
      budgetMin: 2000000,
      budgetMax: 2400000,
      preferredLocation: "Austin (Westlake, Rollingwood)",
      preferredType: "SINGLE_FAMILY",
      priority: "MEDIUM",
      notes: "Pre-approved with Chase for $2.4M. Looking for top school districts for their two kids.",
      assignedAgent: "Elena Rostova",
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    },
    {
      firstName: "Harrison",
      lastName: "Blake",
      email: "hblake@blakeequity.com",
      phone: "+1 (415) 555-0112",
      type: "BUYER",
      status: "WON",
      source: "REFERRAL",
      budgetMin: 8000000,
      budgetMax: 9500000,
      preferredLocation: "San Francisco (Pacific Heights)",
      preferredType: "LUXURY_ESTATE",
      priority: "URGENT",
      notes: "Offer accepted on Broadway St Victorian! In escrow with closing inspection complete.",
      assignedAgent: "Sarah Jenkins",
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    },
    {
      firstName: "Elena",
      lastName: "Moretti",
      email: "moretti.design@gmail.com",
      phone: "+1 (310) 555-0133",
      type: "BUYER",
      status: "NEW",
      source: "SOCIAL_MEDIA",
      budgetMin: 4000000,
      budgetMax: 5500000,
      preferredLocation: "West Hollywood / Beverly Hills",
      preferredType: "COMMERCIAL",
      priority: "MEDIUM",
      notes: "Inquired via Instagram ad about Sunset Strip creative space. Wants to establish design gallery.",
      assignedAgent: "Elena Rostova",
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      firstName: "Robert",
      lastName: "Thurston",
      email: "rthurston@chicagoindustrial.com",
      phone: "+1 (312) 555-0177",
      type: "SELLER",
      status: "CONTACTED",
      source: "REALTOR",
      budgetMin: 1800000,
      budgetMax: 2000000,
      preferredLocation: "Chicago (Lincoln Park)",
      preferredType: "TOWNHOUSE",
      priority: "LOW",
      notes: "Considering downsizing. Wants comparative market analysis on Lincoln Park properties before listing.",
      assignedAgent: "Michael Vance",
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    },
  ];

  const createdLeads = [];
  for (const lead of leadsData) {
    const l = await prisma.lead.create({ data: lead });
    createdLeads.push(l);
  }
  console.log(`Created ${createdLeads.length} leads.`);

  console.log("Seeding deals / pipeline...");

  const dealsData = [
    {
      title: "Bel Air Sanctuary - Wright Acquisition",
      stage: "OFFER_SUBMITTED",
      dealValue: 6750000,
      expectedCommission: 202500, // 3%
      commissionRate: 3.0,
      probability: 75,
      closeDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
      leadId: createdLeads[0].id,
      propertyId: createdProperties[0].id,
      notes: "Submitted formal offer at $6.75M with 21-day escrow. Counteroffer expected tomorrow.",
    },
    {
      title: "Tribeca Loft - Chen Purchase",
      stage: "SHOWING",
      dealValue: 3450000,
      expectedCommission: 86250, // 2.5%
      commissionRate: 2.5,
      probability: 50,
      closeDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      leadId: createdLeads[1].id,
      propertyId: createdProperties[1].id,
      notes: "Client loved the 13ft ceilings. Bringing interior designer for second viewing this Saturday.",
    },
    {
      title: "Brickell PH - Sterling Cash Deal",
      stage: "UNDER_CONTRACT",
      dealValue: 4950000,
      expectedCommission: 148500, // 3%
      commissionRate: 3.0,
      probability: 90,
      closeDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      leadId: createdLeads[2].id,
      propertyId: createdProperties[2].id,
      notes: "Escrow opened. Title search clear. Awaiting final wire transfer for closing next week.",
    },
    {
      title: "Westlake Farmhouse - Miller Family",
      stage: "DISCOVERY",
      dealValue: 2150000,
      expectedCommission: 64500,
      commissionRate: 3.0,
      probability: 35,
      closeDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      leadId: createdLeads[3].id,
      propertyId: createdProperties[3].id,
      notes: "Sent comparative neighborhood report. Tour scheduled for upcoming Tuesday morning.",
    },
    {
      title: "Pacific Heights Manor - Blake Estate",
      stage: "CLOSED_WON",
      dealValue: 8900000,
      expectedCommission: 267000, // 3%
      commissionRate: 3.0,
      probability: 100,
      closeDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
      leadId: createdLeads[4].id,
      propertyId: createdProperties[4].id,
      notes: "Contract signed and escrow successfully closed! Full commission recorded.",
    },
    {
      title: "Sunset Blvd HQ - Moretti Gallery",
      stage: "DISCOVERY",
      dealValue: 5200000,
      expectedCommission: 130000,
      commissionRate: 2.5,
      probability: 20,
      closeDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      leadId: createdLeads[5].id,
      propertyId: createdProperties[6].id,
      notes: "Introductory zoning and commercial code consultation requested.",
    },
  ];

  const createdDeals = [];
  for (const d of dealsData) {
    const deal = await prisma.deal.create({ data: d });
    createdDeals.push(deal);
  }
  console.log(`Created ${createdDeals.length} deals.`);

  console.log("Seeding showings / appointments...");

  const showingsData = [
    {
      title: "Private VIP Tour: Stradella Sanctuary",
      type: "PROPERTY_VIEWING",
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 18), // tomorrow 10am
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 20),
      status: "CONFIRMED",
      location: "1048 Stradella Rd, Bel Air",
      notes: "Alexander Wright attending with his architect. Highlight structural integrity and wine cellar.",
      agentName: "Sarah Jenkins",
      leadId: createdLeads[0].id,
      propertyId: createdProperties[0].id,
    },
    {
      title: "Second Walkthrough: Franklin Loft",
      type: "PROPERTY_VIEWING",
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 42),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 43.5),
      status: "SCHEDULED",
      location: "64 Franklin St, Apt 4B, NYC",
      notes: "Sophia Chen bringing contractor to review kitchen customization options.",
      agentName: "Sarah Jenkins",
      leadId: createdLeads[1].id,
      propertyId: createdProperties[1].id,
    },
    {
      title: "Final Closing Walkthrough: Brickell Penthouse",
      type: "INSPECTION",
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 96),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 97.5),
      status: "SCHEDULED",
      location: "1000 Brickell Plaza, Miami",
      notes: "Marcus Sterling closing checklist. Confirm all automated lighting and balcony jacuzzi tested.",
      agentName: "Michael Vance",
      leadId: createdLeads[2].id,
      propertyId: createdProperties[2].id,
    },
    {
      title: "Open House: Lincoln Park Brownstone",
      type: "OPEN_HOUSE",
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 65),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 70),
      status: "CONFIRMED",
      location: "1842 N Cleveland Ave, Chicago",
      notes: "Public Sunday open house. Refreshments ordered. Staging completed.",
      agentName: "Michael Vance",
      propertyId: createdProperties[5].id,
    },
    {
      title: "Consultation & Portfolio Review: Miller Family",
      type: "CLIENT_MEETING",
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 28),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 29),
      status: "SCHEDULED",
      location: "Austin Downtown Office / Zoom",
      notes: "Review Westlake school rankings and tax assessments.",
      agentName: "Elena Rostova",
      leadId: createdLeads[3].id,
      propertyId: createdProperties[3].id,
    },
  ];

  for (const s of showingsData) {
    await prisma.showing.create({ data: s });
  }

  console.log("Seeding activity logs...");

  const activitiesData = [
    {
      type: "CALL",
      title: "Offer Negotiation Call with Seller Agent",
      description: "Discussed $6.75M offer on 1048 Stradella. Seller is open to closing in 25 days with furniture included.",
      leadId: createdLeads[0].id,
      propertyId: createdProperties[0].id,
      dealId: createdDeals[0].id,
    },
    {
      type: "STAGE_CHANGE",
      title: "Deal Advanced to Under Contract",
      description: "Marcus Sterling signed purchase and sale agreement for Brickell Penthouse. Earnest money wired.",
      leadId: createdLeads[2].id,
      propertyId: createdProperties[2].id,
      dealId: createdDeals[2].id,
    },
    {
      type: "MEETING",
      title: "Private Showing with Sophia Chen",
      description: "Toured 64 Franklin St loft. Client loved original cast iron beams and southern natural light.",
      leadId: createdLeads[1].id,
      propertyId: createdProperties[1].id,
      dealId: createdDeals[1].id,
    },
    {
      type: "NOTE",
      title: "Pre-Approval Verified",
      description: "Verified pre-approval documentation for David & Olivia Miller ($2,400,000 via Chase Private Client).",
      leadId: createdLeads[3].id,
      propertyId: createdProperties[3].id,
      dealId: createdDeals[3].id,
    },
    {
      type: "STAGE_CHANGE",
      title: "Deal Closed & Won!",
      description: "Pacific Heights Victorian Manor deal finalized! Commission of $267,000 received into brokerage trust.",
      leadId: createdLeads[4].id,
      propertyId: createdProperties[4].id,
      dealId: createdDeals[4].id,
    },
  ];

  for (const act of activitiesData) {
    await prisma.activity.create({ data: act });
  }

  // Also seed interest links
  await prisma.leadPropertyInterest.create({
    data: {
      leadId: createdLeads[0].id,
      propertyId: createdProperties[0].id,
      interest: "OFFER_MADE",
    },
  });
  await prisma.leadPropertyInterest.create({
    data: {
      leadId: createdLeads[1].id,
      propertyId: createdProperties[1].id,
      interest: "FAVORITE",
    },
  });
  await prisma.leadPropertyInterest.create({
    data: {
      leadId: createdLeads[2].id,
      propertyId: createdProperties[2].id,
      interest: "OFFER_MADE",
    },
  });

  console.log("Database successfully seeded with realistic luxury real estate data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
