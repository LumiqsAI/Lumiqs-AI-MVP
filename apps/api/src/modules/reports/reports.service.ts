import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { Report, ReportDocument } from './report.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
  ) {}

  async findAll(businessId: string, userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const query = {
      businessId: new Types.ObjectId(businessId),
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    };
    const [items, total] = await Promise.all([
      this.reportModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('type status title summary createdAt updatedAt')
        .lean(),
      this.reportModel.countDocuments(query),
    ]);
    return { items, total, page, limit, hasMore: skip + items.length < total };
  }

  async findOne(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Report not found');
    const report = await this.reportModel.findOne({ _id: id, isDeleted: false });
    if (!report) throw new NotFoundException('Report not found');
    if (report.userId.toString() !== userId) throw new ForbiddenException('Access denied');
    return report;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.reportModel.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true }).lean();
  }

  async share(id: string, userId: string) {
    await this.findOne(id, userId);
    const token = randomBytes(24).toString('hex');
    return this.reportModel.findByIdAndUpdate(
      id,
      { $set: { shareToken: token, isShared: true } },
      { new: true },
    ).lean();
  }

  async unshare(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.reportModel.findByIdAndUpdate(
      id,
      { $unset: { shareToken: '' }, $set: { isShared: false } },
      { new: true },
    ).lean();
  }

  async findByShareToken(token: string) {
    const report = await this.reportModel.findOne({ shareToken: token, isShared: true, isDeleted: false }).lean();
    if (!report) throw new NotFoundException('Shared report not found or link has been revoked');
    return report;
  }
}
