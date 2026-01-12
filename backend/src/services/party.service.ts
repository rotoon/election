import { AppError } from "../middleware/error.middleware.js";
import { partyRepository } from "../repositories/index.js";
import { PaginationParams } from "../repositories/profile.repository.js";

export class PartyService {
  async getAll(params: PaginationParams = {}) {
    return partyRepository.findAll(params);
  }

  async getById(id: number) {
    const party = await partyRepository.findById(id);
    if (!party) {
      throw new AppError(404, "ไม่พบพรรคการเมือง");
    }
    return party;
  }

  async create(data: {
    name: string;
    logoUrl?: string;
    policy?: string;
    color?: string;
  }) {
    const existing = await partyRepository.findByName(data.name);
    if (existing) {
      throw new AppError(400, "ชื่อพรรคนี้มีอยู่แล้ว");
    }

    return partyRepository.create({
      name: data.name,
      logoUrl: data.logoUrl || "",
      policy: data.policy || "",
      color: data.color || "#3B82F6",
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      logoUrl?: string;
      policy?: string;
      color?: string;
    }
  ) {
    await this.getById(id);

    if (data.name) {
      const existing = await partyRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new AppError(400, "ชื่อพรรคนี้มีอยู่แล้ว");
      }
    }

    return partyRepository.update(id, data);
  }

  async delete(id: number) {
    await this.getById(id);
    return partyRepository.delete(id);
  }
}

export const partyService = new PartyService();
