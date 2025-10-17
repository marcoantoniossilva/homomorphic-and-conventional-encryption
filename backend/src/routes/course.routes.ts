import { Router } from 'express';
import {
    getAll,
    getCoursesByFilter,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} from '../controllers/course.controller';
import { verifyToken, checkRole } from '../middlewares/auth';

const router = Router();

// Apenas usuários autenticados acessam essas rotas:
router.use(verifyToken);

router.post('/findByFilter', checkRole(['ADMINISTRADOR']), getCoursesByFilter);
router.get('/', getAll);
router.get('/:id', checkRole(['ADMINISTRADOR', 'USER']), getCourseById);
router.post('/create', checkRole(['ADMINISTRADOR']), createCourse);
router.put('/:id', checkRole(['ADMINISTRADOR']), updateCourse);
router.delete('/:id', checkRole(['ADMINISTRADOR']), deleteCourse);

export default router;
