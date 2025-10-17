import { User } from "./user.model";

export interface Course {
    id: number;
    name: string;
    teacher: User;
    createdAt: Date;
    updatedAt: Date;
}

export interface CourseFilter {
    name?: string;
    email?: string;
    teacherId?: number;
}