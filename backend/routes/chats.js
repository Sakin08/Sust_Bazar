import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getUserChats,
  getOrCreateChat,
  getChatMessages
} from '../controllers/chatController.js';

const router = express.Router();

router.get('/', authenticate, getUserChats);
router.post('/create', authenticate, getOrCreateChat);
router.get('/:chatId/messages', authenticate, getChatMessages);

export default router;
