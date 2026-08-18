import { Test, TestingModule } from '@nestjs/testing';
import { BusinessContextService } from './business-context.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { BusinessStage } from '@prisma/client';

const mockBusiness = {
  id: 'biz-1',
  userId: 'user-1',
  name: 'Lumiqs AI',
  industry: 'AI SaaS',
  stage: BusinessStage.MVP,
  country: 'United States',
  teamSize: '1-5',
  revenueModel: 'Subscription',
  targetAudience: 'Startup founders',
  description: 'AI business consultant',
  goals: 'Acquire 100 customers',
  challenges: 'Customer acquisition',
  logoUrl: null,
  website: null,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMemories = [
  {
    id: 'mem-1',
    businessId: 'biz-1',
    type: 'BUSINESS_FACT' as const,
    content: 'Founder targets SaaS companies with 10-50 employees',
    importance: 8,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockPrisma = {
  business: {
    findUniqueOrThrow: jest.fn().mockResolvedValue(mockBusiness),
  },
  businessMemory: {
    findMany: jest.fn().mockResolvedValue(mockMemories),
  },
  message: {
    findMany: jest.fn().mockResolvedValue([]),
  },
};

describe('BusinessContextService', () => {
  let service: BusinessContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessContextService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BusinessContextService>(BusinessContextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildContext', () => {
    it('should return business, memories, and context block', async () => {
      const result = await service.buildContext('biz-1');

      expect(result.business).toEqual(mockBusiness);
      expect(result.memories).toEqual(mockMemories);
      expect(result.contextBlock).toContain('Lumiqs AI');
      expect(result.contextBlock).toContain('AI SaaS');
      expect(result.contextBlock).toContain('MVP');
    });

    it('should include memory in context block', async () => {
      const result = await service.buildContext('biz-1');
      expect(result.contextBlock).toContain('Business Memory');
      expect(result.contextBlock).toContain('Founder targets SaaS companies');
    });

    it('should load conversation messages when conversationId provided', async () => {
      mockPrisma.message.findMany.mockResolvedValueOnce([
        { id: 'msg-1', conversationId: 'conv-1', role: 'USER', content: 'Hello', createdAt: new Date() },
      ]);

      const result = await service.buildContext('biz-1', 'conv-1');
      expect(result.recentMessages).toHaveLength(1);
      expect(mockPrisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { conversationId: 'conv-1' } }),
      );
    });

    it('should return empty messages when no conversationId', async () => {
      const result = await service.buildContext('biz-1');
      expect(result.recentMessages).toHaveLength(0);
    });
  });
});
