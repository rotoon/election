import { Constituency, ManageConstituenciesResult } from '@/hooks/types'
import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Hook to fetch All Constituencies (Public / Admin / EC)
export function useConstituencies() {
  return useQuery({
    queryKey: ['constituencies'],
    queryFn: async () => {
      const { data } = await api.get('/public/constituencies?limit=1000')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data.data || []).map((c: any) => ({
        ...c,
        zone_number: c.zoneNumber,
        is_poll_open: c.isPollOpen,
      })) as Constituency[]
    },
  })
}

// Hook for EC Control Page with server-side pagination
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
      const meta = data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }

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

// Hook for Admin Constituencies Page
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
      const meta = data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }

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

// Hook to fetch Constituency Status (Poll Open/Closed)
export function useConstituencyStatus(constituencyId?: string | number | null) {
  return useQuery({
    queryKey: ['constituency', constituencyId],
    queryFn: async () => {
      const { data } = await api.get('/voter/constituency')
      const c = data.data
      return {
        is_poll_open: c.isPollOpen,
      }
    },
  })
}

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
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
