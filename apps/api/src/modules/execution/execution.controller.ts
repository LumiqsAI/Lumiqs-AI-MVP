import { Controller, Post, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { UpdateTaskStatusDto } from './execution.dto';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('businesses/:businessId')
@UseGuards(ClerkAuthGuard, BusinessOwnerGuard)
export class ExecutionController {
  constructor(private readonly service: ExecutionService) {}

  @Post('execution-plan')
  generate(@Param('businessId') businessId: string, @CurrentUser() user: User) {
    return this.service.generate(businessId, user.id);
  }

  @Get('execution-plan/:reportId/tasks')
  getTasks(
    @Param('businessId') businessId: string,
    @Param('reportId') reportId: string,
  ) {
    return this.service.getTasks(reportId, businessId);
  }

  @Patch('tasks/:taskId')
  updateTask(
    @Param('businessId') businessId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.service.updateTaskStatus(taskId, businessId, dto.status);
  }
}

