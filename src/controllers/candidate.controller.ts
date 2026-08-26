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

export const getCandidates = (req: Request, res: Response): void => {
  const page = Math.max(1, parseInt(String(req.query['page'] ?? 1), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query['limit'] ?? 10), 10)));

  const start = (page - 1) * limit;
  const data = candidates.slice(start, start + limit);

  res.json({
    data,
    total: candidates.length,
    page,
    limit,
    hasMore: start + limit < candidates.length,
  });
};

const VALID_STATUSES: Candidate['status'][] = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

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
