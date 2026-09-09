import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with realistic 3D print jobs...");

  // Clean existing records if any
  await prisma.printJob.deleteMany();

  const jobs = [
    {
      customerName: "Aisha Khan",
      productName: "Personalized Phone Stand",
      quantity: 2,
      filamentUsedGrams: 92,
      printTimeMinutes: 255, // 4h 15m
      filamentCost: 60,
      electricityCost: 15,
      otherCost: 10,
      totalCost: 85,
      sellingPrice: 300,
      profit: 215,
      status: "COMPLETED",
    },
    {
      customerName: "Rohan Patel",
      productName: "Modular Desk Organizer",
      quantity: 1,
      filamentUsedGrams: 240,
      printTimeMinutes: 480, // 8h 0m
      filamentCost: 180,
      electricityCost: 45,
      otherCost: 25,
      totalCost: 250,
      sellingPrice: 750,
      profit: 500,
      status: "PRINTING",
    },
    {
      customerName: "Vikram Sharma",
      productName: "Minimal Laptop Stand",
      quantity: 1,
      filamentUsedGrams: 310,
      printTimeMinutes: 620, // 10h 20m
      filamentCost: 240,
      electricityCost: 60,
      otherCost: 30,
      totalCost: 330,
      sellingPrice: 1100,
      profit: 770,
      status: "COMPLETED",
    },
    {
      customerName: "Pooja Nair",
      productName: "Jewelry Organizer",
      quantity: 3,
      filamentUsedGrams: 150,
      printTimeMinutes: 360, // 6h 0m
      filamentCost: 110,
      electricityCost: 35,
      otherCost: 20,
      totalCost: 165,
      sellingPrice: 550,
      profit: 385,
      status: "PENDING",
    },
    {
      customerName: "Ananya Rao",
      productName: "Decorative Vase",
      quantity: 1,
      filamentUsedGrams: 180,
      printTimeMinutes: 420, // 7h 0m
      filamentCost: 140,
      electricityCost: 40,
      otherCost: 20,
      totalCost: 200,
      sellingPrice: 650,
      profit: 450,
      status: "PENDING",
    },
  ];

  for (const job of jobs) {
    await prisma.printJob.create({
      data: job,
    });
  }

  console.log(`Successfully seeded ${jobs.length} print jobs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
