import { Candidate, ManageCandidatesResult } from '@/hooks/types'
import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Hook to fetch Candidates (Voter)
export function useCandidates(constituencyId?: string | number | null) {
  return useQuery({
    queryKey: ['candidates', constituencyId],
    queryFn: async () => {
      const { data } = await api.get('/voter/candidates')

      interface UseCandidatesApiItem {
        id: number
        firstName: string
        lastName: string
        candidateNumber: number
        imageUrl: string
        personalPolicy: string
        party?: {
          id: number
          name: string
          logoUrl: string
          color: string
          policy?: string
        }
      }

      const candidates = data.data?.data || []

      return candidates.map((c: UseCandidatesApiItem) => ({
        ...c,
        id: Number(c.id),
        first_name: c.firstName,
        last_name: c.lastName,
        candidate_number: c.candidateNumber,
        image_url: c.imageUrl,
        personal_policy: c.personalPolicy,
        party: c.party
          ? {
              ...c.party,
              logo_url: c.party.logoUrl,
            }
          : null,
      })) as Candidate[]
    },
  })
}

// Hook to fetch Candidates (Management - fetches all or filtered)
export function useManageCandidates(params: {
  constituencyId?: string | number | null
  partyId?: string | number | null
  page?: number
  limit?: number
}) {
  const { constituencyId, partyId, page = 1, limit = 10 } = params

  return useQuery<ManageCandidatesResult>({
    queryKey: ['manage-candidates', constituencyId, partyId, page, limit],
    queryFn: async () => {
      const queryParams = new URLSearchParams()
      queryParams.set('page', page.toString())
      queryParams.set('limit', limit.toString())

      if (constituencyId && constituencyId !== 'all') {
        queryParams.set('constituencyId', constituencyId.toString())
      }
      if (partyId && partyId !== 'all') {
        queryParams.set('partyId', partyId.toString())
      }

      const { data } = await api.get(`/ec/candidates?${queryParams.toString()}`)

      interface ApiManageCandidate {
        id: number
        firstName: string
        lastName: string
        candidateNumber: number
        imageUrl: string
        personalPolicy: string
        constituencyId: number
        party?: { id: number; name: string; logoUrl: string }
        constituency?: {
          id: number
          province: string
          zoneNumber: number
          isPollOpen: boolean
        }
      }

      const rawCandidates = Array.isArray(data.data) ? data.data : []
      const meta = data.meta || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      const candidates = rawCandidates.map((c: ApiManageCandidate) => ({
        ...c,
        first_name: c.firstName,
        last_name: c.lastName,
        candidate_number: c.candidateNumber,
        image_url: c.imageUrl,
        personal_policy: c.personalPolicy,
        constituency_id: c.constituencyId,
        parties: c.party
          ? {
              ...c.party,
              logo_url: c.party.logoUrl,
            }
          : null,
        constituencies: c.constituency
          ? {
              ...c.constituency,
              province: c.constituency.province,
              zone_number: c.constituency.zoneNumber,
              is_poll_open: c.constituency.isPollOpen,
            }
          : null,
      }))

      return { candidates, meta }
    },
  })
}

interface CreateCandidatePayload {
  first_name: string
  last_name: string
  candidate_number: number
  party_id: number
  constituency_id: number
  image_url: string
  personal_policy: string
}

export function useCreateCandidateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateCandidatePayload) => {
      const apiPayload = {
        firstName: payload.first_name,
        lastName: payload.last_name,
        candidateNumber: payload.candidate_number,
        partyId: payload.party_id,
        constituencyId: payload.constituency_id,
        imageUrl: payload.image_url,
        personalPolicy: payload.personal_policy,
      }
      await api.post('/ec/candidates', apiPayload)
    },
    onSuccess: () => {
      toast.success('เพิ่มผู้สมัครสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['manage-candidates'] })
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
    onError: () => {
      toast.error('เพิ่มผู้สมัครไม่สำเร็จ')
    },
  })
}

export function useDeleteCandidateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/ec/candidates/${id}`)
    },
    onSuccess: () => {
      toast.success('ลบผู้สมัครสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['manage-candidates'] })
    },
    onError: () => toast.error('ลบไม่สำเร็จ'),
  })
}
