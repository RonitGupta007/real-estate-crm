import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const deals = await prisma.deal.findMany({ include: { lead: true, property: true } });

  for (const deal of deals) {
    if (deal.lead && deal.property) {
      await prisma.document.createMany({
        data: [
          {
            title: `Residential Purchase Agreement & Joint Escrow Instructions - ${deal.property.title}`,
            category: "CONTRACT",
            fileSize: "4.8 MB",
            fileUrl: "#",
            leadId: deal.lead.id,
            propertyId: deal.property.id,
            dealId: deal.id,
          },
          {
            title: `Preliminary Title Guarantee & Plats - First American Title`,
            category: "TITLE",
            fileSize: "8.2 MB",
            fileUrl: "#",
            leadId: deal.lead.id,
            propertyId: deal.property.id,
            dealId: deal.id,
          },
          {
            title: `Comprehensive Architectural & Mechanical Inspection Report`,
            category: "INSPECTION",
            fileSize: "14.1 MB",
            fileUrl: "#",
            leadId: deal.lead.id,
            propertyId: deal.property.id,
            dealId: deal.id,
          },
          {
            title: `HOA Governing Documents, By-Laws & Financial Reserves 2026`,
            category: "HOA",
            fileSize: "6.5 MB",
            fileUrl: "#",
            leadId: deal.lead.id,
            propertyId: deal.property.id,
            dealId: deal.id,
          },
          {
            title: `Official Escrow Trust Wire Transfer Security Instructions`,
            category: "WIRE",
            fileSize: "1.1 MB",
            fileUrl: "#",
            leadId: deal.lead.id,
            propertyId: deal.property.id,
            dealId: deal.id,
          },
        ],
      });
    }
  }

  console.log("Documents successfully seeded for VIP client portal!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
