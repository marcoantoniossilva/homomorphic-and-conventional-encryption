export interface Research {
    id: number;
    title: string;
    courseId: number;
    status: 'ABERTA' | 'ENCERRADA_PRAZO' | 'FINALIZADA';
    deadline: string | Date;
    createdAt: string;
    updatedAt: string;
    hasResponded: boolean;
    course: {
        id: number;
        name: string;
        teacher: {
            id: number;
            name: string;
        };
    };
    questions: Question[];
}

export interface Question {
    id: number;
    researchId: number;
    text: string;
    answerType: 'SIM_NAO' | 'ESCALA_NUMERICA';
    createdAt: string;
    totalAnswers: number;
    sum: string;
}

export interface ResearchFilter {
    title?: string;
    courseId?: number;
    teacherId?: number;
    status?: string;
    initialDeadline?: Date;
    finalDeadline?: Date;
}