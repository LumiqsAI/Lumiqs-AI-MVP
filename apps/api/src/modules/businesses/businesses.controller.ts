import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto, UpdateBusinessDto } from './businesses.dto';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('businesses')
@UseGuards(ClerkAuthGuard)
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateBusinessDto) {
    return this.businessesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.businessesService.findAllByUser(user.id);
  }

  @Get(':id')
  @UseGuards(BusinessOwnerGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.businessesService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseGuards(BusinessOwnerGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(BusinessOwnerGuard)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.businessesService.remove(id, user.id);
  }
}

