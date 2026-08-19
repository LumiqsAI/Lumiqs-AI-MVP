import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { CreateInsightDto } from './insights.dto';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/user.schema';

@Controller()
@UseGuards(ClerkAuthGuard)
export class InsightsController {
  constructor(private readonly service: InsightsService) {}

  @Post('businesses/:businessId/insights')
  @UseGuards(BusinessOwnerGuard)
  create(
    @Param('businessId') businessId: string,
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateInsightDto,
  ) {
    return this.service.create(businessId, user._id.toString(), dto);
  }

  @Get('businesses/:businessId/insights')
  @UseGuards(BusinessOwnerGuard)
  findAll(@Param('businessId') businessId: string, @CurrentUser() user: UserDocument) {
    return this.service.findAll(businessId, user._id.toString());
  }

  @Delete('insights/:id')
  remove(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.service.remove(id, user._id.toString());
  }
}

