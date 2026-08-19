import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserPlan, UserRole } from '../users/user.schema';
import { Business, BusinessDocument } from '../businesses/business.schema';
import { Report, ReportDocument } from '../reports/report.schema';
import { PlanLimitsService } from '../plans/plan-limits.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Business.name) private readonly businessModel: Model<BusinessDocument>,
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async listUsers(page = 1, limit = 20, search?: string) {
    const query = search
      ? { $or: [{ email: new RegExp(search, 'i') }, { name: new RegExp(search, 'i') }] }
      : {};
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.userModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.userModel.countDocuments(query),
    ]);
    return { items, total, page, limit, hasMore: skip + items.length < total };
  }

  async getUser(id: string): Promise<object> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('User not found');
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('User not found');
    const limits = this.planLimits.getLimits(user.plan);
    const [businessCount, reportCount] = await Promise.all([
      this.businessModel.countDocuments({ ownerId: new Types.ObjectId(id), isDeleted: false }),
      this.reportModel.countDocuments({ userId: new Types.ObjectId(id), isDeleted: false }),
    ]);
    return { ...user, limits, stats: { businessCount, reportCount } };
  }

  async updateUserPlan(id: string, plan: UserPlan): Promise<object> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('User not found');
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: { plan } },
      { new: true },
    ).lean();
    if (!user) throw new NotFoundException('User not found');
    return { ...user, limits: this.planLimits.getLimits(user.plan) };
  }

  async updateUserRole(id: string, role: UserRole) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('User not found');
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true },
    ).lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getPlatformStats() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      newUsersThisMonth,
      totalBusinesses,
      totalReports,
      reportsThisMonth,
      planBreakdown,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      this.businessModel.countDocuments({ isDeleted: false }),
      this.reportModel.countDocuments({ isDeleted: false }),
      this.reportModel.countDocuments({ createdAt: { $gte: startOfMonth }, isDeleted: false }),
      this.userModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$plan', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      totalUsers,
      newUsersThisMonth,
      totalBusinesses,
      totalReports,
      reportsThisMonth,
      planBreakdown: planBreakdown.reduce<Record<string, number>>((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
    };
  }
}
