import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  maxMembers: { type: Number, default: 100 },
  requiredRoles: [String],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  requests: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, default: '' },
    fileUrl: { type: String },
    fileName: { type: String },
    fileType: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }

});

export default mongoose.model('Team', TeamSchema);
