import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import User from './models/User.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Socket.io logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_team', (teamId) => {
    socket.join(`team_${teamId}`);
    console.log(`User ${socket.id} joined team room: team_${teamId}`);
  });

  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${socket.id} joined personal room: user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Pass io to request object
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/user', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

// Generic User Fetching (for Discover page)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({ onboarded: true, isDiscoverable: true }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

