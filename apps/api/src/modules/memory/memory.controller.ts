import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { MemoryService } from '../ai/services/memory.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { BusinessOwnerGuard } from '../../common/guards/business-owner.guard';

@Controller('businesses/:businessId/memory')
@UseGuards(ClerkAuthGuard, BusinessOwnerGuard)
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Get()
  list(@Param('businessId') businessId: string) {
    return this.memoryService.listMemories(businessId);
  }

  @Delete(':id')
  remove(@Param('businessId') businessId: string, @Param('id') id: string) {
    return this.memoryService.deleteMemory(id, businessId);
  }
}
