import { Router } from 'express';
import { getStatusHistoryByCandidate } from '../controllers/statusHistory.controller';

// mergeParams: mounted at '/api/candidates/:id/status-history' in index.ts —
// needs the parent's :id param to reach the controller.
const router = Router({ mergeParams: true });

router.get('/', getStatusHistoryByCandidate);

export default router;
