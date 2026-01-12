import { AppError } from "../middleware/error.middleware.js";
import {
  candidateRepository,
  constituencyRepository,
  voteRepository,
} from "../repositories/index.js";

export class VoteService {
  async getMyVote(userId: string, constituencyId: number) {
    return voteRepository.findByUserAndConstituency(userId, constituencyId);
  }

  async castVote(userId: string, candidateId: number, constituencyId: number) {
    // Check constituency exists and poll is open
    const constituency = await constituencyRepository.findById(constituencyId);
    if (!constituency) {
      throw new AppError(404, "ไม่พบเขตเลือกตั้ง");
    }
    if (!constituency.isPollOpen) {
      throw new AppError(400, "หีบเลือกตั้งปิดแล้ว");
    }

    // Check candidate exists and is in the same constituency
    const candidate = await candidateRepository.findById(candidateId);
    if (!candidate) {
      throw new AppError(404, "ไม่พบผู้สมัคร");
    }
    if (candidate.constituencyId !== constituencyId) {
      throw new AppError(400, "ผู้สมัครไม่ได้อยู่ในเขตเลือกตั้งของคุณ");
    }

    // Check if user already voted
    const existingVote = await voteRepository.findByUserAndConstituency(
      userId,
      constituencyId
    );
    if (existingVote) {
      // Update existing vote
      return voteRepository.update(userId, constituencyId, candidateId);
    }

    // Create new vote
    return voteRepository.create(userId, candidateId, constituencyId);
  }

  async changeVote(
    userId: string,
    candidateId: number,
    constituencyId: number
  ) {
    // Check constituency exists and poll is open
    const constituency = await constituencyRepository.findById(constituencyId);
    if (!constituency) {
      throw new AppError(404, "ไม่พบเขตเลือกตั้ง");
    }
    if (!constituency.isPollOpen) {
      throw new AppError(400, "หีบเลือกตั้งปิดแล้ว ไม่สามารถเปลี่ยนคะแนนได้");
    }

    // Check existing vote
    const existingVote = await voteRepository.findByUserAndConstituency(
      userId,
      constituencyId
    );
    if (!existingVote) {
      throw new AppError(400, "คุณยังไม่ได้ลงคะแนน");
    }

    // Check candidate exists and is in the same constituency
    const candidate = await candidateRepository.findById(candidateId);
    if (!candidate) {
      throw new AppError(404, "ไม่พบผู้สมัคร");
    }
    if (candidate.constituencyId !== constituencyId) {
      throw new AppError(400, "ผู้สมัครไม่ได้อยู่ในเขตเลือกตั้งของคุณ");
    }

    return voteRepository.update(userId, constituencyId, candidateId);
  }
}

export const voteService = new VoteService();
