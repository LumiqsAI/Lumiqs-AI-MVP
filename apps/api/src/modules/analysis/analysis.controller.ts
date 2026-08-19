import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/user.schema';

@Controller('businesses/:businessId/analysis')
@UseGuards(ClerkAuthGuard, BusinessOwnerGuard)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  generate(@Param('businessId') businessId: string, @CurrentUser() user: UserDocument) {
    return this.analysisService.generateAnalysis(businessId, user._id.toString());
  }
}

