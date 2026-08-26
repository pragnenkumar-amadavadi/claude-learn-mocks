import { Router } from 'express';
import {
  getCandidates,
  getCandidateById,
  saveCandidate,
  updateCandidateStatus,
} from '../controllers/candidate.controller';

const router = Router();

router.get('/', getCandidates);
router.get('/:id', getCandidateById);
router.post('/', saveCandidate);
router.patch('/:id/status', updateCandidateStatus);

export default router;
