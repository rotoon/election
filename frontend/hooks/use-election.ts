import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Type definitions
export interface Candidate {
  id: number
  first_name: string
  last_name: string
  candidate_number: number
  image_url: string
  personal_policy: string
  party?: {
    id: number
    name: string
    logo_url: string
    color: string
    policy?: string
  } | null
}

export interface Constituency {
  id: number
  province: string
  zone_number: number
  is_poll_open: boolean
}

export interface PartyStats {
  id: number
  name: string
  logo_url: string | null
  color: string | null
  policy: string | null
  mpCount: number
}

export interface ResultItem {
  candidate: Candidate
  voteCount: number
  rank: number
}

export interface Vote {
  id: string
  candidate_id: number // Changed to number to match backend
  user_id: string
}

// 1. Hook to fetch Candidates
export function useCandidates(constituencyId?: string | number | null) {
  return useQuery({
    queryKey: ['candidates', constituencyId],
    queryFn: async () => {
      // Logic for Voter: Use /api/voter/candidates which uses user's profile
      // ignoring passed constituencyId for security context of the voter
      const { data } = await api.get('/voter/candidates')

      console.log('API Response:', data)

      // Map camelCase to snake_case
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
      console.log('Candidates array:', candidates)

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
    // Only enable if we have a token (implied by usage)
  })
}

// 2. Hook to fetch Constituency Status (Poll Open/Closed)
export function useConstituencyStatus(constituencyId?: string | number | null) {
  return useQuery({
    queryKey: ['constituency', constituencyId],
    queryFn: async () => {
      // Voter endpoint
      const { data } = await api.get('/voter/constituency')
      const c = data.data
      return {
        is_poll_open: c.isPollOpen,
      }
    },
  })
}

// 3. Hook to fetch My Vote
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

// 4. Mutation to Vote
export function useVoteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      userId: string
      candidateId: string | number // Updated to allow number
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
      // Invalidate results? Results are public, heavily cached maybe.
      // But for prototype:
      queryClient.invalidateQueries({
        queryKey: ['results', variables.constituencyId],
      })
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'การลงคะแนนล้มเหลว')
    },
  })
}

// 5. Hook to fetch All Constituencies (Public / Admin / EC)
export function useConstituencies() {
  return useQuery({
    queryKey: ['constituencies'],
    queryFn: async () => {
      // Use public endpoint
      // Ensure limit is high enough
      const { data } = await api.get('/public/constituencies?limit=1000')
      // Map
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data.data || []).map((c: any) => ({
        ...c,
        zone_number: c.zoneNumber,
        is_poll_open: c.isPollOpen,
      })) as Constituency[]
    },
  })
}

// Types for EC control constituencies
export interface ManageConstituenciesMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ManageConstituenciesResult {
  constituencies: Constituency[]
  meta: ManageConstituenciesMeta
}

// 5b. Hook for EC Control Page with server-side pagination
export function useManageConstituencies(params: {
  province?: string | null
  page?: number
  limit?: number
}) {
  const { province, page = 1, limit = 10 } = params

  return useQuery<ManageConstituenciesResult>({
    queryKey: ['manage-constituencies', province, page, limit],
    queryFn: async () => {
      const queryParams = new URLSearchParams()
      queryParams.set('page', page.toString())
      queryParams.set('limit', limit.toString())

      if (province && province !== 'all') {
        queryParams.set('province', province)
      }

      const { data } = await api.get(
        `/ec/control/constituencies?${queryParams.toString()}`,
      )

      const rawData = data.data || []
      const meta = data.meta || { total: 0, page: 1, limit: 20, totalPages: 1 }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const constituencies = rawData.map((c: any) => ({
        ...c,
        zone_number: c.zoneNumber,
        is_poll_open: c.isPollOpen,
      })) as Constituency[]

      return { constituencies, meta }
    },
  })
}

// 5c. Hook for Admin Constituencies Page with server-side pagination
export function useAdminConstituencies(params: {
  province?: string | null
  page?: number
  limit?: number
}) {
  const { province, page = 1, limit = 10 } = params

  return useQuery<ManageConstituenciesResult>({
    queryKey: ['admin-constituencies', province, page, limit],
    queryFn: async () => {
      const queryParams = new URLSearchParams()
      queryParams.set('page', page.toString())
      queryParams.set('limit', limit.toString())

      if (province && province !== 'all') {
        queryParams.set('province', province)
      }

      const { data } = await api.get(
        `/admin/constituencies?${queryParams.toString()}`,
      )

      const rawData = data.data || []
      const meta = data.meta || { total: 0, page: 1, limit: 20, totalPages: 1 }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const constituencies = rawData.map((c: any) => ({
        ...c,
        zone_number: c.zoneNumber,
        is_poll_open: c.isPollOpen,
      })) as Constituency[]

      return { constituencies, meta }
    },
  })
}

