import prisma from "../utils/prisma.js";

export class VoteRepository {
  async findByUserAndConstituency(userId: string, constituencyId: number) {
    return prisma.vote.findUnique({
      where: {
        userId_constituencyId: { userId, constituencyId },
      },
      include: { candidate: true },
    });
  }

  async findByConstituency(constituencyId: number) {
    return prisma.vote.findMany({
      where: { constituencyId },
      include: { candidate: { include: { party: true } } },
    });
  }

  async countByCandidate(candidateId: number) {
    return prisma.vote.count({
      where: { candidateId },
    });
  }

  async create(userId: string, candidateId: number, constituencyId: number) {
    return prisma.vote.create({
      data: {
        userId,
        candidateId,
        constituencyId,
      },
      include: { candidate: true },
    });
  }

  async update(userId: string, constituencyId: number, candidateId: number) {
    return prisma.vote.update({
      where: {
        userId_constituencyId: { userId, constituencyId },
      },
      data: {
        candidateId,
        timestamp: new Date(),
      },
      include: { candidate: true },
    });
  }

  async getResultsByConstituency(constituencyId: number) {
    return prisma.vote.groupBy({
      by: ["candidateId"],
      where: { constituencyId },
      _count: { candidateId: true },
    });
  }

  async getTotalVotes() {
    return prisma.vote.count();
  }
}

export const voteRepository = new VoteRepository();
