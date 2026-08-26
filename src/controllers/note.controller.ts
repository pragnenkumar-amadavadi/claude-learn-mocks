import type { Request, Response } from 'express';
import { notes, type Note } from '../data/notes';
import { candidates } from '../data/candidates';
import { parseIdParam } from '../utils/http';

// Shared by both handlers below: parse the route param and confirm the
// candidate exists, sending the 400/404 itself. Callers just check for
// `undefined` and return.
function resolveCandidateId(req: Request, res: Response): number | undefined {
  const candidateId = parseIdParam(req.params['id'], res, 'candidate');
  if (candidateId === undefined) return undefined;

  if (!candidates.some((c) => c.id === candidateId)) {
    res.status(404).json({ error: `Candidate with id ${candidateId} not found` });
    return undefined;
  }

  return candidateId;
}

export const getNotesByCandidate = (req: Request, res: Response): void => {
  const candidateId = resolveCandidateId(req, res);
  if (candidateId === undefined) return;

  const candidateNotes = notes
    .filter((n) => n.candidateId === candidateId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(candidateNotes);
};

export const createNote = (req: Request, res: Response): void => {
  const candidateId = resolveCandidateId(req, res);
  if (candidateId === undefined) return;

  const { body } = req.body;
  if (!body || typeof body !== 'string' || !body.trim()) {
    res.status(400).json({ error: 'Missing required field: body' });
    return;
  }

  const newNote: Note = {
    id: notes.length + 1,
    candidateId,
    body,
    createdAt: new Date().toISOString(),
  };

  notes.push(newNote);

  res.status(201).json(newNote);
};
