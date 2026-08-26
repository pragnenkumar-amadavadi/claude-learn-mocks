import type { Request, Response } from 'express';
import { candidates, type Candidate } from '../data/candidates';

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

const VALID_STATUSES: Candidate['status'][] = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

function isValidStatus(value: string): value is Candidate['status'] {
  return (VALID_STATUSES as string[]).includes(value);
}

export const getCandidates = (req: Request, res: Response): void => {
  const page = Math.max(1, parseInt(String(req.query['page'] ?? 1), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query['limit'] ?? 10), 10)));

  const search = String(req.query['search'] ?? '').trim().toLowerCase();
  const rawStatus = req.query['status'];
  const statusFilter = (Array.isArray(rawStatus) ? rawStatus : rawStatus ? [rawStatus] : [])
    .map((s) => String(s))
    .filter(isValidStatus);

  let filtered = candidates;
  if (search) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.position.toLowerCase().includes(search),
    );
  }
  if (statusFilter.length > 0) {
    filtered = filtered.filter((c) => statusFilter.includes(c.status));
  }

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

  const { status } = req.body;
  if (!isValidStatus(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    return;
  }

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

  const results: BulkStatusResult[] = ids.map((rawId: unknown) => {
    const id = Number(rawId);
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) {
      return { id, success: false, error: `Candidate with id ${id} not found` };
    }
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
