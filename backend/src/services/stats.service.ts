import prisma from "../utils/prisma.js";

export class StatsService {
  async getAdminStats() {
    const [totalVoters, totalConstituencies, totalOfficers] = await Promise.all(
      [
        prisma.profile.count({ where: { role: "voter" } }),
        prisma.constituency.count(),
        prisma.profile.count({ where: { role: { in: ["admin", "ec"] } } }),
      ]
    );

    return {
      totalVoters,
      totalConstituencies,
      totalOfficers,
      voterChange: 0, // Placeholder
    };
  }

  async getECStats() {
    const [totalParties, totalCandidates, totalVoters] = await Promise.all([
      prisma.party.count(),
      prisma.candidate.count(),
      prisma.profile.count({ where: { role: "voter" } }),
    ]);

    // Count unique voters who have cast a vote (assuming 1 vote per voter in current context)
    // If logic is 1 vote per constituency, we might just count rows in Vote table if we assume 1 active election.
    // Ideally select distinct voterId from Vote.
    const votes = await prisma.vote.findMany({
      distinct: ["userId"],
      select: { userId: true },
    });
    const votedCount = votes.length;

    const votedPercentage =
      totalVoters > 0 ? (votedCount / totalVoters) * 100 : 0;

    return {
      totalParties,
      totalCandidates,
      votedCount,
      votedPercentage: Math.round(votedPercentage * 10) / 10,
    };
  }
}

export const statsService = new StatsService();
