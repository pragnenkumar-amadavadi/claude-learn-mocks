import type { CandidateStatus } from './candidates';

export interface StatusHistoryEntry {
  id: number;
  candidateId: number;
  fromStatus: CandidateStatus;
  toStatus: CandidateStatus;
  changedAt: string;
}

export const statusHistory: StatusHistoryEntry[] = [];
