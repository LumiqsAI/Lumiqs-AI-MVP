import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, data: { firstName?: string; lastName?: string; avatarUrl?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async getDashboardData(userId: string) {
    const [businesses, recentReports, recentConversations] = await Promise.all([
      this.prisma.business.findMany({
        where: { userId, isDeleted: false },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      this.prisma.report.findMany({
        where: { userId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { business: { select: { name: true } } },
      }),
      this.prisma.conversation.findMany({
        where: { userId, isDeleted: false },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          business: { select: { name: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
    ]);

    return { businesses, recentReports, recentConversations };
  }
}
