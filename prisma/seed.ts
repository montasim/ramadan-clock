import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
    },
  });

  console.log(`✅ Created admin user: ${admin.email}`);

  // Create sample time entries for 2026 Ramadan (approximate dates)
  const sampleEntries = [
      { "date": "2026-02-19", "sehri": "05:17", "iftar": "18:00", "location": "Rangpur" },
      { "date": "2026-02-20", "sehri": "05:16", "iftar": "18:00", "location": "Rangpur" },
      { "date": "2026-02-21", "sehri": "05:16", "iftar": "18:01", "location": "Rangpur" },
      { "date": "2026-02-22", "sehri": "05:15", "iftar": "18:02", "location": "Rangpur" },
      { "date": "2026-02-23", "sehri": "05:14", "iftar": "18:02", "location": "Rangpur" },
      { "date": "2026-02-24", "sehri": "05:13", "iftar": "18:03", "location": "Rangpur" },
      { "date": "2026-02-25", "sehri": "05:13", "iftar": "18:03", "location": "Rangpur" },
      { "date": "2026-02-26", "sehri": "05:12", "iftar": "18:04", "location": "Rangpur" },
      { "date": "2026-02-27", "sehri": "05:11", "iftar": "18:04", "location": "Rangpur" },
      { "date": "2026-02-28", "sehri": "05:10", "iftar": "18:05", "location": "Rangpur" },
      { "date": "2026-03-01", "sehri": "05:09", "iftar": "18:06", "location": "Rangpur" },
      { "date": "2026-03-02", "sehri": "05:08", "iftar": "18:06", "location": "Rangpur" },
      { "date": "2026-03-03", "sehri": "05:07", "iftar": "18:07", "location": "Rangpur" },
      { "date": "2026-03-04", "sehri": "05:06", "iftar": "18:07", "location": "Rangpur" },
      { "date": "2026-03-05", "sehri": "05:05", "iftar": "18:08", "location": "Rangpur" },
      { "date": "2026-03-06", "sehri": "05:04", "iftar": "18:08", "location": "Rangpur" },
      { "date": "2026-03-07", "sehri": "05:03", "iftar": "18:09", "location": "Rangpur" },
      { "date": "2026-03-08", "sehri": "05:03", "iftar": "18:09", "location": "Rangpur" },
      { "date": "2026-03-09", "sehri": "05:02", "iftar": "18:10", "location": "Rangpur" },
      { "date": "2026-03-10", "sehri": "05:01", "iftar": "18:10", "location": "Rangpur" },
      { "date": "2026-03-11", "sehri": "04:59", "iftar": "18:11", "location": "Rangpur" },
      { "date": "2026-03-12", "sehri": "04:58", "iftar": "18:11", "location": "Rangpur" },
      { "date": "2026-03-13", "sehri": "04:57", "iftar": "18:12", "location": "Rangpur" },
      { "date": "2026-03-14", "sehri": "04:56", "iftar": "18:12", "location": "Rangpur" },
      { "date": "2026-03-15", "sehri": "04:55", "iftar": "18:13", "location": "Rangpur" },
      { "date": "2026-03-16", "sehri": "04:54", "iftar": "18:13", "location": "Rangpur" },
      { "date": "2026-03-17", "sehri": "04:53", "iftar": "18:14", "location": "Rangpur" },
      { "date": "2026-03-18", "sehri": "04:52", "iftar": "18:14", "location": "Rangpur" },
      { "date": "2026-03-19", "sehri": "04:51", "iftar": "18:15", "location": "Rangpur" },
      { "date": "2026-03-20", "sehri": "04:50", "iftar": "18:15", "location": "Rangpur" }
  ];

  for (const entry of sampleEntries) {
    await prisma.timeEntry.upsert({
      where: {
        date_location: {
          date: entry.date,
          location: entry.location,
        },
      },
      update: {
        sehri: entry.sehri,
        iftar: entry.iftar,
      },
      create: entry,
    });
  }

  console.log(`✅ Created ${sampleEntries.length} sample time entries`);

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
