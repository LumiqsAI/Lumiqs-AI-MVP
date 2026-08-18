import {
  Controller, Post, Param, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { BusinessesService } from '../businesses/businesses.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('businesses/:businessId/logo')
@UseGuards(ClerkAuthGuard, BusinessOwnerGuard)
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly businessesService: BusinessesService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadLogo(
    @Param('businessId') businessId: string,
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Only images allowed');

    const path = `logos/${businessId}/${Date.now()}-${file.originalname}`;
    const url = await this.storageService.uploadFile(path, file.buffer, file.mimetype);
    return this.businessesService.uploadLogo(businessId, user.id, url);
  }
}

