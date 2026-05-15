import Conversation from '../models/Conversation.js';
import DirectMessage from '../models/DirectMessage.js';
import Team from '../models/Team.js';
import User from '../models/User.js';

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.userId })
      .populate('participants', 'name avatar')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    
    // Format to easily find the "other" user and calculate unread count
    const formattedConversations = await Promise.all(conversations.map(async (conv) => {
      const otherUser = conv.participants.find(p => p._id.toString() !== req.userId);
      
      const unreadCount = await DirectMessage.countDocuments({
        conversationId: conv._id,
        sender: otherUser._id,
        read: false
      });

      return {
        ...conv.toObject(),
        otherUser,
        unreadCount
      };
    }));

    res.json(formattedConversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const getGlobalUnreadCount = async (req, res) => {
  try {
    // Find all unread messages where the sender is NOT the current user, 
    // but the message is in a conversation the current user is part of.
    // An easier way is to just query DirectMessage with read: false and where receiver is current user.
    // However, DirectMessage only has conversationId and sender.
    // So we need to find conversations where current user is a participant.
    
    const conversations = await Conversation.find({ participants: req.userId }, '_id');
    const conversationIds = conversations.map(c => c._id);

    const unreadCount = await DirectMessage.countDocuments({
      conversationId: { $in: conversationIds },
      sender: { $ne: req.userId },
      read: false
    });

    res.json({ count: unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global unread count' });
  }
};

export const markConversationAsRead = async (req, res) => {
  try {
    const { userId } = req.params; // The other user's ID
    
    const conversation = await Conversation.findOne({
      participants: { $all: [req.userId, userId] }
    });

    if (conversation) {
      await DirectMessage.updateMany(
        { conversationId: conversation._id, sender: userId, read: false },
        { $set: { read: true } }
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params; // The OTHER user's ID
    
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, userId] }
    });

    if (!conversation) {
      // Return empty if no conversation exists yet
      return res.json({ conversation: null, messages: [] });
    }

    const messages = await DirectMessage.find({ conversationId: conversation._id })
      .populate('teamId', 'name')
      .sort({ createdAt: 1 });

    res.json({ conversation, messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params; // Receiver ID
    const { text, type, teamId, fileUrl, fileName, fileType } = req.body; // type: 'text', 'invite', 'request'

    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, userId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.userId, userId]
      });
      await conversation.save();
    }

    // If it's an action (invite/request), set status to pending
    const actionStatus = (type === 'invite' || type === 'request') ? 'pending' : null;

    const newMessage = new DirectMessage({
      conversationId: conversation._id,
      sender: req.userId,
      text,
      type: type || 'text',
      teamId,
      actionStatus,
      fileUrl,
      fileName,
      fileType
    });

    await newMessage.save();

    conversation.lastMessage = newMessage._id;
    conversation.updatedAt = Date.now();
    await conversation.save();

    // Populate team for real-time emit
    await newMessage.populate('teamId', 'name');

    // Emit socket events
    const io = req.app.get('io');
    io.to(`user_${userId}`).emit('receive_dm', newMessage);
    io.to(`user_${req.userId}`).emit('receive_dm', newMessage);

    res.json(newMessage);
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const handleAction = async (req, res) => {
  try {
    const { messageId, status } = req.body; // status: 'accepted' or 'rejected'
    
    const message = await DirectMessage.findById(messageId).populate('teamId');
    if (!message) return res.status(404).json({ error: 'Message not found' });
    
    // Prevent double processing
    if (message.actionStatus !== 'pending') {
      return res.status(400).json({ error: 'Action already processed' });
    }

    const team = await Team.findById(message.teamId._id);
    if (!team) return res.status(404).json({ error: 'Team no longer exists' });

    // Determine who is joining
    // If it was an 'invite', the sender is the leader, the receiver (req.userId) is joining.
    // If it was a 'request', the sender is joining, the receiver (req.userId) is the leader accepting.
    let userJoiningId = null;

    if (message.type === 'invite') {
      userJoiningId = req.userId;
    } else if (message.type === 'request') {
      // Verify req.userId is the leader
      if (team.creator.toString() !== req.userId) {
        return res.status(403).json({ error: 'Only leader can accept requests' });
      }
      userJoiningId = message.sender;
    }

    message.actionStatus = status;

    if (status === 'accepted') {
      if (team.members.length >= team.maxMembers) {
        return res.status(400).json({ error: 'Team is full' });
      }
      if (!team.members.includes(userJoiningId)) {
        team.members.push(userJoiningId);
        await team.save();
      }
    }

    await message.save();

    // Emit status update to both participants
    const conversation = await Conversation.findById(message.conversationId);
    const io = req.app.get('io');
    
    conversation.participants.forEach(p => {
      io.to(`user_${p.toString()}`).emit('dm_action_updated', { messageId: message._id, status });
    });

    res.json({ message: `Action ${status}`, updatedMessage: message });
  } catch (error) {
    console.error('Handle Action Error:', error);
    res.status(500).json({ error: 'Failed to process action' });
  }
};
