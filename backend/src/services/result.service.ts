import {
  candidateRepository,
  constituencyRepository,
  partyRepository,
  profileRepository,
  voteRepository,
} from '../repositories/index.js'

interface CandidateResult {
  candidateId: number
  candidateName: string
  candidateNumber: number
  partyId: number
  partyName: string
  partyColor: string
  voteCount: number
  imageUrl: string
}

interface ConstituencyResult {
  constituencyId: number
  province: string
  zoneNumber: number
  isPollOpen: boolean
  candidates: CandidateResult[]
  totalVotes: number
}

export class ResultService {
  async getResultsByConstituency(
    constituencyId: number,
  ): Promise<ConstituencyResult | null> {
    const constituency = await constituencyRepository.findById(constituencyId)
    if (!constituency) return null

    const candidates = await candidateRepository.findByConstituency(
      constituencyId,
      { limit: 1000 },
    )
    const voteResults =
      await voteRepository.getResultsByConstituency(constituencyId)

    // Create vote count map
    const voteCounts = new Map<number, number>()
    voteResults.forEach(
      (r: { candidateId: number; _count: { candidateId: number } }) => {
        voteCounts.set(r.candidateId, r._count.candidateId)
      },
    )

    const candidateResults: CandidateResult[] = candidates.data.map((c) => ({
      candidateId: c.id,
      candidateName: `${c.firstName} ${c.lastName}`,
      candidateNumber: c.candidateNumber,
      partyId: c.party.id,
      partyName: c.party.name,
      partyColor: c.party.color,
      voteCount: voteCounts.get(c.id) || 0,
      imageUrl: c.imageUrl,
    }))

    // Sort by vote count descending
    candidateResults.sort((a, b) => b.voteCount - a.voteCount)

    return {
      constituencyId: constituency.id,
      province: constituency.province,
      zoneNumber: constituency.zoneNumber,
      isPollOpen: constituency.isPollOpen,
      candidates: candidateResults,
      totalVotes: candidateResults.reduce((sum, c) => sum + c.voteCount, 0),
    }
  }

  async getAllResults() {
    // Batch fetch all data in parallel - no N+1 queries!
    const [constituencies, allCandidates, allVotes, allParties, totalVotes] =
      await Promise.all([
        constituencyRepository.findAll({ limit: 1000 }),
        candidateRepository.findAll({ limit: 10000 }),
        voteRepository.getAllVoteCounts(),
        partyRepository.findAll({ limit: 1000 }),
        voteRepository.getTotalVotes(),
      ])

    // Build party lookup map
    const partyMap = new Map(
      allParties.data.map((p: { id: number; name: string; color: string }) => [
        p.id,
        p,
      ]),
    )

    // Build vote counts per candidate
    const voteCounts = new Map<number, number>()
    allVotes.forEach(
      (v: { candidateId: number; _count: { candidateId: number } }) => {
        voteCounts.set(v.candidateId, v._count.candidateId)
      },
    )

    // Group candidates by constituency with full info
    const candidatesByConstituency = new Map<number, CandidateResult[]>()
    allCandidates.data.forEach(
      (c: {
        id: number
        firstName: string
        lastName: string
        candidateNumber: number
        partyId: number
        constituencyId: number
        imageUrl: string
      }) => {
        const party = partyMap.get(c.partyId) || {
          id: 0,
          name: 'Unknown',
          color: '#888',
        }
        const candidateResult: CandidateResult = {
          candidateId: c.id,
          candidateName: `${c.firstName} ${c.lastName}`,
          candidateNumber: c.candidateNumber,
          partyId: c.partyId,
          partyName: party.name,
          partyColor: party.color,
          voteCount: voteCounts.get(c.id) || 0,
          imageUrl: c.imageUrl,
        }

        if (!candidatesByConstituency.has(c.constituencyId)) {
          candidatesByConstituency.set(c.constituencyId, [])
        }
        candidatesByConstituency.get(c.constituencyId)!.push(candidateResult)
      },
    )

    // Build results for each constituency
    const results: ConstituencyResult[] = constituencies.data.map(
      (c: {
        id: number
        province: string
        zoneNumber: number
        isPollOpen: boolean
      }) => {
        const candidates = candidatesByConstituency.get(c.id) || []
        // Sort by vote count descending
        candidates.sort((a, b) => b.voteCount - a.voteCount)

        return {
          constituencyId: c.id,
          province: c.province,
          zoneNumber: c.zoneNumber,
          isPollOpen: c.isPollOpen,
          candidates,
          totalVotes: candidates.reduce((sum, cand) => sum + cand.voteCount, 0),
        }
      },
    )

    return {
      constituencies: results,
      totalVotes,
    }
  }

  async getPartyStats() {
    // Batch fetch all data in parallel - no N+1 queries!
    const [parties, constituencies, allVotes, allCandidates] =
      await Promise.all([
        partyRepository.findAll({ limit: 1000 }),
        constituencyRepository.findAll({ limit: 1000 }),
        voteRepository.getAllVoteCounts(), // New batch method
        candidateRepository.findAll({ limit: 10000 }),
      ])

    // Build candidate lookup map: candidateId -> candidate
    const candidateMap = new Map(
      allCandidates.data.map(
        (c: { id: number; partyId: number; constituencyId: number }) => [
          c.id,
          c,
        ],
      ),
    )

    // Build vote counts per candidate
    const voteCounts = new Map<number, number>()
    allVotes.forEach(
      (v: { candidateId: number; _count: { candidateId: number } }) => {
        voteCounts.set(v.candidateId, v._count.candidateId)
      },
    )

    // Group candidates by constituency
    const candidatesByConstituency = new Map<
      number,
      { id: number; partyId: number; votes: number }[]
    >()
    allCandidates.data.forEach(
      (c: { id: number; partyId: number; constituencyId: number }) => {
        if (!candidatesByConstituency.has(c.constituencyId)) {
          candidatesByConstituency.set(c.constituencyId, [])
        }
        candidatesByConstituency.get(c.constituencyId)!.push({
          id: c.id,
          partyId: c.partyId,
          votes: voteCounts.get(c.id) || 0,
        })
      },
    )

    // Count seats (winners) per party - only from closed polls
    const seatCounts = new Map<number, number>()

    for (const c of constituencies.data) {
      if (c.isPollOpen) continue // Only count closed polls

      const candidates = candidatesByConstituency.get(c.id) || []
      if (candidates.length > 0) {
        // Sort by votes descending to find winner
        candidates.sort((a, b) => b.votes - a.votes)
        const winner = candidates[0]
        seatCounts.set(
          winner.partyId,
          (seatCounts.get(winner.partyId) || 0) + 1,
        )
      }
    }

    return parties.data.map(
      (p: { id: number; name: string; logoUrl: string; color: string }) => ({
        id: p.id,
        name: p.name,
        logoUrl: p.logoUrl,
        color: p.color,
        seats: seatCounts.get(p.id) || 0,
      }),
    )
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
    ])

    // Calculate turnout
    const turnout = totalVoters > 0 ? (totalVotes / totalVoters) * 100 : 0

    // Calculate progress
    const countingProgress =
      totalConstituencies > 0
        ? (closedConstituencies / totalConstituencies) * 100
        : 0

    return {
      totalVotes,
      turnout: parseFloat(turnout.toFixed(2)),
      countingProgress: parseFloat(countingProgress.toFixed(1)),
      partyStats,
    }
  }
}

export const resultService = new ResultService()
