import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { CompetitorsService } from './competitors.service';
import { AnalyzeCompetitorDto } from './competitors.dto';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PlanLimitGuard, SetPlanRequirement } from '../plans/plan-limit.guard';
import type { UserDocument } from '../users/user.schema';

@Controller('businesses/:businessId/competitors')
@UseGuards(ClerkAuthGuard, BusinessOwnerGuard)
export class CompetitorsController {
  constructor(private readonly service: CompetitorsService) {}

  @Get()
  list(@Param('businessId') businessId: string) {
    return this.service.listCompetitors(businessId);
  }

  @Post('analyze')
  @UseGuards(PlanLimitGuard)
  @SetPlanRequirement('competitors')
  analyze(
    @Param('businessId') businessId: string,
    @CurrentUser() user: UserDocument,
    @Body() dto: AnalyzeCompetitorDto,
  ) {
    return this.service.analyze(businessId, user._id.toString(), dto);
  }
}

