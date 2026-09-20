import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning existing database...");
  await prisma.activity.deleteMany();
  await prisma.showing.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.leadPropertyInterest.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.document.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.property.deleteMany();

  console.log("Seeding premium Indian real estate properties...");

  const propertiesData = [
    {
      title: "Lodha World Towers Sea-Facing Sky Residence",
      slug: "lodha-world-towers-worli-mumbai",
      address: "World Crest, Lodha Place, Worli Sea Face",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400018",
      country: "India",
      price: 245000000, // ₹24.5 Cr
      propertyType: "APARTMENT_4BHK",
      status: "ACTIVE",
      listingType: "FOR_SALE",
      bedrooms: 4,
      bathrooms: 5.0,
      squareFeet: 4250,
      yearBuilt: 2022,
      lotSize: "N/A",
      pricePerSqFt: 57647,
      reraId: "MahaRERA: P51900008965",
      bhkConfig: "4 BHK Luxury Sky Mansion",
      facingDirection: "West Facing (Arabian Sea View)",
      maintenanceCharges: 35000, // ₹35k/month
      hoaFees: 35000,
      assignedAgent: "Priya Sharma",
      featuredImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      ]),
      features: JSON.stringify([
        "Unobstructed Arabian Sea & Sea Link Views",
        "Saint Amand 5-Star Hospitality Concierge",
        "Private Temperature-Controlled Lap Pool",
        "4 Reserved Basement Car Parkings",
        "Italian Botticino Marble Flooring",
        "Vastu Compliant North-West Entry",
      ]),
      description:
        "Trophy residence in South Mumbai's most iconic skyscraper. Featuring 13-foot floor-to-ceiling double-glazed windows framing panoramic views of the Arabian Sea. Expansive formal living pavilion, custom Poggenpohl kitchen, primary retreat with dual walk-in dressing rooms, and world-class spa amenities.",
    },
    {
      title: "Prestige Kingfisher Towers Ultra Luxury Penthouse",
      slug: "prestige-kingfisher-towers-bengaluru",
      address: "No. 4, Kasturba Road, Opp UB City, Lavelle Road",
      city: "Bengaluru",
      state: "Karnataka",
      zipCode: "560001",
      country: "India",
      price: 340000000, // ₹34.0 Cr
      propertyType: "LUXURY_PENTHOUSE",
      status: "ACTIVE",
      listingType: "FOR_SALE",
      bedrooms: 4,
      bathrooms: 5.5,
      squareFeet: 8321,
      yearBuilt: 2021,
      lotSize: "N/A",
      pricePerSqFt: 40860,
      reraId: "PRM/KA/RERA/1251/310/PR/171015/000412",
      bhkConfig: "4 BHK Ultra Penthouse",
      facingDirection: "North-East Facing (100% Vastu Compliant)",
      maintenanceCharges: 48000, // ₹48k/month
      hoaFees: 48000,
      assignedAgent: "Priya Sharma",
      featuredImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      ]),
      features: JSON.stringify([
        "Overlooking Cubbon Park & UB City Skyline",
        "Private Direct-Access Elevator Lobby",
        "5 Covered Stilt Parking Spaces",
        "Biometric High-Security Access System",
        "Double-Height Glass Living Atrium",
        "Sub-Zero & Wolf Kitchen Appliances",
      ]),
      description:
        "The undisputed pinnacle of Bengaluru luxury. Situated high above Lavelle Road and UB City, this sprawling penthouse commands 360-degree lush green views of Cubbon Park. Complete with private elevator access, double-height ceiling living salons, and club facilities reserved for corporate titans.",
    },
    {
      title: "DLF The Camellias Golf View Signature Suite",
      slug: "dlf-the-camellias-golf-course-road-gurgaon",
      address: "DLF Golf Links, Sector 42, Golf Course Road",
      city: "Gurgaon",
      state: "Haryana",
      zipCode: "122002",
      country: "India",
      price: 420000000, // ₹42.0 Cr
      propertyType: "APARTMENT_4BHK",
      status: "PENDING",
      listingType: "FOR_SALE",
      bedrooms: 4,
      bathrooms: 5.0,
      squareFeet: 7400,
      yearBuilt: 2022,
      lotSize: "N/A",
      pricePerSqFt: 56756,
      reraId: "HARERA/GGM/2018/14",
      bhkConfig: "4 BHK Signature Golf Residence",
      facingDirection: "East Facing (Aravalli Range & Golf Course)",
      maintenanceCharges: 55000, // ₹55k/month
      hoaFees: 55000,
      assignedAgent: "Vikram Malhotra",
      featuredImage: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      ]),
      features: JSON.stringify([
        "18-Hole Gary Player Golf Course Frontage",
        "1.3 Lakh Sq Ft Exclusive Clubhouse",
        "Spa & Wellness Pavilion by ESPA",
        "Private Helipad & Golf Buggy Service",
        "Triple-Height Grand Lobby",
        "4 Stacker Covered Car Parkings",
      ]),
      description:
        "India's premier super-luxury condominium on Golf Course Road. Unmatched views across the lush DLF Golf Links course and Aravalli Ridge. Designed by Hafeez Contractor with interiors by Hirsch Bedner Associates. Features sprawling wraparound decks, air purification filtration, and 7-tier security.",
    },
    {
      title: "Total Environment 'In That Quiet Earth' Terrace Home",
      slug: "total-environment-quiet-earth-hennur-bengaluru",
      address: "Off Hennur Main Road, North Bengaluru",
      city: "Bengaluru",
      state: "Karnataka",
      zipCode: "560077",
      country: "India",
      price: 34500000, // ₹3.45 Cr
      propertyType: "APARTMENT_3BHK",
      status: "ACTIVE",
      listingType: "FOR_SALE",
      bedrooms: 3,
      bathrooms: 3.5,
      squareFeet: 2890,
      yearBuilt: 2023,
      lotSize: "N/A",
      pricePerSqFt: 11937,
      reraId: "PRM/KA/RERA/1251/446/PR/180516/001740",
      bhkConfig: "3 BHK Earth & Garden Home",
      facingDirection: "East Facing (Morning Sun & Garden)",
      maintenanceCharges: 9500, // ₹9.5k/month
      hoaFees: 9500,
      assignedAgent: "Priya Sharma",
      featuredImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1200&q=80",
      ]),
      features: JSON.stringify([
        "Handcrafted Wire-Cut Brick Architecture",
        "Private Landscaped Garden Terrace with Drip Irrigation",
        "Custom Solid Teakwood Cabinetry & Flooring",
        "Central VRV Heat Pump Air Conditioning",
        "Heated Community Pool & Microbrewery Club",
      ]),
      description:
        "Signature Total Environment craftsmanship. Organic exposed brickwork, custom teakwood woodwork, and a private garden terrace seamless with the living space. Located along the high-growth Hennur-Airport corridor with easy access to Kempegowda International Airport and Manyata Tech Park.",
    },
    {
      title: "Jubilee Hills Signature Hilltop Estate Villa",
      slug: "jubilee-hills-hilltop-villa-hyderabad",
      address: "Road No. 36, Jubilee Hills Check Post",
      city: "Hyderabad",
      state: "Telangana",
      zipCode: "500033",
      country: "India",
      price: 195000000, // ₹19.5 Cr
      propertyType: "GATED_VILLA",
      status: "UNDER_CONTRACT",
      listingType: "FOR_SALE",
      bedrooms: 5,
      bathrooms: 6.0,
      squareFeet: 6800,
      yearBuilt: 2021,
      lotSize: "620 Sq Yards",
      pricePerSqFt: 28676,
      reraId: "TG RERA: P02400004521",
      bhkConfig: "5 BHK Independent Designer Villa",
      facingDirection: "North-East Facing (100% Vastu Compliant)",
      maintenanceCharges: 15000, // ₹15k/month
      hoaFees: 15000,
      assignedAgent: "Rajesh Verma",
      featuredImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
      ]),
      features: JSON.stringify([
        "Private Infinity Plunge Pool on Terrace",
        "Private 10-Seater 4K Dolby Atmos Cinema",
        "Schindler Hydraulic Glass Elevator",
        "Italian Flurried Travertine Marble",
        "Solar Energy 10kW On-Grid Setup",
        "4-Car Gated Portico Parking",
      ]),
      description:
        "Trophy hilltop estate situated on Hyderabad's most exclusive VIP residential avenue. Designed with high Vastu alignment, soaring 15-foot ceilings, and complete smart-home automation. Walking distance from Durgam Cheruvu cable bridge and Hitec City tech district.",
    },
    {
      title: "Bandra West Pali Hill Designer Boutique Duplex",
      slug: "pali-hill-designer-duplex-bandra-mumbai",
      address: "Nargis Dutt Road, Pali Hill, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400050",
      country: "India",
      price: 168000000, // ₹16.8 Cr
      propertyType: "APARTMENT_3BHK",
      status: "ACTIVE",
      listingType: "FOR_SALE",
      bedrooms: 3,
      bathrooms: 4.0,
      squareFeet: 2650,
      yearBuilt: 2020,
      lotSize: "N/A",
      pricePerSqFt: 63396,
      reraId: "MahaRERA: P51800021445",
      bhkConfig: "3 BHK Boutique Duplex",
      facingDirection: "West Facing (Sea Breeze)",
      maintenanceCharges: 22000, // ₹22k/month
      hoaFees: 22000,
      assignedAgent: "Priya Sharma",
      featuredImage: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
      ]),
      features: JSON.stringify([
        "Coveted Pali Hill Celebrity Neighborhood",
        "Private Internal Spiral Teakwood Staircase",
        "2 Dedicated Mechanized Stacker Parkings",
        "Full Crestron Home Automation",
        "Terrace Balcony with Lush Tree Canopy",
      ]),
      description:
        "Rare duplex acquisition in prestigious Pali Hill, Bandra West. Surrounded by serene greenery yet minutes from Bandra Bandstand and BKC commercial center. Features double-height living room, acoustic sound-insulated glazing, and master suite with walk-in closet.",
    },
    {
      title: "One Horizon Center Executive Corporate Suite",
      slug: "one-horizon-center-cyber-city-gurgaon",
      address: "Golf Course Road, DLF Phase 5, Sector 43",
      city: "Gurgaon",
      state: "Haryana",
      zipCode: "122002",
      country: "India",
      price: 92000000, // ₹9.2 Cr
      propertyType: "COMMERCIAL_OFFICE",
      status: "ACTIVE",
      listingType: "FOR_SALE",
      bedrooms: 0,
      bathrooms: 4.0,
      squareFeet: 4100,
      yearBuilt: 2017,
      lotSize: "N/A",
      pricePerSqFt: 22439,
      reraId: "HARERA Commercial Certified",
      bhkConfig: "Commercial Grade-A Office Suite",
      facingDirection: "North Facing",
      maintenanceCharges: 42000, // ₹42k/month
      hoaFees: 42000,
      assignedAgent: "Vikram Malhotra",
      featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      ]),
      features: JSON.stringify([
        "LEED Platinum Certified Green Building",
        "High-Speed Destination Control OTIS Elevators",
        "100% DG Power Backup & Central Chiller AC",
        "8 Reserved Stacker Parking Slots",
        "Triple-Height Luxury Granite Reception Atrium",
      ]),
      description:
        "Prime Grade-A commercial corporate office in the heart of Golf Course Road. Houses Fortune 500 multinationals and premier private equity firms. Floor-to-ceiling glass facade, plug-and-play layout option, dedicated server room, and metro station direct skywalk.",
    },
  ];

  const createdProperties = [];
  for (const prop of propertiesData) {
    const p = await prisma.property.create({ data: prop });
    createdProperties.push(p);
  }
  console.log(`Created ${createdProperties.length} properties.`);

  console.log("Seeding verified Indian leads & VIP clients...");

  const leadsData = [
    {
      firstName: "Vikramaditya",
      lastName: "Singhania",
      email: "vikram.singhania@singhaniacapital.in",
      phone: "+91 98200 44120",
      type: "BUYER",
      status: "NEGOTIATING",
      source: "REFERRAL",
      budgetMin: 220000000, // ₹22 Cr
      budgetMax: 260000000, // ₹26 Cr
      preferredLocation: "Mumbai (Worli Sea Face, Bandra West)",
      preferredType: "APARTMENT_4BHK",
      priority: "URGENT",
      notes: "Managing Partner at Singhania PE Capital. Looking for Arabian Sea facing sky residence with minimum 4 car parkings. Toured Lodha World Towers twice.",
      assignedAgent: "Priya Sharma",
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      firstName: "Rohan & Ananya",
      lastName: "Kapoor",
      email: "ananya.kapoor@google.com",
      phone: "+91 98450 12890",
      type: "BUYER",
      status: "SHOWING",
      source: "MAGICBRICKS",
      budgetMin: 300000000, // ₹30 Cr
      budgetMax: 350000000, // ₹35 Cr
      preferredLocation: "Bengaluru (Lavelle Road, UB City)",
      preferredType: "LUXURY_PENTHOUSE",
      priority: "HIGH",
      notes: "Senior Director at Google India. Insists on North-East Vastu compliance and private elevator lobby. Very keen on Kingfisher Towers penthouse.",
      assignedAgent: "Priya Sharma",
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      firstName: "Dr. Rajesh",
      lastName: "Verma",
      email: "dr.rverma@medanta.org",
      phone: "+91 98110 55670",
      type: "BUYER",
      status: "QUALIFIED",
      source: "99ACRES",
      budgetMin: 380000000, // ₹38 Cr
      budgetMax: 450000000, // ₹45 Cr
      preferredLocation: "Gurgaon (DLF Golf Course Road)",
      preferredType: "APARTMENT_4BHK",
      priority: "HIGH",
      notes: "Chairman of Cardiovascular Surgery at Medanta. Pre-sanctioned HDFC bank loan of ₹25 Cr. Target acquisition at DLF Camellias.",
      assignedAgent: "Vikram Malhotra",
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    },
    {
      firstName: "Karan",
      lastName: "Mehra",
      email: "karan.mehra@antler.co",
      phone: "+91 98211 89345",
      type: "BUYER",
      status: "WON",
      source: "WHATSAPP",
      budgetMin: 150000000, // ₹15 Cr
      budgetMax: 180000000, // ₹18 Cr
      preferredLocation: "Mumbai (Bandra West, Pali Hill)",
      preferredType: "APARTMENT_3BHK",
      priority: "URGENT",
      notes: "Fintech founder. Bayana token advance paid and sub-registrar deed successfully executed for Bandra West Pali Hill Duplex.",
      assignedAgent: "Priya Sharma",
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
    {
      firstName: "Siddharth",
      lastName: "Reddy",
      email: "siddharth@reddypharmalabs.com",
      phone: "+91 98490 33412",
      type: "INVESTOR",
      status: "UNDER_CONTRACT",
      source: "REFERRAL",
      budgetMin: 180000000, // ₹18 Cr
      budgetMax: 210000000, // ₹21 Cr
      preferredLocation: "Hyderabad (Jubilee Hills, Banjara Hills)",
      preferredType: "GATED_VILLA",
      priority: "HIGH",
      notes: "Pharma promoter. Signed Builder Buyer Agreement (BBA) for Jubilee Hills Hilltop Estate Villa. Registry scheduled next month.",
      assignedAgent: "Rajesh Verma",
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    },
    {
      firstName: "Pooja",
      lastName: "Deshmukh",
      email: "pooja@studiodeshmukh.com",
      phone: "+91 98190 77823",
      type: "BUYER",
      status: "NEW",
      source: "HOUSING_COM",
      budgetMin: 80000000, // ₹8 Cr
      budgetMax: 100000000, // ₹10 Cr
      preferredLocation: "Gurgaon (Cyber City / One Horizon)",
      preferredType: "COMMERCIAL_OFFICE",
      priority: "MEDIUM",
      notes: "Principal architect looking to purchase corporate design studio in Grade-A commercial complex on Golf Course Road.",
      assignedAgent: "Vikram Malhotra",
      lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
  ];

  const createdLeads = [];
  for (const lead of leadsData) {
    const l = await prisma.lead.create({ data: lead });
    createdLeads.push(l);
  }
  console.log(`Created ${createdLeads.length} leads.`);

  console.log("Seeding Indian real estate transactions & pipeline deals...");

  const dealsData = [
    {
      title: "Lodha World Towers - Singhania Acquisition",
      stage: "OFFER_SUBMITTED",
      dealValue: 240000000, // ₹24.0 Cr
      expectedCommission: 4800000, // 2% = ₹48 Lakhs
      commissionRate: 2.0,
      probability: 80,
      closeDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25), // 25 days
      leadId: createdLeads[0].id,
      propertyId: createdProperties[0].id,
      notes: "Formal offer submitted at ₹24.0 Cr with 10% Bayana advance. Seller agreed to include 4 car parkings.",
    },
    {
      title: "Kingfisher Towers Penthouse - Kapoor Purchase",
      stage: "SHOWING",
      dealValue: 335000000, // ₹33.5 Cr
      expectedCommission: 6700000, // 2% = ₹67 Lakhs
      commissionRate: 2.0,
      probability: 55,
      closeDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40),
      leadId: createdLeads[1].id,
      propertyId: createdProperties[1].id,
      notes: "Clients completed second walkthrough with their Vastu consultant. Structural report approved.",
    },
    {
      title: "DLF Camellias Golf Suite - Dr. Verma Acquisition",
      stage: "DISCOVERY",
      dealValue: 415000000, // ₹41.5 Cr
      expectedCommission: 8300000, // 2% = ₹83 Lakhs
      commissionRate: 2.0,
      probability: 40,
      closeDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      leadId: createdLeads[2].id,
      propertyId: createdProperties[2].id,
      notes: "Site tour and clubhouse preview scheduled for this Saturday morning. Bank pre-sanction verified.",
    },
    {
      title: "Pali Hill Duplex - Karan Mehra Purchase",
      stage: "CLOSED_WON",
      dealValue: 168000000, // ₹16.8 Cr
      expectedCommission: 3360000, // 2% = ₹33.6 Lakhs
      commissionRate: 2.0,
      probability: 100,
      closeDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      leadId: createdLeads[3].id,
      propertyId: createdProperties[5].id,
      notes: "Sub-Registrar registration executed at Bandra Office! Full 2% brokerage credited to escrow.",
    },
    {
      title: "Jubilee Hills Villa - Siddharth Reddy Deal",
      stage: "UNDER_CONTRACT",
      dealValue: 195000000, // ₹19.5 Cr
      expectedCommission: 3900000, // 2% = ₹39 Lakhs
      commissionRate: 2.0,
      probability: 90,
      closeDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
      leadId: createdLeads[4].id,
      propertyId: createdProperties[4].id,
      notes: "Builder Buyer Agreement (BBA) executed. Title search clean with 30-year Encumbrance Certificate (EC).",
    },
    {
      title: "One Horizon Cyber City - Studio Deshmukh",
      stage: "DISCOVERY",
      dealValue: 92000000, // ₹9.2 Cr
      expectedCommission: 1840000, // 2% = ₹18.4 Lakhs
      commissionRate: 2.0,
      probability: 25,
      closeDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 75),
      leadId: createdLeads[5].id,
      propertyId: createdProperties[6].id,
      notes: "Commercial floor plan and tenant NOC requested for architecture studio setup.",
    },
  ];

  const createdDeals = [];
  for (const d of dealsData) {
    const deal = await prisma.deal.create({ data: d });
    createdDeals.push(deal);
  }
  console.log(`Created ${createdDeals.length} deals.`);

  console.log("Seeding site visits & walkthrough showings...");

  const showingsData = [
    {
      title: "Private VIP Site Visit: Lodha World Towers",
      type: "PROPERTY_VIEWING",
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 16), // Tomorrow 11 AM
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 18),
      status: "CONFIRMED",
      location: "World Crest, Lodha Place, Worli Sea Face, Mumbai",
      notes: "Vikramaditya Singhania attending with interior architect. Confirm access pass with building concierge.",
      agentName: "Priya Sharma",
      leadId: createdLeads[0].id,
      propertyId: createdProperties[0].id,
    },
    {
      title: "Vastu Consultation Walkthrough: Kingfisher Towers",
      type: "PROPERTY_VIEWING",
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 40),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 42),
      status: "SCHEDULED",
      location: "Prestige Kingfisher Towers, Lavelle Road, Bengaluru",
      notes: "Rohan & Ananya Kapoor reviewing master bedroom orientation and private deck.",
      agentName: "Priya Sharma",
      leadId: createdLeads[1].id,
      propertyId: createdProperties[1].id,
    },
    {
      title: "Golf Cart & Clubhouse Tour: DLF The Camellias",
      type: "PROPERTY_VIEWING",
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 64),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 66),
      status: "SCHEDULED",
      location: "DLF Golf Links, Golf Course Road, Gurgaon",
      notes: "Dr. Rajesh Verma tour of ESPA wellness center and signature golf suites.",
      agentName: "Vikram Malhotra",
      leadId: createdLeads[2].id,
      propertyId: createdProperties[2].id,
    },
    {
      title: "Open House Showcase: Total Environment Earth Home",
      type: "OPEN_HOUSE",
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 88),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 94),
      status: "CONFIRMED",
      location: "Off Hennur Main Road, North Bengaluru",
      notes: "Weekend terrace garden showcase for tech executives relocating to North Bengaluru.",
      agentName: "Priya Sharma",
      propertyId: createdProperties[3].id,
    },
  ];

  for (const s of showingsData) {
    await prisma.showing.create({ data: s });
  }

  console.log("Seeding verified transaction legal documents...");

  const documentsData = [
    {
      title: "Registered Sale Deed & Stamp Duty Challan",
      category: "CONTRACT",
      fileSize: "4.8 MB",
      leadId: createdLeads[3].id,
      propertyId: createdProperties[5].id,
      dealId: createdDeals[3].id,
    },
    {
      title: "MahaRERA Project Approval Certificate",
      category: "RERA",
      fileSize: "2.1 MB",
      leadId: createdLeads[0].id,
      propertyId: createdProperties[0].id,
      dealId: createdDeals[0].id,
    },
    {
      title: "30-Year Encumbrance Certificate (EC Form 15)",
      category: "TITLE",
      fileSize: "3.2 MB",
      leadId: createdLeads[4].id,
      propertyId: createdProperties[4].id,
      dealId: createdDeals[4].id,
    },
    {
      title: "Occupancy Certificate (OC) & Khata Extract (A-Khata)",
      category: "KHATA",
      fileSize: "1.9 MB",
      leadId: createdLeads[1].id,
      propertyId: createdProperties[1].id,
      dealId: createdDeals[1].id,
    },
  ];

  for (const doc of documentsData) {
    await prisma.document.create({ data: doc });
  }

  console.log("Seeding interaction logs & audit trail...");

  const activitiesData = [
    {
      type: "CALL",
      title: "Bayana Token Terms Discussion with Listing Head",
      description: "Agreed on ₹24.0 Cr net price for Lodha World Towers. Token cheque of ₹50 Lakhs being prepared for signing.",
      leadId: createdLeads[0].id,
      propertyId: createdProperties[0].id,
      dealId: createdDeals[0].id,
    },
    {
      type: "STAGE_CHANGE",
      title: "Sub-Registrar Registration Completed (Closed Won!)",
      description: "Karan Mehra finalized Pali Hill duplex registration at Bandra Sub-Registrar Office. Full brokerage of ₹33.6 Lakhs realized.",
      leadId: createdLeads[3].id,
      propertyId: createdProperties[5].id,
      dealId: createdDeals[3].id,
    },
    {
      type: "MEETING",
      title: "Vastu Verification Walkthrough at Kingfisher Towers",
      description: "Ananya & Rohan Kapoor verified North-East entrance and living space airflow. Vastu score rated 9.5/10.",
      leadId: createdLeads[1].id,
      propertyId: createdProperties[1].id,
      dealId: createdDeals[1].id,
    },
    {
      type: "NOTE",
      title: "HDFC Bank Home Loan In-Principle Approval",
      description: "Verified pre-approval documentation for Dr. Rajesh Verma (₹25 Cr via HDFC Wealth Banking).",
      leadId: createdLeads[2].id,
      propertyId: createdProperties[2].id,
      dealId: createdDeals[2].id,
    },
  ];

  for (const act of activitiesData) {
    await prisma.activity.create({ data: act });
  }

  // Seed interest links
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
      interest: "VIEWED",
    },
  });

  console.log("Database successfully seeded with realistic Indian luxury real estate portfolio!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
