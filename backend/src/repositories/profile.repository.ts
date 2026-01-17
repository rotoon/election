import { Prisma } from '@prisma/client'
import prisma from '../utils/prisma.js'

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export class ProfileRepository {
  async findAll(params: PaginationParams = {}): Promise<PaginatedResult<any>> {
    const page = params.page || 1
    const limit = params.limit || 20
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.profile.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { constituency: true },
      }),
      prisma.profile.count(),
    ])

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findFiltered(params: {
    page?: number
    limit?: number
    role?: string
  }): Promise<PaginatedResult<any>> {
    const page = params.page || 1
    const limit = params.limit || 20
    const skip = (page - 1) * limit

    // Build dynamic where clause
    const where: any = {}
    if (params.role && params.role !== 'all') {
      where.role = params.role
    }

    const [data, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { constituency: true },
      }),
      prisma.profile.count({ where }),
    ])

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string) {
    return prisma.profile.findUnique({
      where: { id },
      include: { constituency: true },
    })
  }

  async findByEmail(email: string) {
    return prisma.profile.findUnique({
      where: { email },
      include: { constituency: true },
    })
  }

  async findByNationalId(nationalId: string) {
    return prisma.profile.findUnique({
      where: { nationalId },
    })
  }

  async create(data: Prisma.ProfileCreateInput) {
    return prisma.profile.create({
      data,
      include: { constituency: true },
    })
  }

  async updateRole(id: string, role: 'admin' | 'ec' | 'voter') {
    return prisma.profile.update({
      where: { id },
      data: { role },
    })
  }

  async delete(id: string) {
    return prisma.profile.delete({
      where: { id },
    })
  }

  async countVoters() {
    return prisma.profile.count({
      where: { role: 'voter' },
    })
  }
}

export const profileRepository = new ProfileRepository()
