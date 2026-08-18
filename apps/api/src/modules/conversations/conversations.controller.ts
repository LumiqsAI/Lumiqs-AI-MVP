import { Controller, Get, Delete, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('businesses/:businessId/conversations')
@UseGuards(ClerkAuthGuard, BusinessOwnerGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  findAll(
    @Param('businessId') businessId: string,
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.conversationsService.findAll(businessId, user.id, +page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.conversationsService.findOne(id, user.id);
  }

  @Patch(':id/title')
  updateTitle(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('title') title: string,
  ) {
    return this.conversationsService.updateTitle(id, user.id, title);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.conversationsService.delete(id, user.id);
  }
}

