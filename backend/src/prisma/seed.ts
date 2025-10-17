import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

    await prisma.answer.deleteMany({});
    await prisma.question.deleteMany({});
    await prisma.research.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Dados apagados, iniciando o seed...');

    const hashedPassword = await bcrypt.hash('123456', 10);

    await prisma.user.create({
        data: {
            name: 'Administrador', email: 'admin@email.com', password: hashedPassword, role: 'ADMINISTRADOR'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Aluno 1', email: 'aluno1@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Aluno 2', email: 'aluno2@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Aluno 3', email: 'aluno3@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    const teacherId = await prisma.user.create({
        data: {
            name: 'Professor de Banco de Dados', email: 'professor@email.com', password: hashedPassword, role: 'PROFESSOR'
        },
        select: {
            id: true
        }
    });

    const course = await prisma.course.create({
        data: {
            name: 'Banco de Dados', teacherId: teacherId.id
        },
        select: {
            id: true
        }
    });

    await prisma.research.create({
        data: {
            title: "Pesquisa de Banco de Dados 2025.2",
            courseId: course.id,
            deadline: new Date('2025-12-31'),
            status: "ABERTA",
            questions: {
                create: [
                    {
                        text: "O professor demonstrou compreensão da disciplina",
                        answerType: "ESCALA_NUMERICA"
                    },
                    {
                        text: "A disciplina é interessante?",
                        answerType: "SIM_NAO"
                    }
                ]
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

    console.log('Dados inseridos com sucesso!');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
