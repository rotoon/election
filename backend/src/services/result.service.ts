import {
  candidateRepository,
  constituencyRepository,
  partyRepository,
  profileRepository,
  voteRepository,
} from "../repositories/index.js";

interface CandidateResult {
  candidateId: number;
  candidateName: string;
  candidateNumber: number;
  partyId: number;
  partyName: string;
  partyColor: string;
  voteCount: number;
}

interface ConstituencyResult {
  constituencyId: number;
  province: string;
  zoneNumber: number;
  isPollOpen: boolean;
  candidates: CandidateResult[];
  totalVotes: number;
}

export class ResultService {
  async getResultsByConstituency(
    constituencyId: number
  ): Promise<ConstituencyResult | null> {
    const constituency = await constituencyRepository.findById(constituencyId);
    if (!constituency) return null;

    const candidates = await candidateRepository.findByConstituency(
      constituencyId,
      { limit: 1000 }
    );
    const voteResults = await voteRepository.getResultsByConstituency(
      constituencyId
    );

    // Create vote count map
    const voteCounts = new Map<number, number>();
    voteResults.forEach(
      (r: { candidateId: number; _count: { candidateId: number } }) => {
        voteCounts.set(r.candidateId, r._count.candidateId);
      }
    );

    const candidateResults: CandidateResult[] = candidates.data.map((c) => ({
      candidateId: c.id,
      candidateName: `${c.firstName} ${c.lastName}`,
      candidateNumber: c.candidateNumber,
      partyId: c.party.id,
      partyName: c.party.name,
      partyColor: c.party.color,
      voteCount: voteCounts.get(c.id) || 0,
    }));

    // Sort by vote count descending
    candidateResults.sort((a, b) => b.voteCount - a.voteCount);

    return {
      constituencyId: constituency.id,
      province: constituency.province,
      zoneNumber: constituency.zoneNumber,
      isPollOpen: constituency.isPollOpen,
      candidates: candidateResults,
      totalVotes: candidateResults.reduce((sum, c) => sum + c.voteCount, 0),
    };
  }

  async getAllResults() {
    const constituencies = await constituencyRepository.findAll({
      limit: 1000,
    });
    const results: ConstituencyResult[] = [];

    for (const c of constituencies.data) {
      const result = await this.getResultsByConstituency(c.id);
      if (result) results.push(result);
    }

    return {
      constituencies: results,
      totalVotes: await voteRepository.getTotalVotes(),
    };
  }

  async getPartyStats() {
    const parties = await partyRepository.findAll({ limit: 1000 });
    const constituencies = await constituencyRepository.findAll({
      limit: 1000,
    });

    // Count seats (winners) per party
    const seatCounts = new Map<number, number>();

    for (const c of constituencies.data) {
      if (c.isPollOpen) continue; // Only count closed polls

      const result = await this.getResultsByConstituency(c.id);
      if (result && result.candidates.length > 0) {
        const winner = result.candidates[0];
        seatCounts.set(
          winner.partyId,
          (seatCounts.get(winner.partyId) || 0) + 1
        );
      }
    }

    return parties.data.map(
      (p: { id: number; name: string; logoUrl: string; color: string }) => ({
        id: p.id,
        name: p.name,
        logoUrl: p.logoUrl,
        color: p.color,
        seats: seatCounts.get(p.id) || 0,
      })
    );
  }

  async getDashboardStats() {
    const [
      partyStats,
      totalVotes,
      totalVoters,
      totalConstituencies,
      closedConstituencies,
    ] = await Promise.all([
      this.getPartyStats(),
      voteRepository.getTotalVotes(),
      profileRepository.countVoters(),
      constituencyRepository.countTotal(),
      constituencyRepository.countClosed(),
    ]);

    // Calculate turnout
    const turnout = totalVoters > 0 ? (totalVotes / totalVoters) * 100 : 0;

    // Calculate progress
    const countingProgress =
      totalConstituencies > 0
        ? (closedConstituencies / totalConstituencies) * 100
        : 0;

    return {
      totalVotes,
      turnout: parseFloat(turnout.toFixed(2)),
      countingProgress: parseFloat(countingProgress.toFixed(1)),
      partyStats,
    };
  }
}

export const resultService = new ResultService();
