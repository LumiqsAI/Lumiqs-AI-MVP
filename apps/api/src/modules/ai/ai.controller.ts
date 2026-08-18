import { Controller, Post, Body, Param, UseGuards, Res, HttpCode } from '@nestjs/common';
import type { Response } from 'express';
import { AIOrchestrator } from './services/ai-orchestrator.service';
import { ChatDto } from './ai.dto';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';

@Controller('businesses/:businessId/ai')
@UseGuards(ClerkAuthGuard, BusinessOwnerGuard)
export class AIController {
  constructor(private readonly orchestrator: AIOrchestrator) {}

  @Post('chat')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  async chat(
    @Param('businessId') businessId: string,
    @CurrentUser() user: User,
    @Body() dto: ChatDto,
    @Res() res: Response,
  ) {
    await this.orchestrator.chat(
      user.id,
      businessId,
      dto.message,
      dto.conversationId,
      res,
    );
  }
}
