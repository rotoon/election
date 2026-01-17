import { PaginationMeta } from './common'

export interface Constituency {
  id: number
  province: string
  zone_number: number
  is_poll_open: boolean
}

export interface ManageConstituenciesResult {
  constituencies: Constituency[]
  meta: PaginationMeta
}
