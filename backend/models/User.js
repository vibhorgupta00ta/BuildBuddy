
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  domain: { type: String, default: null },
  expertise: [String],
  isDiscoverable: { type: Boolean, default: false },
  onboarded: { type: Boolean, default: false },
  avatar: { type: String },
  bio: { type: String },
  github: { type: String },
  linkedin: { type: String },
  skills: [String],
  githubStats: {
    contributions: { type: String, default: 'NA' },
    stars: { type: String, default: 'NA' },
    repos: { type: String, default: 'NA' }
  },
  invitations: [{
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }


});

export default mongoose.model('User', UserSchema);
