import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Insight, InsightDocument } from './insight.schema';
import { CreateInsightDto } from './insights.dto';

@Injectable()
export class InsightsService {
  constructor(
    @InjectModel(Insight.name) private readonly insightModel: Model<InsightDocument>,
  ) {}

  async create(businessId: string, userId: string, dto: CreateInsightDto) {
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
