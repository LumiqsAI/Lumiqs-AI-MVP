import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { User, UserSchema } from '../users/user.schema';
import { Business, BusinessSchema } from '../businesses/business.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Business.name, schema: BusinessSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, ClerkAuthGuard, BusinessOwnerGuard],
  exports: [AuthService, ClerkAuthGuard, BusinessOwnerGuard],
})
export class AuthModule {}
