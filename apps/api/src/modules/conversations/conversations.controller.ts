import { Controller, Get, Delete, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/user.schema';

@Controller('businesses/:businessId/conversations')
@UseGuards(ClerkAuthGuard, BusinessOwnerGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  findAll(
    @Param('businessId') businessId: string,
    @CurrentUser() user: UserDocument,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.conversationsService.findAll(businessId, user._id.toString(), +page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: UserDocument): Promise<Record<string, unknown>> {
    return this.conversationsService.findOne(id, user._id.toString());
  }

  @Patch(':id/title')
  updateTitle(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body('title') title: string,
  ) {
    return this.conversationsService.updateTitle(id, user._id.toString(), title);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.conversationsService.delete(id, user._id.toString());
  }
}

