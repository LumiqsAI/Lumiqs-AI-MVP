import { Test, TestingModule } from '@nestjs/testing';
import { MemoryService } from './memory.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { MemoryType } from '@prisma/client';

const mockPrisma = {
  businessMemory: {
    findMany: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  },
};

describe('MemoryService', () => {
  let service: MemoryService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MemoryService>(MemoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRelevantMemory', () => {
    it('should return formatted memory strings', async () => {
      mockPrisma.businessMemory.findMany.mockResolvedValue([
        { id: '1', type: MemoryType.BUSINESS_FACT, content: 'Test fact', importance: 8, businessId: 'biz-1', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ]);

      const result = await service.getRelevantMemory('biz-1');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('[BUSINESS_FACT] Test fact');
    });

    it('should return empty array when no memories', async () => {
      mockPrisma.businessMemory.findMany.mockResolvedValue([]);
      const result = await service.getRelevantMemory('biz-1');
      expect(result).toHaveLength(0);
    });
  });

  describe('saveMemory', () => {
    it('should create a memory record', async () => {
      const mockMemory = { id: '1', businessId: 'biz-1', type: MemoryType.RECOMMENDATION, content: 'Test', importance: 5 };
      mockPrisma.businessMemory.create.mockResolvedValue(mockMemory);

      const result = await service.saveMemory('biz-1', MemoryType.RECOMMENDATION, 'Test', 5);
      expect(result).toEqual(mockMemory);
      expect(mockPrisma.businessMemory.create).toHaveBeenCalledWith({
        data: { businessId: 'biz-1', type: MemoryType.RECOMMENDATION, content: 'Test', importance: 5 },
      });
    });
  });

  describe('extractAndSaveMemories', () => {
    it('should extract and save recommendation from AI response', async () => {
      mockPrisma.businessMemory.create.mockResolvedValue({});
      const aiResponse = 'I recommend you focus on content marketing to acquire customers.';

      await service.extractAndSaveMemories('biz-1', aiResponse);
      expect(mockPrisma.businessMemory.create).toHaveBeenCalled();
    });

    it('should not save memory when no patterns match', async () => {
      const aiResponse = 'The market is large and growing.';
      await service.extractAndSaveMemories('biz-1', aiResponse);
      expect(mockPrisma.businessMemory.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteMemory', () => {
    it('should soft-delete memory by setting isActive to false', async () => {
      mockPrisma.businessMemory.updateMany.mockResolvedValue({ count: 1 });
      await service.deleteMemory('mem-1', 'biz-1');
      expect(mockPrisma.businessMemory.updateMany).toHaveBeenCalledWith({
        where: { id: 'mem-1', businessId: 'biz-1' },
        data: { isActive: false },
      });
    });
  });
});
