import {
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { User, UserDocument, UserPlan } from '../users/user.schema';
import { CreateOrderDto, VerifyPaymentDto } from './payments.dto';

const PLAN_AMOUNTS: Record<string, Record<string, number>> = {
  [UserPlan.FOUNDER]: { inr: 19900, usd: 1900 },   // paise / cents
  [UserPlan.STUDIO]:  { inr: 39900, usd: 3900 },
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly razorpay: Razorpay;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    const amount = PLAN_AMOUNTS[dto.plan]?.[dto.currency];
    if (!amount) throw new BadRequestException('Invalid plan or currency');

    try {
      const order = await this.razorpay.orders.create({
        amount,
        currency: dto.currency.toUpperCase(),
        receipt: `rcpt_${userId.slice(-8)}_${Date.now()}`,
        notes: { userId, plan: dto.plan },
      });
      return { orderId: order.id, amount, currency: dto.currency.toUpperCase() };
    } catch (err) {
      this.logger.error('Razorpay order creation failed', err);
      throw new InternalServerErrorException('Could not create payment order');
    }
  }

  async verifyAndUpgrade(userId: string, dto: VerifyPaymentDto) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = dto;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new BadRequestException('Payment verification failed');
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { plan } },
      { new: true },
    ).lean();

    return { success: true, plan: user?.plan };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expected !== signature) {
      this.logger.warn('Invalid Razorpay webhook signature');
      return { received: false };
    }

    const event = JSON.parse(rawBody.toString()) as {
      event: string;
      payload: { payment: { entity: { notes: { userId: string; plan: string } } } };
    };

    if (event.event === 'payment.captured') {
      const { userId, plan } = event.payload.payment.entity.notes;
      if (userId && plan) {
        await this.userModel.findByIdAndUpdate(userId, { $set: { plan } });
        this.logger.log(`Plan upgraded via webhook: user=${userId} plan=${plan}`);
      }
    }

    return { received: true };
  }
}
