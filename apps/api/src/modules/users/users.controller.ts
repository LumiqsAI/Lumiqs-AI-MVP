import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from './user.schema';
import { PlanLimitsService } from '../plans/plan-limits.service';

@Controller('users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  @Get('me')
  getMe(@CurrentUser() user: UserDocument) {
    return user;
  }

  @Get('plan')
  getPlan(@CurrentUser() user: UserDocument) {
    const limits = this.planLimits.getLimits(user.plan);
    return { plan: user.plan, limits };
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: UserDocument): Promise<Record<string, unknown>> {
    return this.usersService.getDashboardData(user._id.toString());
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: UserDocument,
    @Body() body: { name?: string },
  ) {
    return this.usersService.updateProfile(user._id.toString(), body);
  }
}

