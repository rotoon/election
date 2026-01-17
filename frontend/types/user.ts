import { PaginationMeta } from './common'

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
  meta: PaginationMeta
}
