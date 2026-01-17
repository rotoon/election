import { Candidate } from './candidate'

export interface Vote {
  id: string
  candidate_id: number
  user_id: string
}

export interface ResultItem {
  candidate: Candidate
  voteCount: number
  rank: number
}

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
