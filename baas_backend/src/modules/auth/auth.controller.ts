import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { LoginMerchantDto } from './dto/login-merchant.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Merchant Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new merchant in BaaS and Lera Box Gateway' })
  @Post('register')
  async register(@Body() dto: RegisterMerchantDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login merchant into BaaS' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginMerchantDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Get profile of current authenticated merchant' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }
}