import { PaginationMeta } from './common'

export interface Candidate {
  id: number
  first_name: string
  last_name: string
  candidate_number: number
  national_id?: string
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

export interface ManageCandidatesResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  candidates: any[]
  meta: PaginationMeta
}
