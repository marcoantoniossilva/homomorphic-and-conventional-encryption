export interface ResearchFilter {
    name?: string;
    courseId?: number;
    teacherId?: number;
    status?: string;
    initialDeadline?: Date;
    finalDeadline?: Date;
}