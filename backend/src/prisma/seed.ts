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
            name: 'Ana Oliveira', email: 'ana.oliveira@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Bruno Santos', email: 'bruno.santos@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Carla Ferreira', email: 'carla.ferreira@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Diego Ramos', email: 'diego.ramos@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Fernanda Lima', email: 'fernanda.lima@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Rafael Costa', email: 'rafael.costa@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Juliana Pereira', email: 'juliana.pereira@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Lucas Nogueira', email: 'lucas.nogueira@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Mariana Rocha', email: 'mariana.rocha@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Felipe Andrade', email: 'felipe.andrade@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Bianca Torres', email: 'bianca.torres@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Eduardo Lima', email: 'eduardo.lima@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'André Carvalho', email: 'andre.carvalho@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Marina Teixeira', email: 'marina.teixeira@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    await prisma.user.create({
        data: {
            name: 'Gustavo Pereira', email: 'gustavo.pereira@email.com', password: hashedPassword, role: 'ALUNO'
        }
    });

    const teacherId = await prisma.user.create({
        data: {
            name: 'Ricardo Menezes', email: 'ricardo.menezes@email.com', password: hashedPassword, role: 'PROFESSOR'
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
                        text: "O professor deixou claros os objetivos da disciplina.",
                        answerType: "ESCALA_NUMERICA"
                    },
                    {
                        text: "Os conteúdos da disciplina foram apresentados de forma organizada e compreensível.",
                        answerType: "ESCALA_NUMERICA"
                    },
                    {
                        text: "Houve interação adequada entre o professor e os alunos (ex: perguntas, debates, feedback).",
                        answerType: "ESCALA_NUMERICA"
                    },
                    {
                        text: "Os recursos (slides, material de apoio, laboratório, etc.) foram adequados para facilitar o aprendizado.",
                        answerType: "ESCALA_NUMERICA"
                    },
                    {
                        text: "A avaliação (provas, trabalhos) refletiu bem o que foi ensinado na disciplina.",
                        answerType: "ESCALA_NUMERICA"
                    },
                    {
                        text: "A carga de trabalho da disciplina (leitura, trabalhos, estudos) foi adequada às suas possibilidades.",
                        answerType: "ESCALA_NUMERICA"
                    },
                    {
                        text: "A disciplina contribuiu para o seu aprendizado ou desenvolvimento acadêmico.",
                        answerType: "ESCALA_NUMERICA"
                    },
                    {
                        text: "O professor demonstrou domínio do conteúdo e entusiasmo na aula.",
                        answerType: "ESCALA_NUMERICA"
                    },
                    {
                        text: "Os alunos foram motivados a participar e se engajar com a disciplina.",
                        answerType: "ESCALA_NUMERICA"
                    },
                    {
                        text: "De forma geral, eu recomendaria esta disciplina (e este professor) para colegas em semestres futuros.",
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
