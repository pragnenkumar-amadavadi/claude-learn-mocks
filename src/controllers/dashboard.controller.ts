import type { Request, Response } from 'express';
import { candidates, type Candidate } from '../data/candidates';
import { jobs } from '../data/jobs';

const CANDIDATE_STATUSES: Candidate['status'][] = [
  'applied', 'screening', 'interview', 'offer', 'hired', 'rejected',
];

export const getDashboardStats = (_req: Request, res: Response): void => {
  const candidateStatusCounts = CANDIDATE_STATUSES.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as Record<Candidate['status'], number>);

  const now = new Date();
  let hiredThisMonth = 0;

  for (const candidate of candidates) {
    candidateStatusCounts[candidate.status] += 1;

    // No dedicated "hired at" field exists on Candidate — appliedAt is the
    // closest available date, used here as a proxy for when the hire happened.
    if (candidate.status === 'hired') {
      const appliedDate = new Date(candidate.appliedAt);
      if (
        appliedDate.getFullYear() === now.getFullYear() &&
        appliedDate.getMonth() === now.getMonth()
      ) {
        hiredThisMonth += 1;
      }
    }
  }

  const openCandidates =
    candidates.length - candidateStatusCounts.hired - candidateStatusCounts.rejected;

  res.json({
    openCandidates,
    openJobs: jobs.length,
    hiredThisMonth,
    candidateStatusCounts,
  });
};
