import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import pinterestRoutes from './routes/pinterest.js';
import boardRoutes from './routes/boards.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

// ✅ CORS FIRST
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ JSON parser
app.use(express.json());

// ✅ ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/pinterest', pinterestRoutes);
app.use('/api/boards', boardRoutes);

// ✅ CONNECT TO MONGO + START SERVER
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(5000, () => console.log('✅ Server läuft auf Port 5000'));
  })
  .catch(err => console.error('❌ DB-Verbindungsfehler:', err));