import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string, userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.report.findMany({
        where: { businessId, userId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, type: true, status: true, title: true,
          summary: true, createdAt: true, updatedAt: true,
        },
      }),
      this.prisma.report.count({ where: { businessId, userId, isDeleted: false } }),
    ]);
    return { items, total, page, limit, hasMore: skip + items.length < total };
  }

  async findOne(id: string, userId: string) {
    const report = await this.prisma.report.findFirst({
      where: { id, isDeleted: false },
    });
    if (!report) throw new NotFoundException('Report not found');
    if (report.userId !== userId) throw new ForbiddenException('Access denied');
    return report;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.report.update({ where: { id }, data: { isDeleted: true } });
  }
}
