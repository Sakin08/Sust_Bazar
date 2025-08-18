import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User, Chat, Message } from './models/index.js';

let io; // <- declare io in module scope

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

  return io;
}

// Add this line so other files can import io
export { io };
