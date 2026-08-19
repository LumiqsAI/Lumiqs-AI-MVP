import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { MarketResearchService } from './market-research.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PlanLimitGuard, SetPlanRequirement } from '../../plans/plan-limit.guard';
import type { UserDocument } from '../users/user.schema';

@Controller('businesses/:businessId/market-research')
@UseGuards(ClerkAuthGuard, BusinessOwnerGuard, PlanLimitGuard)
export class MarketResearchController {
  constructor(private readonly service: MarketResearchService) {}

  @Post()
  @SetPlanRequirement('marketResearch')
  generate(@Param('businessId') businessId: string, @CurrentUser() user: UserDocument) {
    return this.service.generate(businessId, user._id.toString(), user.plan);
  }
}
