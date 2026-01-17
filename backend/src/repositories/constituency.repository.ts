import { Prisma } from '@prisma/client'
import prisma from '../utils/prisma.js'
import { PaginatedResult, PaginationParams } from './profile.repository.js'

export class ConstituencyRepository {
  async findAll(params: PaginationParams = {}): Promise<PaginatedResult<any>> {
    const page = params.page || 1
    const limit = params.limit || 50
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.constituency.findMany({
        skip,
        take: limit,
        orderBy: [{ province: 'asc' }, { zoneNumber: 'asc' }],
      }),
      prisma.constituency.count(),
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
    province?: string
  }): Promise<PaginatedResult<any>> {
    const page = params.page || 1
    const limit = params.limit || 50
    const skip = (page - 1) * limit

    // Build dynamic where clause
    const where: any = {}
    if (params.province) {
      where.province = params.province
    }

    const [data, total] = await Promise.all([
      prisma.constituency.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ province: 'asc' }, { zoneNumber: 'asc' }],
      }),
      prisma.constituency.count({ where }),
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

  async findById(id: number) {
    return prisma.constituency.findUnique({
      where: { id },
    })
  }

  async findByProvinceAndZone(province: string, zoneNumber: number) {
    return prisma.constituency.findFirst({
      where: { province, zoneNumber },
    })
  }

  async create(data: Prisma.ConstituencyCreateInput) {
    return prisma.constituency.create({ data })
  }

  async update(id: number, data: Prisma.ConstituencyUpdateInput) {
    return prisma.constituency.update({
      where: { id },
      data,
    })
  }

  async updatePollStatus(id: number, isPollOpen: boolean) {
    return prisma.constituency.update({
      where: { id },
      data: { isPollOpen },
    })
  }

  async updateAllPollStatus(isPollOpen: boolean) {
    return prisma.constituency.updateMany({
      data: { isPollOpen },
    })
  }

  async delete(id: number) {
    return prisma.constituency.delete({
      where: { id },
    })
  }

  async countTotal() {
    return prisma.constituency.count()
  }

  async countClosed() {
    return prisma.constituency.count({
      where: { isPollOpen: false },
    })
  }
}

export const constituencyRepository = new ConstituencyRepository()
