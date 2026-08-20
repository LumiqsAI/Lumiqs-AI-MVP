import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Business, BusinessDocument } from './business.schema';
import { CreateBusinessDto, UpdateBusinessDto } from './businesses.dto';
import { PlanLimitsService } from '../plans/plan-limits.service';
import { UserPlan } from '../users/user.schema';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectModel(Business.name) private readonly businessModel: Model<BusinessDocument>,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async create(ownerId: string, dto: CreateBusinessDto, userPlan: UserPlan) {
    this.assertCompleteProfile(dto);
    const limits = this.planLimits.getLimits(userPlan);
    if (!this.planLimits.isUnlimited(limits.maxBusinesses)) {
      const count = await this.businessModel.countDocuments({
        ownerId: new Types.ObjectId(ownerId),
        isDeleted: false,
      });
      if (count >= limits.maxBusinesses) {
        throw new ForbiddenException(
          `Your ${userPlan} plan allows up to ${limits.maxBusinesses} business workspace(s). Upgrade to create more.`,
        );
      }
    }
    return this.businessModel.create({ ...dto, ownerId: new Types.ObjectId(ownerId) });
  }

  async findAllByUser(ownerId: string) {
    return this.businessModel
      .find({ ownerId: new Types.ObjectId(ownerId), isDeleted: false })
      .sort({ updatedAt: -1 })
      .lean();
  }

  async findOne(id: string, ownerId: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Business not found');
    const business = await this.businessModel.findOne({ _id: id, isDeleted: false }).lean();
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId.toString() !== ownerId) throw new ForbiddenException('Access denied');
    return business;
  }

  async update(id: string, ownerId: string, dto: UpdateBusinessDto) {
    const business = await this.findOne(id, ownerId);
    this.assertCompleteProfile({ ...business, ...dto });
    return this.businessModel.findByIdAndUpdate(id, { $set: dto }, { new: true }).lean();
  }

  private assertCompleteProfile(profile: Partial<CreateBusinessDto>): void {
    const requiredFields: Array<[keyof CreateBusinessDto, string]> = [
      ['name', 'business name'], ['website', 'website'], ['industry', 'industry'],
      ['country', 'target region or country'], ['teamSize', 'team size'], ['revenueModel', 'business model'],
      ['targetAudience', 'target customers'], ['description', 'business description'], ['goals', 'main goal'],
      ['challenges', 'biggest challenges'],
    ];
    const missing = requiredFields
      .filter(([key]) => typeof profile[key] !== 'string' || !profile[key]?.trim())
      .map(([, label]) => label);
    if (missing.length > 0) {
      throw new BadRequestException(`Complete all required business details. Missing: ${missing.join(', ')}.`);
    }
  }

  async remove(id: string, ownerId: string) {
    await this.findOne(id, ownerId);
    return this.businessModel.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true }).lean();
  }

  async uploadLogo(id: string, ownerId: string, logoUrl: string) {
    await this.findOne(id, ownerId);
    return this.businessModel.findByIdAndUpdate(id, { $set: { logoUrl } }, { new: true }).lean();
  }
}
