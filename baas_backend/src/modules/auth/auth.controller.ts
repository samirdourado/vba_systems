import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { LoginMerchantDto } from './dto/login-merchant.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth user')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Cadastro de usuários (PF ou PJ)' })
  @Post('register')
  async register(@Body() dto: RegisterMerchantDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login público (CPF ou CNPJ + senha)' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginMerchantDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Dados do usuário autenticado.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user);
  }

  @ApiOperation({ summary: 'Reset de senha' })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}