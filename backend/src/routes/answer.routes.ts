import { Router } from 'express';
import {
    submitAnswers
} from '../controllers/answer.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Apenas usuários autenticados acessam essas rotas:
router.use(verifyToken);

router.post('/', submitAnswers);

export default router;
