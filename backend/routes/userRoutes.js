import express from 'express';
import User from '../models/User.js';

import authMiddleware from '../middleware/authMiddleware.js';
import axios from 'axios';

const router = express.Router();

const fetchGithubStats = async (username) => {
  try {
    const userRes = await axios.get(`https://api.github.com/users/${username}`);
    const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`);
    
    const totalStars = reposRes.data.reduce((acc, repo) => acc + repo.stargazers_count, 0);
    
    return {
      repos: userRes.data.public_repos.toString(),
      stars: totalStars.toString(),
      contributions: (userRes.data.public_repos + userRes.data.followers).toString() // Simplified
    };
  } catch (error) {
    console.error('Github Fetch Error:', error.message);
    return { repos: 'NA', stars: 'NA', contributions: 'NA' };
  }
};


// Get own profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('invitations.team', 'name')
      .populate('invitations.sender', 'name avatar');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Get specific user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('invitations.team', 'name')
      .populate('invitations.sender', 'name avatar');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.post('/profile/update', authMiddleware, async (req, res) => {
  try {
    const { domain, expertise, isDiscoverable, bio, github, linkedin, skills, avatar, onboarded } = req.body.updates;
    
    let githubStats = { repos: 'NA', stars: 'NA', contributions: 'NA' };
    
    if (github) {
      // Extract username from URL if necessary
      const username = github.includes('/') ? github.split('/').pop() : github;
      githubStats = await fetchGithubStats(username);
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        $set: { 
          domain, 
          expertise,
          isDiscoverable,
          bio, 
          github, 
          linkedin, 
          skills, 
          avatar, 
          onboarded,
          githubStats
        } 
      },
      { new: true }
    );


    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      domain: user.domain,
      expertise: user.expertise,
      isDiscoverable: user.isDiscoverable,
      bio: user.bio,
      github: user.github,
      linkedin: user.linkedin,
      skills: user.skills,
      avatar: user.avatar,
      onboarded: user.onboarded,
      githubStats: user.githubStats
    };



    res.json({ user: userResponse });


  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ error: 'Update failed' });
  }

});

export default router;
