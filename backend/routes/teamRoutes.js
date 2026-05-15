import express from 'express';
import { createTeam, getTeams, requestToJoin, handleRequest, sendTeamMessage, getTeamMessages, removeMember, inviteUser, handleInvitation, getMySentRequests, getIncomingRequests, getSentInvites } from '../controllers/teamController.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createTeam);
router.get('/', getTeams);
// Chat routes
router.post('/:teamId/chat', authMiddleware, sendTeamMessage);
router.get('/:teamId/chat', authMiddleware, getTeamMessages);

// Request routes
router.post('/:teamId/request', authMiddleware, requestToJoin);
router.put('/:teamId/request', authMiddleware, handleRequest);
router.get('/requests/incoming', authMiddleware, getIncomingRequests);

// Member management
router.delete('/:teamId/members/:memberId', authMiddleware, removeMember);

export default router;
