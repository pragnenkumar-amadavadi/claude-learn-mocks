import type { Request, Response } from 'express';
import { jobs } from '../data/jobs';

export const getJobs = (req: Request, res: Response): void => {
  const page = Math.max(1, parseInt(String(req.query['page'] ?? 1), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query['limit'] ?? 12), 10)));

  const start = (page - 1) * limit;
  const data = jobs.slice(start, start + limit);

  res.json({
    data,
    total: jobs.length,
    page,
    limit,
    hasMore: start + limit < jobs.length,
  });
};

export const getJobById = (req: Request, res: Response): void => {
  const id = parseInt(String(req.params['id'] ?? ''), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid job id' });
    return;
  }
  const job = jobs.find((j) => j.id === id);
  if (!job) {
    res.status(404).json({ error: `Job with id ${id} not found` });
    return;
  }
  res.json(job);
};

let nextApplicationId = 1;

export const submitApplication = (req: Request, res: Response): void => {
  const jobId = parseInt(String(req.params['jobId'] ?? ''), 10);
  if (isNaN(jobId)) {
    res.status(400).json({ error: 'Invalid job id' });
    return;
  }
  const job = jobs.find((j) => j.id === jobId);
  if (!job) {
    res.status(404).json({ error: `Job with id ${jobId} not found` });
    return;
  }

  const { name, experience, expectedSalary } = req.body;

  if (!name || experience === undefined || expectedSalary === undefined) {
    res.status(400).json({ error: 'Missing required fields: name, experience, expectedSalary' });
    return;
  }

  if (typeof name !== 'string' || typeof experience !== 'number' || typeof expectedSalary !== 'number') {
    res.status(400).json({ error: 'Invalid field types: name must be a string, experience and expectedSalary must be numbers' });
    return;
  }

  if (experience < 0 || expectedSalary < 0) {
    res.status(400).json({ error: 'experience and expectedSalary must be non-negative' });
    return;
  }

  const application = {
    id: nextApplicationId++,
    jobId,
    status: 'pending' as const,
    appliedAt: new Date().toISOString(),
  };

  res.status(201).json(application);
};
