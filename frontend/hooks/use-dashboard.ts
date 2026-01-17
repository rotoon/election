import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export interface PublicConstituency {
  id: number
  province: string
  zone_number: number
  name: string
}

export function usePublicConstituencies() {
  return useQuery<PublicConstituency[]>({
    queryKey: ['public-constituencies'],
    queryFn: async () => {
      const { data } = await api.get('/public/constituencies?limit=1000')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data.data || []).map((c: any) => ({
        id: c.id,
        province: c.province,
        zone_number: c.zoneNumber,
        name: `เขต ${c.zoneNumber} ${c.province}`,
      }))
    },
  })
}

export interface DashboardPartyStat {
  id: number
  name: string
  color: string
  seats: number
  logoUrl: string
  [key: string]: string | number | undefined
}

export interface DashboardConstituencyCandidate {
  voteCount: number
  partyId: number
  partyName: string
  partyColor: string
}

export interface DashboardConstituency {
  province: string
  candidates: DashboardConstituencyCandidate[]
}

export interface DashboardData {
  totalVotes: number
  turnout: number
  countingProgress: number
  partyStats: DashboardPartyStat[]
  constituencies: DashboardConstituency[]
}

export function useDashboardStats() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/public/stats')
      return {
        ...data.data,
        turnout: data.data.turnout || data.data.voteTurnout,
      }
    },
    staleTime: 10000,
  })
}

export function useElectionResults() {
  return useQuery<DashboardData>({
    queryKey: ['election-results'],
    queryFn: async () => {
      const { data } = await api.get('/public/results')
      return data.data
    },
  })
}
