import { Router } from 'express';
import {
    getAll,
    getResearchByFilter,
    getResearchById,
    getResearchResult,
    createResearch,
    updateResearch,
    deleteResearch,
    updateResearchStatus
} from '../controllers/research.controller';
import { verifyToken, checkRole } from '../middlewares/auth';

const router = Router();

// Apenas usuários autenticados acessam essas rotas:
router.use(verifyToken);

router.post('/findByFilter', getResearchByFilter);
router.get('/', checkRole(['ADMINISTRADOR', 'ALUNO']), getAll);
router.get('/:id', checkRole(['ADMINISTRADOR', 'ALUNO']), getResearchById);
router.get('/results/:id', checkRole(['ADMINISTRADOR', 'ALUNO']), getResearchResult);
router.post('/create', checkRole(['ADMINISTRADOR']), createResearch);
router.put('/:id', checkRole(['ADMINISTRADOR']), updateResearch);
router.patch('/updateStatus/:id', checkRole(['ADMINISTRADOR']), updateResearchStatus);
router.delete('/:id', checkRole(['ADMINISTRADOR']), deleteResearch);

export default router;
