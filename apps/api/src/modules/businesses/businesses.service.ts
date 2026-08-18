import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBusinessDto, UpdateBusinessDto } from './businesses.dto';

@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBusinessDto) {
    return this.prisma.business.create({
      data: { ...dto, userId },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.business.findMany({
      where: { userId, isDeleted: false },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const business = await this.prisma.business.findFirst({
      where: { id, isDeleted: false },
    });
    if (!business) throw new NotFoundException('Business not found');
    if (business.userId !== userId) throw new ForbiddenException('Access denied');
    return business;
  }

  async update(id: string, userId: string, dto: UpdateBusinessDto) {
    await this.findOne(id, userId);
    return this.prisma.business.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.business.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async uploadLogo(id: string, userId: string, logoUrl: string) {
    await this.findOne(id, userId);
    return this.prisma.business.update({ where: { id }, data: { logoUrl } });
  }
}
