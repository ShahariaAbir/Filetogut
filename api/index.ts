import express from 'express';
import cors from 'cors';
import { apiRouter } from '../src/api-router.js';

const app = express();
const corsOptions: cors.CorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use('/api', apiRouter);

export default app;
