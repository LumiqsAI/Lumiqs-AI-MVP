import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  getMe(@CurrentUser() user: Express.User) {
    return user;
  }

  @Post('webhook')
  async handleWebhook(@Body() body: { type: string; data: { id: string } }) {
    await this.authService.handleWebhook(body);
    return { received: true };
  }
}
