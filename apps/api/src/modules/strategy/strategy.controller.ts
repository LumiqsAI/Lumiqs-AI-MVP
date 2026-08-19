import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { StrategyService } from './strategy.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/user.schema';

@Controller('businesses/:businessId/strategy')
@UseGuards(ClerkAuthGuard, BusinessOwnerGuard)
export class StrategyController {
  constructor(private readonly service: StrategyService) {}

  @Post()
  generate(@Param('businessId') businessId: string, @CurrentUser() user: UserDocument) {
    return this.service.generate(businessId, user._id.toString());
  }
}

