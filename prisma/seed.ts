import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  "Electrical Works",
  "Smart Home / KNX",
  "BMS",
  "CCTV",
  "Network",
  "Fire Alarm",
  "Control Panels",
  "Lighting",
  "Programming",
  "Installation Labor",
  "Accessories",
  "Miscellaneous"
];

async function main() {
  await prisma.companySetting.upsert({
    where: { id: 1 },
    update: {},
    create: {}
  });

  const client = await prisma.client.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "تحديد اسم الزبون",
      phone: "+964 770 000 0000",
      address: "بغداد",
      projectName: "فيلا سمارت هوم",
      notes: "بيانات أولية قابلة للحذف"
    }
  });

  for (const [index, category] of categories.entries()) {
    await prisma.material.upsert({
      where: { id: index + 1 },
      update: {},
      create: {
        name: `${category} Item`,
        category,
        brand: index % 2 ? "Schneider" : "Generic",
        model: `M-${100 + index}`,
        cost: 25000 + index * 5000,
        defaultSellingPrice: 32000 + index * 7000,
        supplier: "Local Supplier"
      }
    });
  }

  await prisma.quote.upsert({
    where: { quoteNo: "Q-2026-0001" },
    update: {},
    create: {
      quoteNo: "Q-2026-0001",
      documentTitle: "كوتيشن",
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      clientId: client.id,
      projectName: "فيلا سمارت هوم",
      projectLocation: "بغداد",
      workDescription: "توريد وتنصيب منظومة KNX وكاميرات وشبكة داخلية.",
      discount: 0,
      taxRate: 0,
      advancePayment: 500000,
      items: {
        create: [
          {
            sortOrder: 1,
            category: "Smart Home / KNX",
            description: "KNX actuator and sensors installation",
            qty: 1,
            unit: "lot",
            unitPrice: 2500000,
            cost: 1800000,
            markup: 25
          },
          {
            sortOrder: 2,
            category: "CCTV",
            description: "CCTV cameras supply and installation",
            qty: 8,
            unit: "pcs",
            unitPrice: 95000,
            cost: 65000,
            markup: 30
          }
        ]
      }
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
