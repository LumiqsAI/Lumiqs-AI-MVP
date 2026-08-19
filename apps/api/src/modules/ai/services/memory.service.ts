import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BusinessMemory, BusinessMemoryDocument, MemoryType } from '../../memory/business-memory.schema';

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(
    @InjectModel(BusinessMemory.name) private readonly memoryModel: Model<BusinessMemoryDocument>,
  ) {}

  async getRelevantMemory(businessId: string): Promise<string[]> {
    const memories = await this.memoryModel
      .find({ businessId: new Types.ObjectId(businessId), isActive: true })
      .sort({ importance: -1 })
      .limit(10)
      .lean();
    return memories.map((m) => `[${m.type}] ${m.value}`);
  }

  async saveMemory(businessId: string, type: MemoryType, key: string, value: string, importance = 5) {
    return this.memoryModel.create({
      businessId: new Types.ObjectId(businessId),
      type,
      key,
      value,
      importance,
    });
  }

  async extractAndSaveMemories(businessId: string, aiResponse: string) {
    const decisionPatterns = [
      /(?:recommend|suggest|should|must|priority).*?[.!]/gi,
    ];

    for (const pattern of decisionPatterns) {
      const matches = aiResponse.match(pattern);
      if (matches && matches.length > 0) {
        const topMatch = matches[0].substring(0, 500);
        await this.saveMemory(businessId, MemoryType.RECOMMENDATION, 'ai_recommendation', topMatch, 4);
        break;
      }
    }
  }

  async listMemories(businessId: string) {
    return this.memoryModel
      .find({ businessId: new Types.ObjectId(businessId), isActive: true })
      .sort({ importance: -1 })
      .lean();
  }

  async deleteMemory(id: string, businessId: string) {
    if (!Types.ObjectId.isValid(id)) return;
    return this.memoryModel.findOneAndUpdate(
      { _id: id, businessId: new Types.ObjectId(businessId) },
      { $set: { isActive: false } },
    );
  }
}
