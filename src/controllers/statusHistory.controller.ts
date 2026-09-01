import type { Request, Response } from 'express';
import { statusHistory } from '../data/statusHistory';
import { candidates } from '../data/candidates';
import { parseIdParam } from '../utils/http';

// Shared by handlers that need to resolve + validate a candidate id from the
// route param. Sends the 400/404 itself, so callers just check for
// `undefined` and return — mirrors note.controller.ts's resolveCandidateId.
function resolveCandidateId(req: Request, res: Response): number | undefined {
  const candidateId = parseIdParam(req.params['id'], res, 'candidate');
  if (candidateId === undefined) return undefined;

  if (!candidates.some((c) => c.id === candidateId)) {
    res.status(404).json({ error: `Candidate with id ${candidateId} not found` });
    return undefined;
  }

  return candidateId;
}

export const getStatusHistoryByCandidate = (req: Request, res: Response): void => {
  const candidateId = resolveCandidateId(req, res);
  if (candidateId === undefined) return;

  const history = statusHistory
    .filter((h) => h.candidateId === candidateId)
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());

  res.json(history);
};
