import bcrypt from "bcryptjs";
import { AppError } from "../middleware/error.middleware.js";
import { profileRepository } from "../repositories/index.js";
import { generateToken } from "../utils/jwt.js";

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    nationalId: string;
    fullName: string;
    address: string;
    constituencyId?: number;
  }) {
    // Check if email exists
    const existingEmail = await profileRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new AppError(400, "อีเมลนี้ถูกใช้งานแล้ว");
    }

    // Check if national ID exists
    const existingNationalId = await profileRepository.findByNationalId(
      data.nationalId
    );
    if (existingNationalId) {
      throw new AppError(400, "เลขบัตรประชาชนนี้ถูกใช้งานแล้ว");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await profileRepository.create({
      email: data.email,
      password: hashedPassword,
      nationalId: data.nationalId,
      fullName: data.fullName,
      address: data.address,
      constituency: data.constituencyId
        ? { connect: { id: data.constituencyId } }
        : undefined,
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        constituencyId: user.constituencyId,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await profileRepository.findByEmail(email);
    if (!user) {
      throw new AppError(401, "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        constituencyId: user.constituencyId,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await profileRepository.findById(userId);
    if (!user) {
      throw new AppError(404, "ไม่พบผู้ใช้");
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      nationalId: user.nationalId,
      address: user.address,
      role: user.role,
      constituencyId: user.constituencyId,
      constituency: user.constituency,
    };
  }
}

export const authService = new AuthService();
