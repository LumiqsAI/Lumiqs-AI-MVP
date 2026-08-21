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

import {
  User,
  UserDocument,
  UserRole,
} from '../../modules/users/user.schema';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  private readonly clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  });

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // ---------------------------------------------------------
      // 1. Get Clerk Bearer token
      // ---------------------------------------------------------
      const authHeader = request.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedException(
          'Missing authorization token',
        );
      }

      const token = authHeader.substring(7).trim();

      if (!token) {
        throw new UnauthorizedException(
          'Empty authorization token',
        );
      }

      // ---------------------------------------------------------
      // 2. Preserve the REAL incoming request headers
      // ---------------------------------------------------------
      const headers = new Headers();

      for (const [key, value] of Object.entries(request.headers)) {
        if (value === undefined || value === null) {
          continue;
        }

        headers.set(
          key,
          Array.isArray(value)
            ? value.join(', ')
            : String(value),
        );
      }

      // Make absolutely sure Authorization is present
      headers.set('authorization', `Bearer ${token}`);

      // ---------------------------------------------------------
      // 3. Build the actual request URL
      // ---------------------------------------------------------
      const forwardedProto = request.headers['x-forwarded-proto'];

      const protocol =
        typeof forwardedProto === 'string'
          ? forwardedProto.split(',')[0].trim()
          : request.protocol || 'https';

      const forwardedHost = request.headers['x-forwarded-host'];

      const host =
        typeof forwardedHost === 'string'
          ? forwardedHost.split(',')[0].trim()
          : request.get('host');

      if (!host) {
        throw new UnauthorizedException(
          'Unable to determine request host',
        );
      }

      const requestUrl = `${protocol}://${host}${
        request.originalUrl || request.url
      }`;

      const clerkRequest = new Request(requestUrl, {
        method: request.method,
        headers,
      });

      // ---------------------------------------------------------
      // 4. Authenticate Clerk session
      // ---------------------------------------------------------
      const authorizedParties = [
        'https://lumiqs.in',
        'https://www.lumiqs.in',
      ];

      // Add additional configured origins if present
      if (process.env.CORS_ORIGIN) {
        const additionalOrigins = process.env.CORS_ORIGIN
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean);

        for (const origin of additionalOrigins) {
          if (!authorizedParties.includes(origin)) {
            authorizedParties.push(origin);
          }
        }
      }

      const requestState =
        await this.clerk.authenticateRequest(clerkRequest, {
          secretKey: process.env.CLERK_SECRET_KEY,
          publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
          authorizedParties,
        });

      // ---------------------------------------------------------
      // 5. Make sure user is signed in
      // ---------------------------------------------------------
      if (!requestState.isSignedIn) {
        throw new UnauthorizedException('Not signed in');
      }

      const auth = requestState.toAuth();
      const clerkId = auth.userId;

      if (!clerkId) {
        throw new UnauthorizedException(
          'No user ID in token',
        );
      }

      // ---------------------------------------------------------
      // 6. Find user in MongoDB
      // ---------------------------------------------------------
      let user = await this.userModel.findOne({
        authProviderId: clerkId,
      });

      // ---------------------------------------------------------
      // 7. Create user if this is their first API request
      // ---------------------------------------------------------
      if (!user) {
        const clerkUser = await this.clerk.users.getUser(clerkId);

        const email =
          clerkUser.emailAddresses[0]?.emailAddress || '';

        const adminEmail =
          process.env.ADMIN_EMAIL?.toLowerCase();

        const role =
          adminEmail &&
          email.toLowerCase() === adminEmail
            ? UserRole.ADMIN
            : UserRole.USER;

        user = await this.userModel.create({
          authProviderId: clerkId,
          email,
          name:
            [
              clerkUser.firstName,
              clerkUser.lastName,
            ]
              .filter(Boolean)
              .join(' ') || undefined,
          avatarUrl: clerkUser.imageUrl || undefined,
          role,
        });
      }

      // ---------------------------------------------------------
      // 8. Update existing user's role if necessary
      // ---------------------------------------------------------
      else {
        const adminEmail =
          process.env.ADMIN_EMAIL?.toLowerCase();

        const role =
          adminEmail &&
          user.email.toLowerCase() === adminEmail
            ? UserRole.ADMIN
            : UserRole.USER;

        if (user.role !== role) {
          user =
            (await this.userModel.findByIdAndUpdate(
              user._id,
              {
                $set: { role },
              },
              {
                new: true,
              },
            )) ?? user;
        }
      }

      // ---------------------------------------------------------
      // 9. Attach authenticated user to request
      // ---------------------------------------------------------
      request.user = user;

      return true;
    } catch (error) {
      this.logger.error(
        `Clerk authentication failed: ${
          error instanceof Error
            ? error.stack || error.message
            : String(error)
        }`,
      );

      throw new UnauthorizedException(
        'Invalid or expired token',
      );
    }
  }
}