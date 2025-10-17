export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    teacherRegistrationNumber: string;
}

export interface UserFilter {
    name?: string;
    email?: string;
    role?: string;
    teacherRegistrationNumber?: string;
}