import type { Request, Response } from 'express';
import { candidates, VALID_STATUSES, type Candidate } from '../data/candidates';
import { statusHistory } from '../data/statusHistory';
import { parseIdParam } from '../utils/http';

// Shared by updateCandidateStatus and bulkUpdateCandidateStatus — only a real
// transition is worth a history entry, not a no-op "update" to the same status.
function recordStatusChange(candidate: Candidate, toStatus: Candidate['status']): void {
  if (candidate.status === toStatus) return;
  statusHistory.push({
    id: statusHistory.length + 1,
    candidateId: candidate.id,
    fromStatus: candidate.status,
    toStatus,
    changedAt: new Date().toISOString(),
  });
}

export const getCandidateById = (req: Request, res: Response): void => {
  const id = parseInt(String(req.params['id'] ?? ''), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid candidate id' });
    return;
  }
  const candidate = candidates.find((c) => c.id === id);
  if (!candidate) {
    res.status(404).json({ error: `Candidate with id ${id} not found` });
    return;
  }
  res.json(candidate);
};

function isValidStatus(value: string): value is Candidate['status'] {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

export const getCandidates = (req: Request, res: Response): void => {
  const page = Math.max(1, parseInt(String(req.query['page'] ?? 1), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query['limit'] ?? 10), 10)));

  const search = String(req.query['search'] ?? '').trim().toLowerCase();
  // Comma-separated, not repeated/bracket query params — Express's default
  // "simple" query parser (Node's querystring) doesn't parse `status[]=` or
  // array-style params into an array, so a single delimited value is what
  // actually survives parsing.
  const rawStatus = String(req.query['status'] ?? '');
  const statusFilter = rawStatus ? rawStatus.split(',').filter(isValidStatus) : [];

  const filtered = candidates.filter(
    (c) =>
      (!search ||
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.position.toLowerCase().includes(search)) &&
      (statusFilter.length === 0 || statusFilter.includes(c.status)),
  );

  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  res.json({
    data,
    total: filtered.length,
    page,
    limit,
    hasMore: start + limit < filtered.length,
  });
};

// No transition graph is enforced here — any candidate can move to any valid
// status. The FE only *offers* sensible next stages via its own status
// control; this endpoint just validates that the target status is a real one.
export const updateCandidateStatus = (req: Request, res: Response): void => {
  const id = parseIdParam(req.params['id'], res, 'candidate');
  if (id === undefined) return;

  const candidate = candidates.find((c) => c.id === id);
  if (!candidate) {
    res.status(404).json({ error: `Candidate with id ${id} not found` });
    return;
  }

  const { status } = req.body;
  if (!isValidStatus(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    return;
  }

  recordStatusChange(candidate, status);
  candidate.status = status;
  res.json(candidate);
};

interface BulkStatusResult {
  id: number;
  success: boolean;
  candidate?: Candidate;
  error?: string;
}

// Partial failure is expected (a stale id in the selection, say) so each id
// gets its own result rather than the whole request succeeding or failing.
export const bulkUpdateCandidateStatus = (req: Request, res: Response): void => {
  const { ids, status } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: 'ids must be a non-empty array' });
    return;
  }

  if (!isValidStatus(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    return;
  }

  const byId = new Map(candidates.map((c) => [c.id, c]));
  const results: BulkStatusResult[] = ids.map((rawId: unknown) => {
    const id = Number(rawId);
    const candidate = byId.get(id);
    if (!candidate) {
      return { id, success: false, error: `Candidate with id ${id} not found` };
    }
    recordStatusChange(candidate, status);
    candidate.status = status;
    return { id, success: true, candidate };
  });

  res.json({ results });
};

export const saveCandidate = (req: Request, res: Response): void => {
  const { name, email, phone, position, status, experience, location, avatarUrl } = req.body;

  if (!name || !email || !phone || !position || !status || experience === undefined || !location) {
    res.status(400).json({ error: 'Missing required fields: name, email, phone, position, status, experience, location' });
    return;
  }

  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    return;
  }

  const newCandidate: Candidate = {
    id: candidates.length + 1,
    name,
    email,
    phone,
    position,
    status,
    experience: Number(experience),
    location,
    avatarUrl: avatarUrl ?? `https://i.pravatar.cc/150?img=${(candidates.length % 70) + 1}`,
    appliedAt: new Date().toISOString(),
  };

  candidates.push(newCandidate);

  res.status(201).json(newCandidate);
};
