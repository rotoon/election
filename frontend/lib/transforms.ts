/**
 * API response transformers: camelCase → snake_case
 * Centralizes data transformation from API format to frontend format
 */

import type { ApiCandidate, ApiConstituency, ApiParty } from "@/types";

// Constituency transformation
export interface TransformedConstituency {
  id: number;
  province: string;
  zone_number: number;
  is_poll_open: boolean;
}

export function transformConstituency(
  c: ApiConstituency
): TransformedConstituency {
  return {
    id: c.id,
    province: c.province,
    zone_number: c.zoneNumber,
    is_poll_open: c.isPollOpen,
  };
}

export function transformConstituencies(
  data: ApiConstituency[]
): TransformedConstituency[] {
  return data.map(transformConstituency);
}

// Candidate transformation
export interface TransformedCandidate {
  id: number;
  first_name: string;
  last_name: string;
  candidate_number: number;
  image_url: string;
  personal_policy: string;
  party: {
    id: number;
    name: string;
    logo_url: string;
    color: string;
    policy?: string;
  } | null;
}

export function transformCandidate(c: ApiCandidate): TransformedCandidate {
  return {
    id: c.id,
    first_name: c.firstName,
    last_name: c.lastName,
    candidate_number: c.candidateNumber,
    image_url: c.imageUrl,
    personal_policy: c.personalPolicy,
    party: c.party
      ? {
          id: c.party.id,
          name: c.party.name,
          logo_url: c.party.logoUrl,
          color: c.party.color,
          policy: c.party.policy,
        }
      : null,
  };
}

export function transformCandidates(
  data: ApiCandidate[]
): TransformedCandidate[] {
  return data.map(transformCandidate);
}

// Party transformation
export interface TransformedParty {
  id: number;
  name: string;
  logoUrl: string;
  logo_url: string;
  policy: string;
  color: string;
}

export function transformParty(p: ApiParty): TransformedParty {
  return {
    id: p.id,
    name: p.name,
    logoUrl: p.logoUrl || "",
    logo_url: p.logoUrl || "",
    policy: p.policy || "",
    color: p.color || "",
  };
}

export function transformParties(data: ApiParty[]): TransformedParty[] {
  return data.map(transformParty);
}
