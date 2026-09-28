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
// ============ DEMO ITEMS ============
const studentUser = await prisma.user.findUnique({
  where: { email: 'student@university.edu' },
});
const adminUser = await prisma.user.findUnique({
  where: { email: 'admin@university.edu' },
});

if (studentUser && adminUser) {
  const electronics = await prisma.category.findUnique({ where: { slug: 'electronics' } });
  const bags = await prisma.category.findUnique({ where: { slug: 'bags' } });
  const idDocs = await prisma.category.findUnique({ where: { slug: 'id-documents' } });
  const sports = await prisma.category.findUnique({ where: { slug: 'sports' } });

  const demoItems = [
    {
      userId: studentUser.id,
      type: 'LOST' as const,
      title: 'Black iPhone 13',
      description: 'Lost my black iPhone 13 with a blue silicone case near the Central Library 2nd floor. Has a small crack on top-left corner. Please contact if found.',
      categoryId: electronics!.id,
      brand: 'Apple',
      color: 'Black',
      building: 'Central Library',
      floor: '2nd',
      room: 'Reading Room',
      lostFoundDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reward: '৳5000',
    },
    {
      userId: adminUser.id,
      type: 'FOUND' as const,
      title: 'Blue Backpack',
      description: 'Found a blue North Face backpack in the cafeteria. Contains some books and notebooks. Owner can claim with details.',
      categoryId: bags!.id,
      brand: 'North Face',
      color: 'Blue',
      building: 'Student Center',
      floor: '1st',
      room: 'Cafeteria',
      lostFoundDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      userId: studentUser.id,
      type: 'LOST' as const,
      title: 'UIU Student ID Card',
      description: 'Lost my student ID card somewhere between CSE Building and Library. ID: 011-2023-XXXX. Please return if found.',
      categoryId: idDocs!.id,
      color: 'White',
      building: 'CSE Building',
      lostFoundDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      userId: adminUser.id,
      type: 'FOUND' as const,
      title: 'Silver Wrist Watch',
      description: 'Found a silver analog watch near the Sports Complex. Looks expensive. Owner should describe the brand and strap.',
      categoryId: sports!.id,
      color: 'Silver',
      building: 'Sports Complex',
      lostFoundDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const item of demoItems) {
    const existing = await prisma.item.findFirst({
      where: { title: item.title, userId: item.userId },
    });
    if (!existing) {
      await prisma.item.create({ data: item });
    }
  }
  console.log(`✅ ${demoItems.length} demo items created`);
}
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