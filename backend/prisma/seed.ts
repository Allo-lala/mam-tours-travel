import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log(" Seeding database...")

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@mamtours.ug" },
    update: {},
    create: {
      email: "admin@mamtours.ug",
      passwordHash: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  })
  console.log("✅ Created admin user:", admin.email)

  // Create regular user
  const userPassword = await bcrypt.hash("user123", 10)
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      passwordHash: userPassword,
      name: "John Doe",
      role: "USER",
    },
  })
  console.log("✅ Created regular user:", user.email)

  // Create vehicles with Ugandan plates
  const vehicles = [
    {
      brand: "Mercedes-Benz",
      model: "E350",
      plate: "UBA 123C",
      dailyRate: 200000.0,
      seats: 5,
    },
    {
      brand: "Audi",
      model: "A6",
      plate: "UAS 045D",
      dailyRate: 220000.0,
      seats: 5,
    },
    {
      brand: "BMW",
      model: "X5",
      plate: "UBB 678E",
      dailyRate: 240000.0,
      seats: 5,
    },
    {
      brand: "Toyota",
      model: "Prado",
      plate: "UBC 999F",
      dailyRate: 180000.0,
      seats: 7,
    },
    {
      brand: "Mercedes-Benz",
      model: "S500",
      plate: "UBB 001G",
      dailyRate: 350000.0,
      seats: 5,
    },
    {
      brand: "Audi",
      model: "Q7",
      plate: "UAA 32 00042",
      dailyRate: 300.0,
      seats: 7,
    },
  ]

  for (const vehicleData of vehicles) {
    const vehicle = await prisma.vehicle.upsert({
      where: { plate: vehicleData.plate },
      update: {},
      create: vehicleData,
    })
    console.log("✅ Created vehicle:", vehicle.brand, vehicle.model, vehicle.plate)
  }

  console.log("🎉 Seeding completed!")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
