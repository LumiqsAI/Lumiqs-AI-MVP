import 'dotenv/config';
import { PrismaClient, BusinessStage, MemoryType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@lumiqs.ai' },
    update: {},
    create: {
      clerkId: 'demo_clerk_id',
      email: 'demo@lumiqs.ai',
      firstName: 'Demo',
      lastName: 'Founder',
    },
  });

  // Create demo business
  let business = await prisma.business.findFirst({
    where: { userId: user.id, name: 'Lumiqs AI' },
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
      userId: user.id,
      name: 'Lumiqs AI',
      industry: 'AI SaaS',
      stage: BusinessStage.MVP,
      country: 'United States',
      teamSize: '1-5',
      revenueModel: 'Subscription SaaS',
      targetAudience: 'Startup founders and entrepreneurs',
      description:
        'AI-powered business consultant platform that helps entrepreneurs make smarter decisions.',
      goals: 'Acquire first 100 paying customers within 3 months of launch.',
      challenges: 'Customer acquisition, positioning, and standing out in a crowded AI market.',
      },
    });
  }

  // Seed business memories
  const demoMemories = [
      {
        businessId: business.id,
        type: MemoryType.BUSINESS_FACT,
        content: 'The founder wants to target SaaS companies with 10–50 employees.',
        importance: 8,
      },
      {
        businessId: business.id,
        type: MemoryType.STRATEGIC_CONCLUSION,
        content: 'Primary growth channel should be content marketing and SEO targeting founder pain points.',
        importance: 9,
      },
      {
        businessId: business.id,
        type: MemoryType.DECISION,
        content: 'Pricing will be freemium with a $49/month Pro plan.',
        importance: 7,
      },
  ];

  for (const memory of demoMemories) {
    const exists = await prisma.businessMemory.findFirst({
      where: { businessId: business.id, content: memory.content },
    });
    if (!exists) await prisma.businessMemory.create({ data: memory });
  }

  console.log('✅ Seed complete');
  console.log(`   User: ${user.email}`);
  console.log(`   Business: ${business.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
