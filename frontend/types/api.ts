/**
 * API Response Types (camelCase format from backend)
 * These match the raw API response structure before transformation
 */

export interface ApiConstituency {
  id: number;
  province: string;
  zoneNumber: number;
  isPollOpen: boolean;
}

export interface ApiCandidate {
  id: number;
  firstName: string;
  lastName: string;
  candidateNumber: number;
  imageUrl: string;
  personalPolicy: string;
  party?: ApiPartyInCandidate;
}

export interface ApiPartyInCandidate {
  id: number;
  name: string;
  logoUrl: string;
  color: string;
  policy?: string;
}

export interface ApiParty {
  id: number;
  name: string;
  logoUrl: string | null;
  policy: string | null;
  color: string | null;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}
