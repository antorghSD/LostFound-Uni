import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============ ADMIN USER ============
  const adminPassword = await bcrypt.hash('Admin@2026!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      email: 'admin@university.edu',
      passwordHash: adminPassword,
      name: 'System Admin',
      role: Role.ADMIN,
      isEmailVerified: true,
      isVerified: true,
    },
  });
  console.log('✅ Admin created:', admin.email);

  // ============ DEMO STUDENT ============
  const studentPassword = await bcrypt.hash('Student@2026!', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@university.edu' },
    update: {},
    create: {
      email: 'student@university.edu',
      passwordHash: studentPassword,
      name: 'Demo Student',
      role: Role.STUDENT,
      studentId: 'STU-2026-0001',
      department: 'CSE',
      year: 3,
      isEmailVerified: true,
      isVerified: true,
    },
  });
  console.log('✅ Student created:', student.email);

  // ============ CATEGORIES ============
  const categories = [
    { name: 'ID & Documents', slug: 'id-documents', icon: 'id-card' },
    { name: 'Electronics', slug: 'electronics', icon: 'laptop' },
    { name: 'Books & Stationery', slug: 'books-stationery', icon: 'book' },
    { name: 'Personal Items', slug: 'personal-items', icon: 'wallet' },
    { name: 'Clothing', slug: 'clothing', icon: 'shirt' },
    { name: 'Sports', slug: 'sports', icon: 'dumbbell' },
    { name: 'Keys', slug: 'keys', icon: 'key' },
    { name: 'Bags', slug: 'bags', icon: 'backpack' },
    { name: 'Others', slug: 'others', icon: 'box' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${categories.length} categories created`);

  // ============ HANDOVER LOCATIONS ============
  const locations = [
    { name: 'Main Gate Security Office', building: 'Gate 1', room: 'G-01' },
    { name: 'Library Front Desk', building: 'Central Library', room: 'L-100' },
    { name: 'Student Affairs Office', building: 'Admin Building', room: 'A-205' },
    { name: 'Cafeteria Info Desk', building: 'Student Center', room: 'C-101' },
  ];

  for (const loc of locations) {
    const existing = await prisma.handoverLocation.findFirst({
      where: { name: loc.name },
    });
    if (!existing) {
      await prisma.handoverLocation.create({ data: loc });
    }
  }
  console.log(`✅ ${locations.length} handover locations created`);

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });