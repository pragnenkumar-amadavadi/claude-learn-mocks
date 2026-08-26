import { Router } from 'express';
import { getNotesByCandidate, createNote } from '../controllers/note.controller';

// mergeParams: mounted at '/api/candidates/:id/notes' in index.ts — needs the
// parent's :id param to reach the controller.
const router = Router({ mergeParams: true });

router.get('/', getNotesByCandidate);
router.post('/', createNote);

export default router;
