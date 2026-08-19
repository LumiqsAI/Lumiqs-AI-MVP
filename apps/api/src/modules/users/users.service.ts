import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { Business, BusinessDocument } from '../businesses/business.schema';
import { Report, ReportDocument } from '../reports/report.schema';
import { Conversation, ConversationDocument } from '../conversations/conversation.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Business.name) private readonly businessModel: Model<BusinessDocument>,
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    @InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async findById(id: string) {
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, data: { name?: string; avatarUrl?: string }) {
    return this.userModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
  }

  async getDashboardData(userId: string): Promise<Record<string, unknown>> {
    const oid = new Types.ObjectId(userId);

    const [businesses, recentReports, recentConversations] = await Promise.all([
      this.businessModel.find({ ownerId: oid, isDeleted: false }).sort({ updatedAt: -1 }).limit(5).lean(),
      this.reportModel.find({ userId: oid, isDeleted: false }).sort({ createdAt: -1 }).limit(5).lean(),
      this.conversationModel.find({ userId: oid, isDeleted: false }).sort({ updatedAt: -1 }).limit(5).lean(),
    ]);

    // Populate business names
    const businessMap = new Map(businesses.map((b) => [b._id.toString(), b.name]));

    // Collect any businessIds not already in the map
    const missingIds = [
      ...new Set([
        ...recentReports.map((r) => r.businessId.toString()),
        ...recentConversations.map((c) => c.businessId.toString()),
      ]),
    ].filter((id) => !businessMap.has(id));

    if (missingIds.length) {
      const extra = await this.businessModel
        .find({ _id: { $in: missingIds.map((id) => new Types.ObjectId(id)) } })
        .select('name')
        .lean();
      extra.forEach((b) => businessMap.set(b._id.toString(), b.name));
    }

    return {
      businesses,
      recentReports: recentReports.map((r) => ({
        ...r,
        business: { name: businessMap.get(r.businessId.toString()) || 'Unknown' },
      })),
      recentConversations: recentConversations.map((c) => ({
        ...c,
        business: { name: businessMap.get(c.businessId.toString()) || 'Unknown' },
      })),
    };
  }
}
