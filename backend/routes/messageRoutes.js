import express from 'express';
import { getConversations, getMessages, sendMessage, handleAction, getGlobalUnreadCount, markConversationAsRead } from '../controllers/messageController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations', authMiddleware, getConversations);
router.get('/unread-count', authMiddleware, getGlobalUnreadCount);
router.post('/action', authMiddleware, handleAction);
router.get('/:userId', authMiddleware, getMessages);
router.post('/:userId', authMiddleware, sendMessage);
router.post('/:userId/read', authMiddleware, markConversationAsRead);

export default router;
