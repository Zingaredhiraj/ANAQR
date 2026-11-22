import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '../common/decorators';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new student account' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.register(dto);
    return { message: 'Registration successful', data: user };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive access token cookie' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.login(dto);

    const isProduction = this.config.get('NODE_ENV') === 'production';
    const cookieDomain = this.config.get('COOKIE_DOMAIN');
    const cookieSecure = this.config.get('COOKIE_SECURE') === 'true' || isProduction;

    const cookieOptions: any = {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSecure ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    if (cookieDomain && cookieDomain !== 'localhost') {
      cookieOptions.domain = cookieDomain;
    }

    res.cookie('access_token', accessToken, cookieOptions);

    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return {
      message: 'Login successful',
      data: {
        ...user,
        accessToken,
        refreshToken,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and clear cookies' })
  @ApiBearerAuth()
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as { id: string };
    if (user?.id) await this.authService.logout(user.id);

    const isProduction = this.config.get('NODE_ENV') === 'production';
    const cookieDomain = this.config.get('COOKIE_DOMAIN');
    const cookieSecure = this.config.get('COOKIE_SECURE') === 'true' || isProduction;
    const cookieOptions: any = {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSecure ? 'none' : 'lax',
    };
    if (cookieDomain && cookieDomain !== 'localhost') {
      cookieOptions.domain = cookieDomain;
    }

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiBearerAuth()
  async getMe(@Req() req: Request) {
    const user = req.user as { id: string };
    const data = await this.authService.getMe(user.id);
    return { message: 'User profile retrieved', data };
  }
}
