import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

    user = new User({
      email,
      password: hashedPassword,
      name,
      avatar
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      domain: user.domain,
      bio: user.bio,
      github: user.github,
      linkedin: user.linkedin,
      skills: user.skills,
      onboarded: user.onboarded,
      avatar: user.avatar,
      expertise: user.expertise || [],
      isDiscoverable: user.isDiscoverable || false,
      githubStats: user.githubStats
    };



    res.json({ token, user: userResponse });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      domain: user.domain,
      bio: user.bio,
      github: user.github,
      linkedin: user.linkedin,
      skills: user.skills,
      onboarded: user.onboarded,
      avatar: user.avatar,
      expertise: user.expertise || [],
      isDiscoverable: user.isDiscoverable || false,
      githubStats: user.githubStats
    };



    res.json({ token, user: userResponse });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { updates } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      domain: user.domain,
      bio: user.bio,
      github: user.github,
      linkedin: user.linkedin,
      skills: user.skills,
      onboarded: user.onboarded,
      avatar: user.avatar,
      expertise: user.expertise || [],
      isDiscoverable: user.isDiscoverable || false,
      githubStats: user.githubStats
    };



    res.json({ user: userResponse });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
};
