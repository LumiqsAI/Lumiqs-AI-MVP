import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './conversation.schema';
import { Message, MessageDocument, MessageRole } from './message.schema';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
  ) {}

  async findAll(businessId: string, userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter = {
      businessId: new Types.ObjectId(businessId),
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    };
    const [items, total] = await Promise.all([
      this.conversationModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      this.conversationModel.countDocuments(filter),
    ]);
    return { items, total, page, limit, hasMore: skip + items.length < total };
  }

  async findOne(id: string, userId: string): Promise<Record<string, unknown>> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Conversation not found');
    const conv = await this.conversationModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    }).lean();
    if (!conv) throw new NotFoundException('Conversation not found');
    const messages = await this.messageModel
      .find({ conversationId: new Types.ObjectId(id), role: { $ne: MessageRole.SYSTEM } })
      .sort({ createdAt: 1 })
      .lean();
    return { ...conv, messages };
  }

  async delete(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Conversation not found');
    const conv = await this.conversationModel.findOne({ _id: id, userId: new Types.ObjectId(userId) }).lean();
    if (!conv) throw new NotFoundException('Conversation not found');
    return this.conversationModel.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true }).lean();
  }

  async updateTitle(id: string, userId: string, title: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Conversation not found');
    const conv = await this.conversationModel.findOne({ _id: id, userId: new Types.ObjectId(userId) }).lean();
    if (!conv) throw new NotFoundException('Conversation not found');
    return this.conversationModel.findByIdAndUpdate(id, { $set: { title } }, { new: true }).lean();
  }
}
