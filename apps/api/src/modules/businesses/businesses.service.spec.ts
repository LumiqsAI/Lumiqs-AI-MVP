import { Test, TestingModule } from '@nestjs/testing';
import { BusinessesService } from './businesses.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { BusinessStage } from '@prisma/client';

const mockBusiness = {
  id: 'biz-1',
  userId: 'user-1',
  name: 'Test Business',
  industry: 'SaaS',
  stage: BusinessStage.MVP,
  country: 'US',
  teamSize: '1-5',
  revenueModel: 'Subscription',
  targetAudience: 'Founders',
  description: 'Test',
  goals: 'Grow',
  challenges: 'Acquisition',
  logoUrl: null,
  website: null,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  business: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

describe('BusinessesService', () => {
  let service: BusinessesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BusinessesService>(BusinessesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a business for the authenticated user', async () => {
      mockPrisma.business.create.mockResolvedValue(mockBusiness);
      const result = await service.create('user-1', { name: 'Test Business' });
      expect(result).toEqual(mockBusiness);
      expect(mockPrisma.business.create).toHaveBeenCalledWith({
        data: { name: 'Test Business', userId: 'user-1' },
      });
    });
  });

  describe('findAllByUser', () => {
    it('should return only businesses belonging to the user', async () => {
      mockPrisma.business.findMany.mockResolvedValue([mockBusiness]);
      const result = await service.findAllByUser('user-1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.business.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1', isDeleted: false } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return business when user owns it', async () => {
      mockPrisma.business.findFirst.mockResolvedValue(mockBusiness);
      const result = await service.findOne('biz-1', 'user-1');
      expect(result).toEqual(mockBusiness);
    });

    it('should throw NotFoundException when business does not exist', async () => {
      mockPrisma.business.findFirst.mockResolvedValue(null);
      await expect(service.findOne('biz-999', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own business', async () => {
      mockPrisma.business.findFirst.mockResolvedValue({ ...mockBusiness, userId: 'other-user' });
      await expect(service.findOne('biz-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should soft-delete the business', async () => {
      mockPrisma.business.findFirst.mockResolvedValue(mockBusiness);
      mockPrisma.business.update.mockResolvedValue({ ...mockBusiness, isDeleted: true });

      await service.remove('biz-1', 'user-1');
      expect(mockPrisma.business.update).toHaveBeenCalledWith({
        where: { id: 'biz-1' },
        data: { isDeleted: true },
      });
    });
  });
});
