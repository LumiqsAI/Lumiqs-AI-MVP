import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { MarketResearchService } from './market-research.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('businesses/:businessId/market-research')
@UseGuards(ClerkAuthGuard, BusinessOwnerGuard)
export class MarketResearchController {
  constructor(private readonly service: MarketResearchService) {}

  @Post()
  generate(@Param('businessId') businessId: string, @CurrentUser() user: User) {
    return this.service.generate(businessId, user.id);
  }
}

