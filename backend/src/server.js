import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message:"Backend is running"
    })
});

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});