// RiskRadar Backend - Entry Point
// Module 1: User Management & Access Control

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Middleware
app.use(cors({
  origin: '*', // Allows requests from frontend localhost or Vercel
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'RiskRadar API is running',
    version: '1.0.0 (Module 1: User Management & RBAC)',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, HOST, () => {
  console.log(`===============================================`);
  console.log(`🛡️  RiskRadar Backend API running on http://${HOST}:${PORT}`);
  console.log(`📡 Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`🔐 Module 1 Endpoints: /api/auth & /api/users`);
  console.log(`===============================================`);
});
