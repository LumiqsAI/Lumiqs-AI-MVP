import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Business, BusinessDocument } from '../../modules/businesses/business.schema';

@Injectable()
export class BusinessOwnerGuard implements CanActivate {
  constructor(
    @InjectModel(Business.name) private readonly businessModel: Model<BusinessDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const businessId = request.params.businessId || request.params.id;

    if (!businessId) return true;
    if (!Types.ObjectId.isValid(businessId)) throw new NotFoundException('Business not found');

    const business = await this.businessModel
      .findOne({ _id: businessId, isDeleted: false })
      .lean();

    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId.toString() !== user._id.toString()) throw new ForbiddenException('Access denied');

    request.business = business;
    return true;
  }
}
