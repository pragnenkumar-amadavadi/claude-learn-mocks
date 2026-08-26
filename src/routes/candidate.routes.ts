import { Router } from 'express';
import { getCandidates, getCandidateById, saveCandidate } from '../controllers/candidate.controller';

const router = Router();

router.get('/', getCandidates);
router.get('/:id', getCandidateById);
router.post('/', saveCandidate);

export default router;
