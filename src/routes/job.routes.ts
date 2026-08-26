import { Router } from 'express';
import { getJobs, getJobById, submitApplication } from '../controllers/job.controller';

const router = Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/:jobId/applications', submitApplication);

export default router;
