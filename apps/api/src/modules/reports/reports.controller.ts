import { Controller, Get, Post, Delete, Param, UseGuards, Res, Query, ForbiddenException } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { PdfService } from './pdf/pdf.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Business, BusinessDocument } from '../businesses/business.schema';
import { PlanLimitsService } from '../plans/plan-limits.service';

@Controller()
@UseGuards(ClerkAuthGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly pdfService: PdfService,
    private readonly planLimits: PlanLimitsService,
    @InjectModel(Business.name) private readonly businessModel: Model<BusinessDocument>,
  ) {}

  @Get('businesses/:businessId/reports')
  @UseGuards(BusinessOwnerGuard)
  findAll(
    @Param('businessId') businessId: string,
    @CurrentUser() user: UserDocument,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.reportsService.findAll(businessId, user._id.toString(), +page, +limit);
  }

  @Get('reports/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.reportsService.findOne(id, user._id.toString());
  }

  @Delete('reports/:id')
  remove(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.reportsService.remove(id, user._id.toString());
  }

  @Post('reports/:id/share')
  share(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.reportsService.share(id, user._id.toString());
  }

  @Post('reports/:id/unshare')
  unshare(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.reportsService.unshare(id, user._id.toString());
  }

  // Public — no auth guard — accessible via share token
  @Get('reports/shared/:token')
  findShared(@Param('token') token: string) {
    return this.reportsService.findByShareToken(token);
  }

  @Get('reports/:id/pdf')
  async downloadPdf(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Res({ passthrough: false }) res: Response,
  ) {
    const limits = this.planLimits.getLimits(user.plan);
    if (!limits.canExportPdf) {
      throw new ForbiddenException(
        `Your ${user.plan} plan does not include PDF Export. Upgrade to unlock this feature.`,
      );
    }
    const report = await this.reportsService.findOne(id, user._id.toString());
    const business = await this.businessModel.findById(report.businessId).lean();
    const pdf = await this.pdfService.generateReportPdf(report, business?.name || 'Business');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/\s+/g, '-')}.pdf"`);
    res.setHeader('Content-Length', pdf.length);
    res.end(pdf);
  }
}
