import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createClerkClient } from '@clerk/backend';
import { User, UserDocument } from '../users/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async syncUser(clerkId: string) {
    const clerkUser = await this.clerk.users.getUser(clerkId);
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || undefined;
    return this.userModel.findOneAndUpdate(
      { authProviderId: clerkId },
      {
        $set: {
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name,
          avatarUrl: clerkUser.imageUrl || undefined,
        },
        $setOnInsert: { authProviderId: clerkId },
      },
      { upsert: true, new: true },
    );
  }

  async handleWebhook(event: { type: string; data: { id: string } }) {
    this.logger.log(`Clerk webhook: ${event.type}`);
    if (event.type === 'user.created' || event.type === 'user.updated') {
      await this.syncUser(event.data.id);
    }
  }
}
