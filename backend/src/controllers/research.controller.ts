import { Request, Response } from 'express';
import { prisma } from '../prisma/prisma';
import { ResearchFilter } from '../@types/researchFilter';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AnswerType, ResearchStatus, Question, Answer } from '@prisma/client';
import { decrypt } from "./crypto.controller";
import logger from '../logger/logger';

export const getAll = async (req: Request, res: Response): Promise<any> => {
    try {
        const researches = await prisma.research.findMany({
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                        teacher: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        res.status(200).json(researches);
    } catch (error) {
        console.error('Erro ao buscar as pesquisas:', error);

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

export const getResearchByFilter = async (req: Request, res: Response): Promise<any> => {
    const filters: ResearchFilter = req.body;
    const userId = req.userId;

    try {
        const where: any = {};

        if (filters.name) {
            where.title = {
                contains: filters.name,
                mode: 'insensitive'
            };
        }

        if (filters.courseId) {
            where.courseId = filters.courseId;
        }

        if (filters.teacherId) {
            where.course = {
                teacherId: filters.teacherId
            };
        }

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.initialDeadline || filters.finalDeadline) {
            where.deadline = {};
            if (filters.initialDeadline) {
                where.deadline.gte = new Date(filters.initialDeadline);
            }
            if (filters.finalDeadline) {
                where.deadline.lte = new Date(filters.finalDeadline);
            }
        }

        // Busca pesquisas com questões e curso
        const researches = await prisma.research.findMany({
            where,
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                        teacher: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                questions: {
                    select: { id: true }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        // Mapeia todos os questionIds por pesquisa
        const allQuestionIds = researches.flatMap(r => r.questions.map(q => q.id));

        // Busca as respostas do usuário para essas questões
        const userAnswers = await prisma.answer.findMany({
            where: {
                userId: userId,
                questionId: { in: allQuestionIds }
            },
            select: {
                questionId: true
            }
        });

        const answeredQuestionIds = new Set(userAnswers.map(a => a.questionId));

        // Mapeia: pesquisaId => questionIds
        const researchQuestionMap = new Map<number, number[]>();
        researches.forEach(r => {
            researchQuestionMap.set(r.id, r.questions.map(q => q.id));
        });

        // Conta as respostas por questionId
        const answerCounts = await prisma.answer.groupBy({
            by: ['questionId'],
            where: {
                questionId: { in: allQuestionIds }
            },
            _count: true
        });

        // Mapeia: questionId => quantidade de respostas
        const answerCountMap = new Map<number, number>();
        answerCounts.forEach(ac => {
            answerCountMap.set(ac.questionId, ac._count);
        });

        // Monta resultado final com hasResponded e totalAnswers
        const result = await Promise.all(researches.map(async (r) => {
            const questionIds = researchQuestionMap.get(r.id) || [];

            const uniqueUserAnswers = await prisma.answer.groupBy({
                by: ['userId'],
                where: {
                    questionId: { in: questionIds }
                }
            });

            const totalAnswers = uniqueUserAnswers.length;

            const allAnswered = questionIds.every(qid => answeredQuestionIds.has(qid));

            return {
                ...r,
                hasResponded: allAnswered,
                totalAnswers
            };
        }));

        res.json(result);
    } catch (error) {
        console.error('Erro ao buscar as pesquisas:', error);

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

export const getResearchById = async (req: Request, res: Response): Promise<any> => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        const err = new Error('ID inválido.');
        (err as any).status = 400;
        throw err;
    }

    try {
        const research = await prisma.research.findUnique({
            where: { id },
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                        teacher: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                questions: true
            }
        });

        if (!research) {
            const err = new Error('Pesquisa não encontrada');
            (err as any).status = 404;
            throw err;
        }

        res.status(200).json(research);
    } catch (error) {
        console.error('Erro ao buscar a pesquisa por id:', error);

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


export const createResearch = async (req: Request, res: Response): Promise<any> => {
    const { title, courseId, deadline, questions } = req.body;

    if (!title || !courseId || !deadline || !Array.isArray(questions) || questions.length === 0) {
        const err = new Error('Campos obrigatórios ausentes: título, disciplina, data limite ou perguntas');
        (err as any).status = 400;
        throw err;
    }

    try {
        const research = await prisma.research.create({
            data: {
                title,
                courseId,
                deadline: new Date(deadline),
                questions: {
                    create: questions.map((q: Question) => ({
                        text: q.text,
                        answerType: q.answerType
                    }))
                }
            },
            include: {
                questions: true,
                course: {
                    select: {
                        id: true,
                        name: true,
                        teacher: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json({ research: research, message: 'Pesquisa criada com sucesso' });
    } catch (error) {
        console.error('Erro ao criar pesquisa:', error);

        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
            const err = new Error('Já existe uma pesquisa com este título');
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

export const updateResearch = async (req: Request, res: Response): Promise<any> => {
    const { id, title, courseId, deadline, questions } = req.body;

    try {
        // Verifica se a pesquisa existe
        const existingResearch = await prisma.research.findUnique({
            where: { id },
            include: { questions: true },
        });

        if (!existingResearch) {
            const err = new Error('Pesquisa não encontrada');
            (err as any).status = 404;
            throw err;
        }

        // Verifica se já existem respostas para essa pesquisa
        const hasAnswers = await prisma.answer.findFirst({
            where: {
                question: {
                    researchId: id
                }
            }
        });

        if (hasAnswers) {
            // Se já há respostas, apenas campos simples podem ser atualizados
            const updatedResearch = await prisma.research.update({
                where: { id },
                data: {
                    title,
                    courseId,
                    deadline: new Date(deadline),
                    updatedAt: new Date()
                },
                include: {
                    course: {
                        include: {
                            teacher: true
                        }
                    },
                    questions: true
                }
            });

            return res.status(200).json({
                message: 'Pesquisa atualizada (sem alteração nas perguntas, pois já há respostas).',
                research: updatedResearch
            });
        }

        // Caso não existam respostas, permite substituir as perguntas
        const updatedResearch = await prisma.research.update({
            where: { id },
            data: {
                title,
                courseId,
                deadline: new Date(deadline),
                updatedAt: new Date(),
                questions: {
                    deleteMany: {},
                    create: questions.map((q: Question) => ({
                        text: q.text,
                        answerType: q.answerType,
                    }))
                }
            },
            include: {
                course: {
                    include: {
                        teacher: true
                    }
                },
                questions: true
            }
        });

        return res.status(200).json({
            message: 'Pesquisa atualizada com sucesso.',
            research: updatedResearch
        });
    } catch (error) {
        console.error('Erro ao atualizar a pesquisa:', error);

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


export const deleteResearch = async (req: Request, res: Response): Promise<any> => {
    const researchId = Number(req.params.id);

    if (isNaN(researchId)) {
        const err = new Error('ID inválido.');
        (err as any).status = 400;
        throw err;
    }

    try {
        // Deleta as respostas relacionadas às perguntas dessa pesquisa
        await prisma.answer.deleteMany({
            where: {
                question: {
                    researchId: researchId,
                },
            },
        });

        // Deleta as perguntas da pesquisa
        await prisma.question.deleteMany({
            where: {
                researchId: researchId,
            },
        });

        // Deleta a pesquisa
        await prisma.research.delete({
            where: {
                id: researchId,
            },
        });

        return res.status(200).json({ message: 'Pesquisa deletada com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar pesquisa:', error);

        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
            const err = new Error(`Não foi possível excluir a pesquisa, pois ela possui respostas relacionadas, constraint violada: ${error.meta?.constraint}`);
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


export const updateResearchStatus = async (req: Request, res: Response): Promise<any> => {
    const researchId = Number(req.params.id);

    if (isNaN(researchId)) {
        const err = new Error('ID inválido.');
        (err as any).status = 400;
        throw err;
    }

    const { status }: { status: ResearchStatus } = req.body;

    // Verifica se o status enviado é válido
    const validStatuses: ResearchStatus[] = ['ABERTA', 'ENCERRADA_PRAZO', 'FINALIZADA'];
    if (!validStatuses.includes(status)) {
        const err = new Error('Status inválido');
        (err as any).status = 400;
        throw err;
    }

    if (status === 'FINALIZADA') {

        const research = await prisma.research.findUnique({
            where: { id: researchId },
            include: {
                questions: true,
            }
        });

        if (!research) {
            const err = new Error('Pesquisa não encontrada');
            (err as any).status = 404;
            throw err;
        }

        const results = await Promise.all(
            research.questions.map(async (question) => {
                const answers = await prisma.answer.findMany({
                    where: {
                        questionId: question.id
                    }
                });

                if (answers.length === 1) {
                    const err = new Error('A pesquisa não pode ser finalizada pois apenas uma resposta foi enviada.');
                    (err as any).status = 400;
                    throw err;
                }
            })
        );

    }

    try {
        const updated = await prisma.research.update({
            where: { id: Number(researchId) },
            data: { status: status },
        });

        return res.status(200).json({
            message: 'Status da pesquisa atualizado com sucesso!',
            research: updated,
        });
    } catch (error) {
        console.error('Erro ao atualizar o status da pesquisa:', error);

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

export const getResearchResult = async (req: Request, res: Response): Promise<any> => {
    const researchId = Number(req.params.id);

    if (isNaN(researchId)) {
        const err = new Error('ID inválido.');
        (err as any).status = 400;
        throw err;
    }

    try {
        const research = await prisma.research.findUnique({
            where: { id: researchId },
            include: {
                course: {
                    include: {
                        teacher: true
                    }
                },
                questions: true,
            }
        });

        if (!research) {
            const err = new Error('Pesquisa não encontrada');
            (err as any).status = 404;
            throw err;
        }

        const results = await processResults(research);

        return res.json({
            ...research,
            questions: results
        });

    } catch (error) {
        console.error('Erro ao buscar os resultados da pesquisa:', error);

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

async function processResults(research: any): Promise<any> {
    logger.debug('Iniciando processamento da pesquisa...');
    const inicio = Date.now();

    const results = [];

    for (const question of research.questions) {
        const answers = await prisma.answer.findMany({
            where: {
                questionId: question.id
            }
        });

        await logInfoAnswers(answers);
        
        const total = answers.length;
        const sum = await getSumValues(answers);

        results.push({
            ...question,
            ...sum,
            totalAnswers: total
        });
    }

    const fim = Date.now();
    logger.debug('Finalizado recuperação da pesquisa em ' + (fim - inicio) + 'ms');
    return results;
}

async function getSumValues(answers: Answer[]) {
    let total = 0;
    for (const answer of answers) {
        total += Number(decrypt(answer.value));
    }

    return { sum: total.toString()};
}

async function logInfoAnswers(answers: Answer[]) {

    const question = await prisma.question.findUnique({
        where: {
            id: answers[0].questionId
        }
    });
    if (!question) {
        return;
    }

    logger.debug("\tQuestão: " + question?.text);
    logger.debug("\tTipo de pergunta: " + question.answerType);

    for (const answer of answers) {
        const user = await prisma.user.findUnique({
            where: {
                id: answer.userId
            }
        });

        logger.debug("\t\t" + user?.name + " - " + getAnswerLabel(question.answerType, decrypt(answer.value)));
    };
}

// Função auxiliar para mapear rótulos das opções
function getAnswerLabel(answerType: AnswerType, value: string): string {
    if (answerType === AnswerType.SIM_NAO) {
        return value === '1' ? 'Sim' : 'Não';
    }
    return value.toString();
}