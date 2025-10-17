import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';

import { errorHandler } from './middlewares/errorHandler';
import researchRoutes from './routes/research.routes';
import answerRoutes from './routes/answer.routes';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/courses', courseRoutes);
app.use('/research', researchRoutes);
app.use('/answers', answerRoutes);

// Middleware de erro
app.use(errorHandler);

export default app;
