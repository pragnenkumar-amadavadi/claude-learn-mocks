import { Router } from 'express';
import { getJobs, getJobById, submitApplication, getJobApplicants } from '../controllers/job.controller';

const router = Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.get('/:id/applicants', getJobApplicants);
router.post('/:jobId/applications', submitApplication);

export default router;
