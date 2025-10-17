import { Router } from 'express';
import {
    getUsersByFilter,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from '../controllers/user.controller';
import { verifyToken, checkRole } from '../middlewares/auth';

const router = Router();

// Apenas usuários autenticados acessam essas rotas:
router.use(verifyToken);

router.post('/findByFilter', getUsersByFilter);
router.get('/:id', checkRole(['ADMINISTRADOR', 'USER']), getUserById);
router.post('/create', checkRole(['ADMINISTRADOR']), createUser);
router.put('/:id', checkRole(['ADMINISTRADOR']), updateUser);
router.delete('/:id', checkRole(['ADMINISTRADOR']), deleteUser);

export default router;
