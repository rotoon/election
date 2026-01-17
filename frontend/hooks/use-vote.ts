import { ConstituencyResultData, Vote } from '@/hooks/types'
import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Hook to fetch My Vote
export function useMyVote(userId?: string) {
  return useQuery({
    queryKey: ['my-vote', userId],
    queryFn: async () => {
      try {
        const { data } = await api.get('/voter/my-vote')
        const v = data.data
        if (!v) return null
        return {
          ...v,
          candidate_id: v.candidateId,
          user_id: v.userId,
        } as Vote
      } catch {
        return null
      }
    },
    enabled: !!userId,
  })
}

// Mutation to Vote
export function useVoteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      userId: string
      candidateId: string | number
      constituencyId: string | number
    }) => {
      const { data } = await api.post('/voter/vote', {
        candidateId: Number(payload.candidateId),
      })
      return data
    },
    onSuccess: (_, variables) => {
      toast.success('ลงคะแนนเรียบร้อยแล้ว')
      queryClient.invalidateQueries({
        queryKey: ['my-vote', variables.userId],
      })
      queryClient.invalidateQueries({
        queryKey: ['results', variables.constituencyId],
      })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['ec-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'การลงคะแนนล้มเหลว')
    },
  })
}

// Hook to fetch Detailed Results for a Constituency
export function useConstituencyResults(
  constituencyId?: string | number | null,
) {
  return useQuery<ConstituencyResultData>({
    queryKey: ['results', constituencyId],
    queryFn: async () => {
      if (!constituencyId)
        return { pollOpen: false, results: [], totalVotes: 0 }

      const { data } = await api.get(
        `/public/results?constituencyId=${constituencyId}`,
      )
      const apiData = data.data // { isPollOpen, candidates, totalVotes }

      interface ApiCandidateResult {
        candidateId: number
        voteCount: number
        candidateName: string | null
        candidateNumber: number
        partyId: number
        partyName: string
        partyColor: string
        imageUrl: string
      }

      // Map candidates to results with rank
      const mappedResults = (apiData.candidates || []).map(
        (r: ApiCandidateResult, index: number) => ({
          rank: index + 1,
          voteCount: r.voteCount,
          candidate: {
            id: r.candidateId,

            first_name: r.candidateName ? r.candidateName.split(' ')[0] : '',
            last_name: r.candidateName
              ? r.candidateName.split(' ').slice(1).join(' ')
              : '',
            candidate_number: r.candidateNumber,
            image_url: r.imageUrl || '',
            personal_policy: '',
            party: {
              id: r.partyId,
              name: r.partyName,
              logo_url: null,
              color: r.partyColor,
            },
          },
        }),
      )

      return {
        pollOpen: apiData.isPollOpen,
        results: mappedResults,
        totalVotes: apiData.totalVotes,
      }
    },
    enabled: !!constituencyId,
  })
}
