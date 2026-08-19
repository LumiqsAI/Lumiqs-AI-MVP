import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PlansModule } from '../plans/plans.module';
import { User, UserSchema } from '../users/user.schema';
import { Business, BusinessSchema } from '../businesses/business.schema';
import { Report, ReportSchema } from '../reports/report.schema';

@Module({
  imports: [
    PlansModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Report.name, schema: ReportSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
