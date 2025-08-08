import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { sequelize, User, Message, Chat } from './models/index.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import chatRoutes from './routes/chats.js';
import adminRoutes from './routes/admin.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);

// Socket.IO auth middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user || user.is_banned) return next(new Error('Authentication error'));

    socket.userId = user.id;
    socket.user = user;
    next();
  } catch (err) {
    console.error('Socket auth error:', err);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`✅ User ${socket.user.name} connected`);

  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`📥 User ${socket.user.name} joined chat ${chatId}`);
  });

  socket.on('send_message', async ({ chatId, message }) => {
    try {
      const chat = await Chat.findByPk(chatId);
      if (!chat || (chat.user1_id !== socket.userId && chat.user2_id !== socket.userId)) return;

      const newMessage = await Message.create({
        chat_id: chatId,
        sender_id: socket.userId,
        text: message,
      });

      const messageWithSender = await Message.findByPk(newMessage.id, {
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'name'],
        }],
      });

      io.to(`chat_${chatId}`).emit('receive_message', messageWithSender);

      await chat.update({ updated_at: new Date() });
    } catch (error) {
      console.error('❌ Send message error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ User ${socket.user.name} disconnected`);
  });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    await sequelize.sync({ alter: true });
    console.log('🔄 Database synchronized.');

    const adminEmail = 'admin@student.sust.edu';
    const admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
      });
      console.log('🛠️ Admin user created:', `${adminEmail} / admin123`);
    }

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
