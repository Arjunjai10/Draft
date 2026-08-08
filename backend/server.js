import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import versesRouter from './routes/verses.js';
import draftsRouter from './routes/drafts.js';
import battlesRouter from './routes/battles.js';
import matchHistoryRouter from './routes/history.js';
import tournamentsRouter from './routes/tournaments.js';
import socketHandlers from './socketHandlers.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date(),
    db: dbStatus
  });
});

app.use('/api/verses', versesRouter);
app.use('/api/drafts', draftsRouter);
app.use('/api/battles', battlesRouter);
app.use('/api/match-history', matchHistoryRouter);
app.use('/api/tournaments', tournamentsRouter);

// Initialize socket handlers
socketHandlers(io);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/animedraft');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Non-blocking: we log the error but don't exit the process
    console.log('Server is running without MongoDB connection.');
  }
};

// Start connection but don't block server startup
connectDB();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
