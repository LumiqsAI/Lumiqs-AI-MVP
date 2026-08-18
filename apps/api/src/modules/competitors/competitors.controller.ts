import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { CompetitorsService } from './competitors.service';
import { AnalyzeCompetitorDto } from './competitors.dto';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('businesses/:businessId/competitors')
@UseGuards(ClerkAuthGuard, BusinessOwnerGuard)
export class CompetitorsController {
  constructor(private readonly service: CompetitorsService) {}

  @Get()
  list(@Param('businessId') businessId: string) {
    return this.service.listCompetitors(businessId);
  }

  @Post('analyze')
  analyze(
    @Param('businessId') businessId: string,
    @CurrentUser() user: User,
    @Body() dto: AnalyzeCompetitorDto,
  ) {
    return this.service.analyze(businessId, user.id, dto);
  }
}

