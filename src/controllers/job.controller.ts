import type { Request, Response } from 'express';
import { jobs } from '../data/jobs';
import { candidates, type Candidate } from '../data/candidates';
import { applications, type Application } from '../data/applications';
import { parseIdParam } from '../utils/http';

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

  // Always create a new Candidate for each application, rather than matching an
  // existing one by name — the payload carries no stable identity (email/phone),
  // so name-matching would risk silently merging unrelated applicants who share a
  // name. expectedSalary isn't part of the Candidate model, so it's accepted for
  // validation but not persisted anywhere.
  const newCandidate: Candidate = {
    id: candidates.length + 1,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}+${candidates.length + 1}@applicant.example.com`,
    phone: 'Not provided',
    position: job.title,
    status: 'applied',
    experience,
    location: job.location,
    avatarUrl: `https://i.pravatar.cc/150?img=${(candidates.length % 70) + 1}`,
    appliedAt: new Date().toISOString(),
  };
  candidates.push(newCandidate);

  const application: Application = {
    id: applications.length + 1,
    jobId,
    candidateId: newCandidate.id,
    status: 'pending',
    appliedAt: new Date().toISOString(),
  };
  applications.push(application);

  res.status(201).json({
    id: application.id,
    jobId: application.jobId,
    status: application.status,
    appliedAt: application.appliedAt,
  });
};

export const getJobApplicants = (req: Request, res: Response): void => {
  const jobId = parseIdParam(req.params['id'], res, 'job');
  if (jobId === undefined) return;

  const job = jobs.find((j) => j.id === jobId);
  if (!job) {
    res.status(404).json({ error: `Job with id ${jobId} not found` });
    return;
  }

  const applicantIds = new Set(applications.filter((a) => a.jobId === jobId).map((a) => a.candidateId));
  const applicants = candidates.filter((c) => applicantIds.has(c.id));

  res.json({ data: applicants, total: applicants.length });
};
