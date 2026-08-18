import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('businesses/:businessId/analysis')
@UseGuards(ClerkAuthGuard, BusinessOwnerGuard)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  generate(@Param('businessId') businessId: string, @CurrentUser() user: User) {
    return this.analysisService.generateAnalysis(businessId, user.id);
  }
}

