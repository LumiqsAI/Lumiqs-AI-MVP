import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createClerkClient } from '@clerk/backend';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  constructor(private readonly prisma: PrismaService) {}

  async syncUser(clerkId: string) {
    const clerkUser = await this.clerk.users.getUser(clerkId);
    return this.prisma.user.upsert({
      where: { clerkId },
      update: {
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        avatarUrl: clerkUser.imageUrl || undefined,
      },
      create: {
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        avatarUrl: clerkUser.imageUrl || undefined,
      },
    });
  }

  async handleWebhook(event: { type: string; data: { id: string } }) {
    this.logger.log(`Clerk webhook: ${event.type}`);
    if (event.type === 'user.created' || event.type === 'user.updated') {
      await this.syncUser(event.data.id);
    }
    if (event.type === 'user.deleted') {
      await this.prisma.user.updateMany({
        where: { clerkId: event.data.id },
        data: {},
      });
    }
  }
}
