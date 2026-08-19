import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto, UpdateBusinessDto } from './businesses.dto';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/user.schema';

@Controller('businesses')
@UseGuards(ClerkAuthGuard)
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  create(@CurrentUser() user: UserDocument, @Body() dto: CreateBusinessDto) {
    return this.businessesService.create(user._id.toString(), dto, user.plan);
  }

  @Get()
  findAll(@CurrentUser() user: UserDocument) {
    return this.businessesService.findAllByUser(user._id.toString());
  }

  @Get(':id')
  @UseGuards(BusinessOwnerGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.businessesService.findOne(id, user._id.toString());
  }

  @Patch(':id')
  @UseGuards(BusinessOwnerGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessesService.update(id, user._id.toString(), dto);
  }

  @Delete(':id')
  @UseGuards(BusinessOwnerGuard)
  remove(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.businessesService.remove(id, user._id.toString());
  }
}

