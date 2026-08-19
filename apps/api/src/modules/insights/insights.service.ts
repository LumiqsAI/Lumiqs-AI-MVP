import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Insight, InsightDocument } from './insight.schema';
import { CreateInsightDto } from './insights.dto';
import { PlanLimitsService } from '../plans/plan-limits.service';
import { UserPlan } from '../users/user.schema';

@Injectable()
export class InsightsService {
  constructor(
    @InjectModel(Insight.name) private readonly insightModel: Model<InsightDocument>,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async create(businessId: string, userId: string, dto: CreateInsightDto, userPlan: UserPlan) {
    const limits = this.planLimits.getLimits(userPlan);
    if (!this.planLimits.isUnlimited(limits.maxInsightsPerBusiness)) {
      const count = await this.insightModel.countDocuments({
        businessId: new Types.ObjectId(businessId),
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      });
      if (count >= limits.maxInsightsPerBusiness) {
        throw new ForbiddenException(
          `Your ${userPlan} plan allows up to ${limits.maxInsightsPerBusiness} saved insights per workspace. Upgrade to save more.`,
        );
      }
    }
    return this.insightModel.create({
      ...dto,
      businessId: new Types.ObjectId(businessId),
      userId: new Types.ObjectId(userId),
    });
  }

  async findAll(businessId: string, userId: string) {
    return this.insightModel
      .find({ businessId: new Types.ObjectId(businessId), userId: new Types.ObjectId(userId), isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();
  }

  async remove(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Insight not found');
    const insight = await this.insightModel.findById(id).lean();
    if (!insight) throw new NotFoundException('Insight not found');
    if (insight.userId.toString() !== userId) throw new ForbiddenException('Access denied');
    return this.insightModel.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true }).lean();
  }
}
