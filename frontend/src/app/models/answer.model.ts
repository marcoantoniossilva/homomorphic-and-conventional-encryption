export interface Answer {
  researchId?: number;
  answers: AnswerFormInput[];
}

export interface AnswerFormInput {
  questionId: number;
  value: string;
}