import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'DirectMessage' },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Conversation', ConversationSchema);
