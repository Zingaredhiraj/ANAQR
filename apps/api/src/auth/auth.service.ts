import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, TokenPayload } from './auth.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    // Only STUDENT self-registration; other roles must be created by admin
    const role: Role = dto.role === Role.SUPER_ADMIN || dto.role === Role.FACULTY
      ? Role.STUDENT
      : (dto.role ?? Role.STUDENT);

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: this.config.get<number>('ARGON2_MEMORY_COST', 65536),
      timeCost: this.config.get<number>('ARGON2_TIME_COST', 3),
      parallelism: this.config.get<number>('ARGON2_PARALLELISM', 1),
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role,
        studentProfile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
          },
        },
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
        studentProfile: { select: { firstName: true, lastName: true, avatarUrl: true } },
        facultyProfile: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload: TokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: (this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '30d') || '30d') as any,
    });

    // Store refresh token hash
    const refreshHash = await argon2.hash(refreshToken);
    await this.prisma.refreshToken.create({
      data: {
        token: refreshHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  }

  async logout(userId: string) {
    // Revoke all refresh tokens for this user
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        studentProfile: true,
        facultyProfile: {
          include: { department: true },
        },
      },
    });
  }

  async adminCreateUser(dto: RegisterDto, role: Role) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });

    const profileData =
      role === Role.FACULTY
        ? { facultyProfile: { create: { firstName: dto.firstName, lastName: dto.lastName } } }
        : { studentProfile: { create: { firstName: dto.firstName, lastName: dto.lastName } } };

    return this.prisma.user.create({
      data: { email: dto.email, passwordHash, role, ...profileData },
      select: { id: true, email: true, role: true, createdAt: true },
    });
  }
}
