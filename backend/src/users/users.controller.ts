import { Controller, Get, Post, Patch, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators';
import { Role } from '@prisma/client';
import { CreateFacultyDto, CreateStudentDto } from './dto/users.dto';

@ApiTags('users')
@Controller({ path: 'users', version: '1' })
@Roles(Role.SUPER_ADMIN)
@ApiBearerAuth()
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List platform users (Admin only)' })
  async findAll(
    @Query('role') role?: Role,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const result = await this.service.findAll(role, Number(page) || 1, Number(limit) || 20, search);
    return { message: 'Users retrieved', ...result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by ID (Admin only)' })
  async findById(@Param('id') id: string) {
    return { message: 'User retrieved', data: await this.service.findById(id) };
  }

  @Post('faculty')
  @ApiOperation({ summary: 'Create faculty account (Admin only)' })
  async createFaculty(@Body() body: CreateFacultyDto) {
    return { message: 'Faculty created', data: await this.service.createFaculty(body) };
  }

  @Post('students')
  @ApiOperation({ summary: 'Create student account (Admin only)' })
  async createStudent(@Body() body: CreateStudentDto) {
    return { message: 'Student created', data: await this.service.createStudent(body) };
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Activate/deactivate user account (Admin only)' })
  async toggleActive(@Param('id') id: string) {
    return { message: 'Account status updated', data: await this.service.toggleActive(id) };
  }

  @Post(':id/assign-organ')
  @ApiOperation({ summary: 'Assign organ to faculty member (Admin only)' })
  async assignOrgan(
    @Param('id') facultyUserId: string,
    @Body() body: { organId: string; canEdit?: boolean; canPublish?: boolean },
  ) {
    const assignment = await this.service.assignOrgan(
      facultyUserId,
      body.organId,
      body.canEdit,
      body.canPublish,
    );
    return { message: 'Organ assigned to faculty', data: assignment };
  }
}
