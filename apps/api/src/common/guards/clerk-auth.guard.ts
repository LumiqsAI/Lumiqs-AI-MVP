import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  private readonly clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization token');
    }

    const token = authHeader.substring(7);

    try {
      // authenticateRequest handles both session tokens and JWTs correctly
      const requestState = await this.clerk.authenticateRequest(
        new Request(`http://localhost${request.url}`, {
          method: request.method,
          headers: { authorization: `Bearer ${token}` },
        }),
        {
          secretKey: process.env.CLERK_SECRET_KEY,
          publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
          authorizedParties: [
            'http://localhost:3000',
            process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          ],
        },
      );

      if (!requestState.isSignedIn) {
        throw new UnauthorizedException('Not signed in');
      }

      const clerkId = requestState.toAuth().userId;
      if (!clerkId) throw new UnauthorizedException('No user ID in token');

      let user = await this.prisma.user.findUnique({ where: { clerkId } });

      if (!user) {
        const clerkUser = await this.clerk.users.getUser(clerkId);
        user = await this.prisma.user.create({
          data: {
            clerkId,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: clerkUser.firstName || undefined,
            lastName: clerkUser.lastName || undefined,
            avatarUrl: clerkUser.imageUrl || undefined,
          },
        });
      }

      request.user = user;
      return true;
    } catch (error) {
      this.logger.warn(`Auth failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
