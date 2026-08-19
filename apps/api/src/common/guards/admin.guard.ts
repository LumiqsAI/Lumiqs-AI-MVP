import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../../modules/users/user.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user;
    if (user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
