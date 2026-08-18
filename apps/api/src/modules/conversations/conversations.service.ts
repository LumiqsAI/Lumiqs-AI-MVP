import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string, userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: { businessId, userId, isDeleted: false },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.conversation.count({ where: { businessId, userId, isDeleted: false } }),
    ]);
    return { items, total, page, limit, hasMore: skip + items.length < total };
  }

  async findOne(id: string, userId: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id, userId, isDeleted: false },
      include: {
        messages: {
          where: { role: { not: 'SYSTEM' } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  async delete(id: string, userId: string) {
    const conv = await this.prisma.conversation.findFirst({ where: { id, userId } });
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.userId !== userId) throw new ForbiddenException('Access denied');
    return this.prisma.conversation.update({ where: { id }, data: { isDeleted: true } });
  }

  async updateTitle(id: string, userId: string, title: string) {
    const conv = await this.prisma.conversation.findFirst({ where: { id, userId } });
    if (!conv) throw new NotFoundException('Conversation not found');
    return this.prisma.conversation.update({ where: { id }, data: { title } });
  }
}
