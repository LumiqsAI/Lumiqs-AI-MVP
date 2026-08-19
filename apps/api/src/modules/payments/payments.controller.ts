import {
  Controller, Post, Body, UseGuards, Req,
  Headers, HttpCode, Get,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreateOrderDto, VerifyPaymentDto } from './payments.dto';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/user.schema';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('key')
  @UseGuards(ClerkAuthGuard)
  getKey() {
    return { keyId: process.env.RAZORPAY_KEY_ID };
  }

  @Post('order')
  @UseGuards(ClerkAuthGuard)
  createOrder(@CurrentUser() user: UserDocument, @Body() dto: CreateOrderDto) {
    return this.paymentsService.createOrder(user._id.toString(), dto);
  }

  @Post('verify')
  @UseGuards(ClerkAuthGuard)
  verifyPayment(@CurrentUser() user: UserDocument, @Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyAndUpgrade(user._id.toString(), dto);
  }

  @Post('webhook')
  @HttpCode(200)
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(req.rawBody!, signature);
  }
}
