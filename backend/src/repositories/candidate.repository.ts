import { Prisma } from '@prisma/client'
import prisma from '../utils/prisma.js'
import { PaginatedResult, PaginationParams } from './profile.repository.js'

export class CandidateRepository {
  async findAll(params: PaginationParams = {}): Promise<PaginatedResult<any>> {
    const page = params.page || 1
    const limit = params.limit || 20
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.candidate.findMany({
        skip,
        take: limit,
        include: { party: true, constituency: true },
        orderBy: { candidateNumber: 'asc' },
      }),
      prisma.candidate.count(),
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
    return prisma.candidate.findUnique({
      where: { id },
      include: { party: true, constituency: true },
    })
  }

  async findByConstituency(
    constituencyId: number,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<any>> {
    const page = params.page || 1
    const limit = params.limit || 20
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.candidate.findMany({
        where: { constituencyId },
        skip,
        take: limit,
        include: { party: true },
        orderBy: { candidateNumber: 'asc' },
      }),
      prisma.candidate.count({ where: { constituencyId } }),
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
    constituencyId?: number
    partyId?: number
  }): Promise<PaginatedResult<any>> {
    const page = params.page || 1
    const limit = params.limit || 20
    const skip = (page - 1) * limit

    // Build dynamic where clause
    const where: any = {}
    if (params.constituencyId) {
      where.constituencyId = params.constituencyId
    }
    if (params.partyId) {
      where.partyId = params.partyId
    }

    const [data, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        include: { party: true, constituency: true },
        orderBy: { candidateNumber: 'asc' },
      }),
      prisma.candidate.count({ where }),
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

  async create(data: Prisma.CandidateUncheckedCreateInput) {
    return prisma.candidate.create({
      data,
      include: { party: true, constituency: true },
    })
  }

  async update(id: number, data: Prisma.CandidateUpdateInput) {
    return prisma.candidate.update({
      where: { id },
      data,
      include: { party: true, constituency: true },
    })
  }

  async delete(id: number) {
    return prisma.candidate.delete({
      where: { id },
    })
  }
}

export const candidateRepository = new CandidateRepository()
