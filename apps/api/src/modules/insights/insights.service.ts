import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInsightDto } from './insights.dto';

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(businessId: string, userId: string, dto: CreateInsightDto) {
    return this.prisma.insight.create({
      data: { ...dto, businessId, userId, tags: dto.tags || [] },
    });
  }

  async findAll(businessId: string, userId: string) {
    return this.prisma.insight.findMany({
      where: { businessId, userId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, userId: string) {
    const insight = await this.prisma.insight.findFirst({ where: { id } });
    if (!insight) throw new NotFoundException('Insight not found');
    if (insight.userId !== userId) throw new ForbiddenException('Access denied');
    return this.prisma.insight.update({ where: { id }, data: { isDeleted: true } });
  }
}
