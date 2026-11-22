import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';
import { CreateFacultyDto, CreateStudentDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: Role, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = {
      ...(role ? { role } : {}),
      ...(search ? { email: { contains: search, mode: 'insensitive' as const } } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          studentProfile: true,
          facultyProfile: {
            include: { department: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        studentProfile: true,
        facultyProfile: {
          include: {
            department: true,
            organAssignments: {
              include: { organ: { select: { id: true, name: true, slug: true } } },
            },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createFaculty(dto: CreateFacultyDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: Role.FACULTY,
        facultyProfile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            designation: dto.designation,
            specialization: dto.specialization,
            departmentId: dto.departmentId,
          },
        },
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });
  }

  async createStudent(dto: CreateStudentDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: Role.STUDENT,
        studentProfile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            studentId: dto.studentId,
            batchYear: dto.batchYear,
          },
        },
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });
  }

  async toggleActive(id: string) {
    const user = await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, isActive: true },
    });
  }

  async assignOrgan(facultyUserId: string, organId: string, canEdit = true, canPublish = false) {
    const user = await this.prisma.user.findUnique({
      where: { id: facultyUserId },
      include: { facultyProfile: true },
    });
    if (!user || !user.facultyProfile) {
      throw new NotFoundException('Faculty profile not found');
    }

    return this.prisma.organAssignment.upsert({
      where: {
        organId_facultyProfileId: {
          organId,
          facultyProfileId: user.facultyProfile.id,
        },
      },
      update: { canEdit, canPublish },
      create: {
        organId,
        facultyProfileId: user.facultyProfile.id,
        canEdit,
        canPublish,
      },
    });
  }
}
