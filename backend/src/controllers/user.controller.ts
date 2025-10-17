import { Request, Response } from 'express';
import { prisma } from '../prisma/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Role } from '@prisma/client';
import { UserFilter } from '../@types/userFilter';
import bcrypt from 'bcryptjs';

const isValidRole = (value: string): value is Role => {
    return Object.values(Role).includes(value as Role);
};

export const getUsersByFilter = async (req: Request, res: Response): Promise<any> => {
    const filters: UserFilter = req.body;

    const where: any = {};

    if (filters.name) {
        where.name = {
            contains: filters.name,
            mode: 'insensitive'
        };
    }

    if (filters.email) {
        where.email = {
            contains: filters.email,
            mode: 'insensitive'
        };
    }

    if (filters.teacherRegistrationNumber) {
        where.teacherRegistrationNumber = {
            contains: filters.teacherRegistrationNumber,
            mode: 'insensitive'
        };
    }

    if (filters.role) {
        const roleUpper = filters.role.toUpperCase();
        if (!isValidRole(roleUpper)) {
            const err = new Error('Função de usuário inválida.');
            (err as any).status = 400;
            throw err;
        }
        where.role = roleUpper;
    }

    const users = await prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            teacherRegistrationNumber: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    res.json(users);
};

export const getUserById = async (req: Request, res: Response): Promise<any> => {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, role: true, teacherRegistrationNumber: true, createdAt: true, updatedAt: true },
    });
    if (!user) {
        const err = new Error('Usuário não encontrado');
        (err as any).status = 404;
        throw err;
    }
    res.json(user);
};

export const createUser = async (req: Request, res: Response): Promise<any> => {
    const { name, email, password, role, teacherRegistrationNumber } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role, teacherRegistrationNumber },
            select: { id: true, name: true, email: true, role: true, teacherRegistrationNumber: true, createdAt: true, updatedAt: true },
        });
        res.status(201).json(user);
    } catch (error) {
        console.error('Erro ao criar o usuário:', error);

        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
            const err = new Error('Já existe um usuário com este e-mail');
            (err as any).status = 409;
            throw err;
        }

        if (error instanceof PrismaClientKnownRequestError) {
            const err = new Error((error as any).meta?.message || `Erro do Prisma: ${error.code}`);
            (err as any).status = 500;
            throw err;
        }
        const err = new Error('Erro desconhecido');
        (err as any).status = 500;
        throw err;
    }

};

export const updateUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { name, email, password, teacherRegistrationNumber } = req.body;

    const data: any = { name, email, teacherRegistrationNumber };

    if (password && password.trim() !== '') {
        data.password = await bcrypt.hash(password, 10);
    }

    try {
        const user = await prisma.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, role: true, teacherRegistrationNumber: true, createdAt: true, updatedAt: true },
        });

        res.json(user);
    } catch (error) {
        console.error('Erro ao atualizar o usuário:', error);

        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
            const err = new Error(`O usuário está associado com uma pesquisa (Aluno), ou com uma disciplina (Professor), constraint violada: ${error.meta?.constraint}`);
            (err as any).status = 409;
            throw err;
        }

        if (error instanceof PrismaClientKnownRequestError) {
            const err = new Error((error as any).meta?.message || `Erro do Prisma: ${error.code}`);
            (err as any).status = 500;
            throw err;
        }
        const err = new Error('Erro desconhecido');
        (err as any).status = 500;
        throw err;
    }
};


export const deleteUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        const err = new Error('ID inválido.');
        (err as any).status = 400;
        throw err;
    }

    try {
        await prisma.user.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);

        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
            const err = new Error(`O usuario está associado com uma pesquisa (Aluno), ou com uma disciplina (Professor), constraint violada: ${error.meta?.constraint}`);
            (err as any).status = 409;
            throw err;
        }
        if (error instanceof PrismaClientKnownRequestError) {
            const err = new Error((error as any).meta?.message || `Erro do Prisma: ${error.code}`);
            (err as any).status = 500;
            throw err;
        }
        const err = new Error('Erro desconhecido');
        (err as any).status = 500;
        throw err;
    }

};
