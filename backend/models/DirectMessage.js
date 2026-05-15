import mongoose from 'mongoose';

const DirectMessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: '' },
  
  // Action fields for embedded invites/requests
  type: { type: String, enum: ['text', 'invite', 'request'], default: 'text' },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  actionStatus: { type: String, enum: ['pending', 'accepted', 'rejected'], default: null },
  
  // Media attachments
  fileUrl: { type: String },
  fileName: { type: String },
  fileType: { type: String },
  
  read: { type: Boolean, default: false }

}, { timestamps: true });

export default mongoose.model('DirectMessage', DirectMessageSchema);
