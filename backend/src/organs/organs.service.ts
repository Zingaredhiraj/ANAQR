import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import slugify from 'slugify';
import { ContentStatus, Organ, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginatedResponse } from '../common/dto/pagination.dto';
import {
  CreateOrganDto,
  UpdateOrganDto,
  OrgansQueryDto,
  OrganSummary,
  OrganDetail,
} from './dto/organs.dto';

@Injectable()
export class OrgansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: OrgansQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      systemId,
      status,
      isPublished,
      sortBy = 'createdAt',
      sortOrder = 'asc',
    } = query;

    const where: Prisma.OrganWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { scientificName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (systemId) {
      where.systemId = systemId;
    }

    if (status) {
      where.status = status;
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      this.prisma.organ.count({ where }),
      this.prisma.organ.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          slug: true,
          scientificName: true,
          latinName: true,
          thumbnailUrl: true,
          status: true,
          isPublished: true,
          system: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          revisions: {
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: {
              id: true,
              fieldName: true,
              note: true,
              newValue: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    return paginatedResponse<OrganSummary>(items, total, page, limit);
  }

  async findBySlug(slug: string): Promise<OrganDetail> {
    const organ = await this.prisma.organ.findUnique({
      where: { slug },
      include: {
        system: true,
        content: true,
        structures: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        },
        disorders: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        },
        learningModules: {
          include: {
            sections: {
              where: { isActive: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        models: {
          where: { isPublished: true },
          include: {
            hotspots: { where: { isActive: true }, orderBy: { orderIndex: 'asc' } },
            layers: { orderBy: { orderIndex: 'asc' } },
            animations: { where: { isActive: true }, orderBy: { orderIndex: 'asc' } },
          },
        },
        qrCodes: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        quizzes: {
          where: { isPublished: true },
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
              include: {
                options: {
                  orderBy: { orderIndex: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!organ) {
      throw new NotFoundException(`Organ with slug "${slug}" not found`);
    }

    return organ as unknown as OrganDetail;
  }

  async findById(id: string): Promise<Organ> {
    const organ = await this.prisma.organ.findUnique({
      where: { id },
      include: {
        system: true,
        content: true,
        revisions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!organ) {
      throw new NotFoundException(`Organ with ID "${id}" not found`);
    }

    return organ;
  }

  async create(dto: CreateOrganDto, userId: string): Promise<Organ> {
    const system = await this.prisma.anatomicalSystem.findUnique({
      where: { id: dto.systemId },
    });
    if (!system) {
      throw new BadRequestException(`Anatomical system with ID ${dto.systemId} does not exist`);
    }

    const baseSlug = slugify(dto.name, { lower: true, strict: true, trim: true });

    // Find the highest existing counter suffix in a single query instead of N serial lookups
    const existing = await this.prisma.organ.findMany({
      where: { slug: { startsWith: baseSlug } },
      select: { slug: true },
    });
    const taken = new Set(existing.map((o) => o.slug));

    let slug = baseSlug;
    let counter = 1;
    while (taken.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    return this.prisma.organ.create({
      data: {
        name: dto.name,
        slug,
        scientificName: dto.scientificName,
        latinName: dto.latinName,
        systemId: dto.systemId,
        description: dto.description,
        location: dto.location,
        tags: dto.tags || [],
        createdById: userId,
        status: ContentStatus.PENDING_REVIEW,
        content: {
          create: {},
        },
      },
      include: {
        system: true,
        content: true,
        revisions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async update(id: string, dto: UpdateOrganDto, userId: string): Promise<Organ> {
    const existing = await this.findById(id);

    const revisionEntries: Prisma.ContentRevisionCreateManyInput[] = [];
    const fieldsToTrack = [
      'name',
      'scientificName',
      'latinName',
      'systemId',
      'description',
      'location',
      'thumbnailUrl',
      'coverImageUrl',
    ];

    for (const field of fieldsToTrack) {
      if ((dto as any)[field] !== undefined && (dto as any)[field] !== (existing as any)[field]) {
        revisionEntries.push({
          organId: id,
          fieldName: field,
          oldValue: String((existing as any)[field] ?? ''),
          newValue: String((dto as any)[field] ?? ''),
          changedById: userId,
        });
      }
    }

    if (revisionEntries.length > 0) {
      await this.prisma.contentRevision.createMany({
        data: revisionEntries,
      });
    }

    return this.prisma.organ.update({
      where: { id },
      data: {
        ...dto,
      },
      include: {
        system: true,
        content: true,
        revisions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async updateStatus(id: string, status: ContentStatus, userId: string, note?: string): Promise<Organ> {
    const existing = await this.findById(id);

    const updateData: Prisma.OrganUpdateInput = {
      status,
    };

    if (status === ContentStatus.APPROVED) {
      updateData.isPublished = true;
      updateData.publishedAt = new Date();
      updateData.approvedById = userId;
      updateData.approvedAt = new Date();
    } else if (status === ContentStatus.REJECTED || status === ContentStatus.ARCHIVED || status === ContentStatus.PENDING_REVIEW || status === ContentStatus.DRAFT) {
      updateData.isPublished = false;
    }

    if (note || status === ContentStatus.REJECTED || status === ContentStatus.PENDING_REVIEW) {
      await this.prisma.contentRevision.create({
        data: {
          organId: id,
          fieldName: 'review_feedback',
          oldValue: existing.status,
          newValue: status,
          note: note || (status === ContentStatus.REJECTED ? 'Changes requested by faculty' : 'Submitted for faculty review'),
          changedById: userId,
        },
      });
    }

    return this.prisma.organ.update({
      where: { id },
      data: updateData,
      include: {
        system: true,
        revisions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.organ.delete({
      where: { id },
    });
  }

  async getBySystem(systemSlug: string): Promise<OrganSummary[]> {
    const system = await this.prisma.anatomicalSystem.findUnique({
      where: { slug: systemSlug },
    });

    if (!system) {
      throw new NotFoundException(`Anatomical system with slug "${systemSlug}" not found`);
    }

    return this.prisma.organ.findMany({
      where: {
        systemId: system.id,
        isPublished: true,
      },
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        scientificName: true,
        latinName: true,
        thumbnailUrl: true,
        status: true,
        isPublished: true,
        system: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }
}
