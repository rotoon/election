export interface Party {
  id: number
  name: string
  logoUrl: string
  logo_url?: string
  color: string
  policy: string
}

export interface PartyStats {
  id: number
  name: string
  logo_url: string | null
  color: string | null
  policy: string | null
  mpCount: number
}
