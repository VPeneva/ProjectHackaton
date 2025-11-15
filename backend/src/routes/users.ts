import { Router } from 'express';
import { getUsers, getUser } from '../controllers/usersController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All user routes are protected
router.use(authMiddleware);

router.get('/', getUsers);
router.get('/:id', getUser);

export default router;
