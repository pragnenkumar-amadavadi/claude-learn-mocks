import type { Request, Response } from 'express';
import { notes, type Note } from '../data/notes';
import { candidates } from '../data/candidates';

export const getNotesByCandidate = (req: Request, res: Response): void => {
  const candidateId = parseInt(String(req.params['id'] ?? ''), 10);
  if (isNaN(candidateId)) {
    res.status(400).json({ error: 'Invalid candidate id' });
    return;
  }

  const candidateExists = candidates.some((c) => c.id === candidateId);
  if (!candidateExists) {
    res.status(404).json({ error: `Candidate with id ${candidateId} not found` });
    return;
  }

  const candidateNotes = notes
    .filter((n) => n.candidateId === candidateId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(candidateNotes);
};

export const createNote = (req: Request, res: Response): void => {
  const candidateId = parseInt(String(req.params['id'] ?? ''), 10);
  if (isNaN(candidateId)) {
    res.status(400).json({ error: 'Invalid candidate id' });
    return;
  }

  const candidateExists = candidates.some((c) => c.id === candidateId);
  if (!candidateExists) {
    res.status(404).json({ error: `Candidate with id ${candidateId} not found` });
    return;
  }

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
