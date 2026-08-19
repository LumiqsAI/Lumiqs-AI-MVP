import {
  Controller, Get, Patch, Param, Body, Query, UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { UserPlan, UserRole } from '../users/user.schema';

@Controller('admin')
@UseGuards(ClerkAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('users')
  listUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.listUsers(page, limit, search);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string): Promise<object> {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id/plan')
  updatePlan(@Param('id') id: string, @Body('plan') plan: UserPlan): Promise<object> {
    return this.adminService.updateUserPlan(id, plan);
  }

  @Patch('users/:id/role')
  updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.adminService.updateUserRole(id, role);
  }
}
