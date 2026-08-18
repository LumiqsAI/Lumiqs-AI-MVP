import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BusinessOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const businessId = request.params.businessId || request.params.id;

    if (!businessId) return true;

    const business = await this.prisma.business.findFirst({
      where: { id: businessId, isDeleted: false },
    });

    if (!business) throw new NotFoundException('Business not found');
    if (business.userId !== user.id) throw new ForbiddenException('Access denied');

    request.business = business;
    return true;
  }
}
