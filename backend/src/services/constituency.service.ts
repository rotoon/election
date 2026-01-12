import { AppError } from "../middleware/error.middleware.js";
import { constituencyRepository } from "../repositories/index.js";
import { PaginationParams } from "../repositories/profile.repository.js";

export class ConstituencyService {
  async getAll(params: PaginationParams = {}) {
    return constituencyRepository.findAll(params);
  }

  async getById(id: number) {
    const constituency = await constituencyRepository.findById(id);
    if (!constituency) {
      throw new AppError(404, "ไม่พบเขตเลือกตั้ง");
    }
    return constituency;
  }

  async create(data: { province: string; zoneNumber: number }) {
    // Check if already exists
    const existing = await constituencyRepository.findByProvinceAndZone(
      data.province,
      data.zoneNumber
    );
    if (existing) {
      throw new AppError(400, "เขตเลือกตั้งนี้มีอยู่แล้ว");
    }

    return constituencyRepository.create({
      province: data.province,
      zoneNumber: data.zoneNumber,
    });
  }

  async updatePollStatus(id: number, isPollOpen: boolean) {
    await this.getById(id);
    return constituencyRepository.updatePollStatus(id, isPollOpen);
  }

  async openAllPolls() {
    return constituencyRepository.updateAllPollStatus(true);
  }

  async closeAllPolls() {
    return constituencyRepository.updateAllPollStatus(false);
  }

  async delete(id: number) {
    await this.getById(id);
    return constituencyRepository.delete(id);
  }
}

export const constituencyService = new ConstituencyService();
