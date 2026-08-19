import { Controller, Post, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { UpdateTaskStatusDto } from './execution.dto';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PlanLimitGuard, SetPlanRequirement } from '../plans/plan-limit.guard';
import type { UserDocument } from '../users/user.schema';
import { TaskStatus } from './execution.schema';

@Controller('businesses/:businessId')
@UseGuards(ClerkAuthGuard, BusinessOwnerGuard)
export class ExecutionController {
  constructor(private readonly service: ExecutionService) {}

  @Post('execution-plan')
  @UseGuards(PlanLimitGuard)
  @SetPlanRequirement('execution')
  generate(@Param('businessId') businessId: string, @CurrentUser() user: UserDocument) {
    return this.service.generate(businessId, user._id.toString(), user.plan);
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

