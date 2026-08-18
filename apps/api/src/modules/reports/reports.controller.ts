import {
  Controller, Get, Delete, Param, UseGuards, Res, Query,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { PdfService } from './pdf/pdf.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import type { User } from '@prisma/client';

@Controller()
@UseGuards(ClerkAuthGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly pdfService: PdfService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('businesses/:businessId/reports')
  @UseGuards(BusinessOwnerGuard)
  findAll(
    @Param('businessId') businessId: string,
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.reportsService.findAll(businessId, user.id, +page, +limit);
  }

  @Get('reports/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reportsService.findOne(id, user.id);
  }

  @Delete('reports/:id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reportsService.remove(id, user.id);
  }

  @Get('reports/:id/pdf')
  async downloadPdf(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const report = await this.reportsService.findOne(id, user.id);
    const business = await this.prisma.business.findUnique({ where: { id: report.businessId } });
    const pdf = await this.pdfService.generateReportPdf(report, business?.name || 'Business');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/\s+/g, '-')}.pdf"`);
    res.setHeader('Content-Length', pdf.length);
    res.end(pdf);
  }
}

