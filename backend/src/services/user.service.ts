import { AppError } from "../middleware/error.middleware.js";
import { profileRepository } from "../repositories/index.js";
import { PaginationParams } from "../repositories/profile.repository.js";

export class UserService {
  async getAll(params: PaginationParams = {}) {
    return profileRepository.findAll(params);
  }

  async getById(id: string) {
    const user = await profileRepository.findById(id);
    if (!user) {
      throw new AppError(404, "ไม่พบผู้ใช้");
    }
    return user;
  }

  async updateRole(id: string, role: "admin" | "ec" | "voter") {
    await this.getById(id);
    return profileRepository.updateRole(id, role);
  }

  async delete(id: string) {
    await this.getById(id);
    return profileRepository.delete(id);
  }
}

export const userService = new UserService();