// 6. Hook to fetch Detailed Results for a Constituency
export interface ConstituencyResultData {
  pollOpen: boolean
  results: {
    rank: number
    voteCount: number
    candidate: {
      id: number
      first_name: string
      last_name: string
      candidate_number: number
      image_url: string
      personal_policy: string
      party: {
        id: number
        name: string
        logo_url: string | null
        color: string
      } | null
    }
  }[]
  totalVotes: number
}

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
      }

      // Map candidates to results with rank
      const mappedResults = (apiData.candidates || []).map(
        (r: ApiCandidateResult, index: number) => ({
          rank: index + 1,
          voteCount: r.voteCount,
          candidate: {
            id: r.candidateId, // API uses candidateId

            first_name: r.candidateName ? r.candidateName.split(' ')[0] : '',
            last_name: r.candidateName
              ? r.candidateName.split(' ').slice(1).join(' ')
              : '',
            candidate_number: r.candidateNumber,
            image_url: '', // API missing this!
            personal_policy: '', // API missing this!
            party: {
              id: r.partyId,
              name: r.partyName,
              logo_url: null, // API missing logoUrl!
              color: r.partyColor,
            },
          },
        }),
      )

      return {
        pollOpen: apiData.isPollOpen, // API uses isPollOpen
        results: mappedResults,
        totalVotes: apiData.totalVotes,
      }
    },
    enabled: !!constituencyId,
  })
}

// 7. Hook to fetch Party Stats (For Parties Page)
export interface PartyStats {
  id: number
  name: string
  logoUrl: string | null
  logo_url: string | null // compatibility
  color: string | null
  policy: string | null
  mpCount: number
}

export interface ApiPartyItem {
  id: number
  name: string
  logoUrl: string | null
  policy: string | null
  color: string | null
}

// 7. Hook to fetch Party Stats (For Parties Page)
export function usePartyStats() {
  return useQuery<PartyStats[]>({
    queryKey: ['party-stats'],
    queryFn: async () => {
      const { data } = await api.get('/public/parties?limit=1000') // Removed interface def from here
      return (data.data || []).map((p: ApiPartyItem) => ({
        id: p.id,
        name: p.name,
        logoUrl: p.logoUrl,
        logo_url: p.logoUrl,
        policy: p.policy,
        color: p.color,
        mpCount: 0, // Placeholder
      }))
    },
  })
}

// 8. Hook to fetch Parties (Management)
export interface Party {
  id: number
  name: string
  logoUrl: string
  logo_url?: string // For backward compatibility
  color: string
  policy: string
}

export function useParties() {
  return useQuery<Party[]>({
    queryKey: ['parties'],
    queryFn: async () => {
      const { data } = await api.get('/ec/parties?limit=1000')
      return (data.data || []).map((p: ApiPartyItem) => ({
        id: p.id,
        name: p.name,
        logoUrl: p.logoUrl,
        logo_url: p.logoUrl, // Map for compatibility
        policy: p.policy,
        color: p.color,
      }))
    },
  })
}

// 9. Mutation to Toggle Poll
export interface PartyPayload {
  name: string
  logo_url: string
  policy: string
  color: string
}

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
}

export function useCreatePartyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: PartyPayload) => {
      const apiPayload = {
        name: payload.name,
        logoUrl: payload.logo_url,
        policy: payload.policy,
        color: payload.color,
      }
      await api.post('/ec/parties', apiPayload)
    },
    onSuccess: () => {
      toast.success('เพิ่มพรรคสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['parties'] })
      queryClient.invalidateQueries({ queryKey: ['party-stats'] })
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'เพิ่มพรรคไม่สำเร็จ')
    },
  })
}

export function useUpdatePartyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number
      payload: PartyPayload
    }) => {
      const apiPayload = {
        name: payload.name,
        logoUrl: payload.logo_url,
        policy: payload.policy,
        color: payload.color,
      }
      await api.put(`/ec/parties/${id}`, apiPayload)
    },
    onSuccess: () => {
      toast.success('แก้ไขข้อมูลสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['parties'] })
      queryClient.invalidateQueries({ queryKey: ['party-stats'] })
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'แก้ไขไม่สำเร็จ')
    },
  })
}

export function useDeletePartyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/ec/parties/${id}`)
    },
    onSuccess: () => {
      toast.success('ลบพรรคสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['parties'] })
      queryClient.invalidateQueries({ queryKey: ['party-stats'] })
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'ลบไม่สำเร็จ')
    },
  })
}

export function useTogglePollMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isOpen }: { id: number; isOpen: boolean }) => {
      await api.patch(`/ec/control/${id}`, { isPollOpen: isOpen })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['constituencies'] })
      queryClient.invalidateQueries({ queryKey: ['constituency'] })
      queryClient.invalidateQueries({ queryKey: ['results'] })
      toast.success('บันทึกสถานะเรียบร้อย')
    },
    onError: () => toast.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ'),
  })
}

export function useOpenAllPollsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.post('/ec/control/open-all')
    },
    onSuccess: () => {
      toast.success('เปิดหีบเลือกตั้งทั้งหมดแล้ว')
      queryClient.invalidateQueries({ queryKey: ['constituencies'] })
    },
    onError: () => toast.error('เกิดข้อผิดพลาดในการเปิดหีบ'),
  })
}

export function useCloseAllPollsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.post('/ec/control/close-all')
    },
    onSuccess: () => {
      toast.success('ปิดหีบเลือกตั้งทั้งหมดแล้ว')
      queryClient.invalidateQueries({ queryKey: ['constituencies'] })
    },
    onError: () => toast.error('เกิดข้อผิดพลาดในการปิดหีบ'),
  })
}

export function useCreateConstituencyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { province: string; zoneNumber: number }) => {
      await api.post('/admin/constituencies', payload)
    },
    onSuccess: () => {
      toast.success('เพิ่มเขตเลือกตั้งสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['constituencies'] })
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'เพิ่มเขตเลือกตั้งไม่สำเร็จ')
    },
  })
}

export function useDeleteConstituencyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/constituencies/${id}`)
    },
    onSuccess: () => {
      toast.success('ลบเขตเลือกตั้งสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['constituencies'] })
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'ลบไม่สำเร็จ')
    },
  })
}

