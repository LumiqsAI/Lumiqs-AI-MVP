import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { CreateInsightDto } from './insights.dto';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller()
@UseGuards(ClerkAuthGuard)
export class InsightsController {
  constructor(private readonly service: InsightsService) {}

  @Post('businesses/:businessId/insights')
  @UseGuards(BusinessOwnerGuard)
  create(
    @Param('businessId') businessId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateInsightDto,
  ) {
    return this.service.create(businessId, user.id, dto);
  }

  @Get('businesses/:businessId/insights')
  @UseGuards(BusinessOwnerGuard)
  findAll(@Param('businessId') businessId: string, @CurrentUser() user: User) {
    return this.service.findAll(businessId, user.id);
  }

  @Delete('insights/:id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.remove(id, user.id);
  }
}

