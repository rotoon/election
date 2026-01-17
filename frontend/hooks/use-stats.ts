import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export interface AdminStats {
  totalVoters: number
  totalConstituencies: number
  totalOfficers: number
  voterChange: number
}

export interface ECStats {
  totalParties: number
  totalCandidates: number
  votedCount: number
  votedPercentage: number
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats')
      return data as AdminStats
    },
  })
}

export function useECStats() {
  return useQuery({
    queryKey: ['ec-stats'],
    queryFn: async () => {
      const { data } = await api.get('/ec/stats')
      return data as ECStats
    },
  })
}