// Types for paginated response
export interface ManageCandidatesMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ManageCandidatesResult {
  candidates: any[]
  meta: ManageCandidatesMeta
}

// 12. Hook to fetch Candidates (Management - fetches all or filtered)
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

      // Handle different response structures
      // API returns: { success: true, data: [...array], meta: {...} }
      const rawCandidates = Array.isArray(data.data) ? data.data : []
      const meta = data.meta || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      console.log('Meta:', meta)

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

// 11. Mutation to Create Candidate
export function useCreateCandidateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateCandidatePayload) => {
      // Map payload snake -> camel
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
    onError: (error) => {
      console.error(error)
      toast.error('เพิ่มผู้สมัครไม่สำเร็จ')
    },
  })
}

// 12. Mutation to Delete Candidate
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

// 13. Hook to fetch Users (Admin)
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users?limit=1000')
      interface ApiUser {
        nationalId: string
        fullName: string
        constituencyId: number
        createdAt: string
      }
      return (data.data || []).map((u: ApiUser) => ({
        ...u,
        national_id: u.nationalId,
        full_name: u.fullName,
        constituency_id: u.constituencyId,
        created_at: u.createdAt,
      }))
    },
  })
}

// Types for admin users
export interface ManageUsersMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ManageUser {
  id: string
  email: string
  full_name: string
  national_id: string
  role: string
  constituency_id?: number
  created_at?: string
}

export interface ManageUsersResult {
  users: ManageUser[]
  meta: ManageUsersMeta
}

// 13b. Hook for Admin Users Page with server-side pagination
export function useManageUsers(params: {
  role?: string | null
  page?: number
  limit?: number
}) {
  const { role, page = 1, limit = 10 } = params

  return useQuery<ManageUsersResult>({
    queryKey: ['manage-users', role, page, limit],
    queryFn: async () => {
      const queryParams = new URLSearchParams()
      queryParams.set('page', page.toString())
      queryParams.set('limit', limit.toString())

      if (role && role !== 'all') {
        queryParams.set('role', role)
      }

      const { data } = await api.get(`/admin/users?${queryParams.toString()}`)

      interface ApiUser {
        id: string
        email: string
        nationalId: string
        fullName: string
        constituencyId: number
        createdAt: string
        role: string
      }

      const rawData = data.data || []
      const meta = data.meta || { total: 0, page: 1, limit: 20, totalPages: 1 }

      const users = rawData.map((u: ApiUser) => ({
        ...u,
        national_id: u.nationalId,
        full_name: u.fullName,
        constituency_id: u.constituencyId,
        created_at: u.createdAt,
      })) as ManageUser[]

      return { users, meta }
    },
  })
}

// 14. Mutation to Update User Role
export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await api.patch(`/admin/users/${userId}/role`, { role })
    },
    onSuccess: () => {
      toast.success('อัปเดตสิทธิ์สำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => toast.error('อัปเดตไม่สำเร็จ'),
  })
}

// Public Hooks
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

// 15. Hook to fetch Dashboard Stats (Public)
export interface DashboardPartyStat {
  id: number
  name: string
  color: string
  seats: number
  logoUrl: string // Required per page.tsx
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
  turnout: number // Changed from voteTurnout
  countingProgress: number
  partyStats: DashboardPartyStat[]
  constituencies: DashboardConstituency[]
}

export function useDashboardStats() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/public/stats')
      // Map API response to DashboardData if needed, or assume backend matches.
      // Assuming backend returns correctly named fields:
      return {
        ...data.data,
        turnout: data.data.turnout || data.data.voteTurnout, // Fallback safely
      }
    },
    // refetchInterval: 30000, // Refresh every 30s
    staleTime: 10000, // Cache data for 10 seconds
  })
}

// 16. Hook to fetch All Results (for Map)
export function useElectionResults() {
  return useQuery<DashboardData>({
    queryKey: ['election-results'],
    queryFn: async () => {
      const { data } = await api.get('/public/results')
      return data.data
    },
    // refetchInterval: 30000,
  })
}
