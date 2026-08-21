import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createClerkClient } from '@clerk/backend';
import { User, UserDocument, UserRole } from '../../modules/users/user.schema';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  private readonly clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

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
            'https://lumiqs.in',
            'https://www.lumiqs.in',
            ...(process.env.CORS_ORIGIN
              ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
              : []),
          ],
        },
      );

      if (!requestState.isSignedIn) {
        throw new UnauthorizedException('Not signed in');
      }

      const clerkId = requestState.toAuth().userId;
      if (!clerkId) throw new UnauthorizedException('No user ID in token');

      let user = await this.userModel.findOne({ authProviderId: clerkId });

      if (!user) {
        const clerkUser = await this.clerk.users.getUser(clerkId);
        const email = clerkUser.emailAddresses[0]?.emailAddress || '';
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
        const role = adminEmail && email.toLowerCase() === adminEmail ? UserRole.ADMIN : UserRole.USER;
        user = await this.userModel.create({
          authProviderId: clerkId,
          email,
          name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || undefined,
          avatarUrl: clerkUser.imageUrl || undefined,
          role,
        });
      } else {
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
        const role = adminEmail && user.email.toLowerCase() === adminEmail
          ? UserRole.ADMIN
          : UserRole.USER;

        if (user.role !== role) {
          user = await this.userModel.findByIdAndUpdate(
            user._id,
            { $set: { role } },
            { new: true },
          ) ?? user;
        }
      }

      request.user = user;
      return true;
    } catch (error) {
      this.logger.warn(`Auth failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
