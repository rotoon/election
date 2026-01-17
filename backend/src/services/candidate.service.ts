import { AppError } from '../middleware/error.middleware.js'
import {
  candidateRepository,
  constituencyRepository,
  partyRepository,
  profileRepository,
} from '../repositories/index.js'
import { PaginationParams } from '../repositories/profile.repository.js'

export class CandidateService {
  async getAll(params: PaginationParams = {}) {
    return candidateRepository.findAll(params)
  }

  async getById(id: number) {
    const candidate = await candidateRepository.findById(id)
    if (!candidate) {
      throw new AppError(404, 'ไม่พบผู้สมัคร')
    }
    return candidate
  }

  async getByConstituency(
    constituencyId: number,
    params: PaginationParams = {},
  ) {
    return candidateRepository.findByConstituency(constituencyId, params)
  }

  async getFiltered(params: {
    page?: number
    limit?: number
    constituencyId?: number
    partyId?: number
  }) {
    return candidateRepository.findFiltered(params)
  }

  async create(data: {
    firstName: string
    lastName: string
    candidateNumber: number
    imageUrl?: string
    personalPolicy?: string
    partyId: number
    constituencyId: number
    nationalId: string
  }) {
    // Check if national ID belongs to an EC
    const existingUser = await profileRepository.findByNationalId(
      data.nationalId,
    )
    if (existingUser && existingUser.role === 'ec') {
      throw new AppError(
        400,
        'ผู้ที่มีสิทธิ์เป็น กกต. ไม่สามารถสมัครรับเลือกตั้งได้',
      )
    }
    const party = await partyRepository.findById(data.partyId)
    if (!party) {
      throw new AppError(400, 'ไม่พบพรรคการเมืองที่เลือก')
    }

    const constituency = await constituencyRepository.findById(
      data.constituencyId,
    )
    if (!constituency) {
      throw new AppError(400, 'ไม่พบเขตเลือกตั้งที่เลือก')
    }

    return candidateRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      candidateNumber: data.candidateNumber,
      imageUrl: data.imageUrl || '',
      personalPolicy: data.personalPolicy || '',
      partyId: data.partyId,
      constituencyId: data.constituencyId,
      nationalId: data.nationalId,
    })
  }

  async update(
    id: number,
    data: {
      firstName?: string
      lastName?: string
      candidateNumber?: number
      imageUrl?: string
      personalPolicy?: string
      partyId?: number
    },
  ) {
    await this.getById(id)
    return candidateRepository.update(id, data)
  }

  async delete(id: number) {
    await this.getById(id)
    return candidateRepository.delete(id)
  }
}

export const candidateService = new CandidateService()
