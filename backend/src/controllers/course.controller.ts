import { Request, Response } from 'express';
import { prisma } from '../prisma/prisma';
import { CourseFilter } from '../@types/courseFilter';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const getAll = async (req: Request, res: Response): Promise<any> => {
    const courses = await prisma.course.findMany({
        include: { teacher: true },
        orderBy: {
            updatedAt: 'desc'
        }
    })
    if (!courses) {
        const err = new Error('Disciplina não encontrada');
        (err as any).status = 404;
        throw err;
    }
    res.json(courses);
};

export const getCoursesByFilter = async (req: Request, res: Response): Promise<any> => {
    const filters: CourseFilter = req.body;

    const where: any = {};

    if (filters.name) {
        where.name = {
            contains: filters.name,
            mode: 'insensitive'
        };
    }

    if (filters.teacherId) {
        where.teacherId = Number(filters.teacherId);
    }

    const courses = await prisma.course.findMany({
        where,
        include: { teacher: true },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    res.json(courses);
};

export const getCourseById = async (req: Request, res: Response): Promise<any> => {
    const id = Number(req.params.id);
    const course = await prisma.course.findUnique({
        where: { id },
        select: { id: true, name: true, teacherId: true, createdAt: true, updatedAt: true },
    });
    if (!course) {
        const err = new Error('Disciplina não encontrada');
        (err as any).status = 404;
        throw err;
    }
    res.json(course);
};

export const createCourse = async (req: Request, res: Response): Promise<any> => {
    const { name, teacherId } = req.body;
    try {
        const course = await prisma.course.create({
            data: { name, teacherId },
            select: { id: true, name: true, teacherId: true, createdAt: true, updatedAt: true },
        });
        res.status(201).json(course);
    } catch (error) {
        console.error('Erro ao criar a disciplina:', error);

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

export const updateCourse = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { name, teacherId } = req.body;

    const data: any = { name, teacherId };

    try {
        const course = await prisma.course.update({
            where: { id },
            data,
            select: { id: true, name: true, teacherId: true, createdAt: true, updatedAt: true },
        });

        res.json(course);
    } catch (error) {
        console.error('Erro ao atualizar a disciplina:', error);

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


export const deleteCourse = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        const err = new Error('ID inválido.');
        (err as any).status = 400;
        throw err;
    }

    try {
        await prisma.course.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir disciplina:', error);

        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
            const err = new Error(`A disciplina está associada com uma pesquisa, constraint violada: ${error.meta?.constraint}`);
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
