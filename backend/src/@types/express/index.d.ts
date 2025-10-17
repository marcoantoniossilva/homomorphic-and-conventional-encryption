// src/@types/express/index.d.ts
import 'express';

declare module 'express-serve-static-core' {
    export interface Request {
        userId?: number;
        userRole?: string;
        userEmail?: string;
    }
}
