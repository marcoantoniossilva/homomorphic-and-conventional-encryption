import { Router } from 'express';
import { login, verifyToken } from '../middlewares/auth';

const router = Router();

// Rota de login
router.post('/login', login);
router.get('/validate-token', verifyToken, (req, res) => {
    res.status(200).send({
        auth: true,
        message: 'Token válido.'
    });
});

export default router;
