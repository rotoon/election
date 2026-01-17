import { ManageUsersResult } from '@/hooks/types'
import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Hook to fetch Users (Admin)
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

// Hook for Admin Users Page with server-side pagination
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

      const rawData = data.data || []
      const meta = data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }

      interface ApiManageUser {
        id: string
        email: string
        fullName: string
        nationalId: string
        role: string
        constituencyId?: number
        createdAt?: string
      }

      const users = rawData.map((u: ApiManageUser) => ({
        id: u.id,
        email: u.email,
        full_name: u.fullName,
        national_id: u.nationalId,
        role: u.role,
        constituency_id: u.constituencyId,
        created_at: u.createdAt,
      }))

      return { users, meta }
    },
  })
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await api.patch(`/admin/users/${userId}/role`, { role })
    },
    onSuccess: () => {
      toast.success('อัปเดตสิทธิ์สำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['manage-users'] })
    },
    onError: () => toast.error('อัปเดตไม่สำเร็จ'),
  })
}
