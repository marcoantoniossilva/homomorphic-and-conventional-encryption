import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Verifica se a variável de ambiente está definida
const JWT_SECRET = process.env.JWT_SECRET || 'seusegredoaqui';

// Middleware para verificar token JWT
export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const authHeader = req.headers['authorization'];

    // Esperado: "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        const err = new Error('Nenhum token fornecido.');
        (err as any).status = 403;
        throw err;
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err || !decoded || typeof decoded !== 'object') {
            const err = new Error('Falha ao autenticar o token.');
            (err as any).status = 401;
            throw err;
        }

        const { id, role, email } = decoded as {
            id: number;
            role: string;
            email: string;
        };

        req.userId = id;
        req.userRole = role;
        req.userEmail = email;
        next();
    });
}

// Middleware para verificar permissões com base em papel
export const checkRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            const err = new Error('Acesso negado. Você não tem permissão para esta operação.');
            (err as any).status = 403;
            throw err;
        }
        next();
    };
};

// Função de login
export const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const err = new Error('Email e senha são obrigatórios.');
            (err as any).status = 400;
            throw err;
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            const err = new Error('Usuário não encontrado.');
            (err as any).status = 404;
            throw err;
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            const err = new Error('Senha inválida.');
            (err as any).status = 401;
            throw err;
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: 3600 }
        );

        res.status(200).send({
            auth: true,
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                teacherRegistrationNumber: user.teacherRegistrationNumber
            },
            message: 'Login bem-sucedido!'
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);

        if (error instanceof PrismaClientKnownRequestError) {
            const err = new Error((error as any).meta?.message || `Erro do Prisma: ${error.code}`);
            (err as any).status = 500;
            throw err;
        }

        const status = (error as any).status || 500;
        const message = (error as any).message || 'Erro interno do servidor';

        const err = new Error(message);
        (err as any).status = status;
        throw err;
    }
}