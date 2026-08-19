import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { UserPlan } from '../users/user.schema';

export class CreateOrderDto {
  @IsIn([UserPlan.FOUNDER, UserPlan.STUDIO])
  plan: UserPlan.FOUNDER | UserPlan.STUDIO;

  @IsIn(['inr', 'usd'])
  currency: 'inr' | 'usd';
}

export class VerifyPaymentDto {
  @IsString() @IsNotEmpty() razorpay_order_id: string;
  @IsString() @IsNotEmpty() razorpay_payment_id: string;
  @IsString() @IsNotEmpty() razorpay_signature: string;
  @IsIn([UserPlan.FOUNDER, UserPlan.STUDIO]) plan: UserPlan.FOUNDER | UserPlan.STUDIO;
}
