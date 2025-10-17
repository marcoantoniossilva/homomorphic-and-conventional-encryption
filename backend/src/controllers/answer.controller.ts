import { Request, Response } from 'express';
import { prisma } from '../prisma/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { encrypt } from "./crypto.controller";

export const submitAnswers = async (req: Request, res: Response): Promise<any> => {
    const userId = req.userId;
    const { researchId, answers } = req.body;

    if (!userId) {
        const err = new Error('Usuário não autenticado.');
        (err as any).status = 401;
        throw err;
    }

    if (!researchId || !Array.isArray(answers) || answers.length === 0) {
        const err = new Error('Dados inválidos.');
        (err as any).status = 400;
        throw err;
    }

    try {
        // 1. Verifica se a pesquisa existe e está aberta
        const research = await prisma.research.findUnique({
            where: { id: researchId },
            include: { questions: { select: { id: true } } },
        });

        if (!research) {
            const err = new Error('Pesquisa não encontrada.');
            (err as any).status = 404;
            throw err;
        }

        if (research.status !== 'ABERTA') {
            const err = new Error('A pesquisa não está aberta para respostas.');
            (err as any).status = 400;
            throw err;
        }

        const questionIdsFromResearch = research.questions.map(q => q.id);
        const questionIdsFromAnswers = answers.map(a => a.questionId);

        // 2. Verifica se todas as questões pertencem à pesquisa
        const allQuestionsValid = questionIdsFromAnswers.every(id =>
            questionIdsFromResearch.includes(id)
        );

        if (!allQuestionsValid) {
            const err = new Error('Uma ou mais questões não pertencem à pesquisa.');
            (err as any).status = 400;
            throw err;
        }

        // 3. Verifica se o aluno já respondeu alguma das questões
        const existingAnswer = await prisma.answer.findFirst({
            where: {
                userId,
                questionId: { in: questionIdsFromAnswers },
            },
        });

        if (existingAnswer) {
            const err = new Error('Você já respondeu esta pesquisa.');
            (err as any).status = 400;
            throw err;
        }

        // 4. Cria as respostas
        await prisma.answer.createMany({
            data: answers.map(a => ({
                userId,
                questionId: a.questionId,
                value: encrypt(a.value)
            })),
        });

        return res.status(201).json({ message: 'Respostas registradas com sucesso.' });
    } catch (error) {
        console.error('Erro ao registrar respostas:', error);

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
