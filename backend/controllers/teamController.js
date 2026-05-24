import Team from '../models/Team.js';
import User from '../models/User.js';

export const inviteUser = async (req, res) => {
  try {
    const { teamId, userId, message } = req.body;
    const team = await Team.findById(teamId);

    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.creator.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only leader can invite members' });
    }

    const invitedUser = await User.findById(userId);
    if (!invitedUser) return res.status(404).json({ error: 'User not found' });

    // Check if already in team or already invited
    if (team.members.includes(userId)) {
      return res.status(400).json({ error: 'User already in team' });
    }

    const existingInvite = invitedUser.invitations.find(inv => inv.team.toString() === teamId && inv.status === 'pending');
    if (existingInvite) {
      return res.status(400).json({ error: 'Invitation already sent' });
    }

    invitedUser.invitations.push({
      team: teamId,
      sender: req.userId,
      message
    });

    await invitedUser.save();
    res.json({ message: 'Invitation sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send invitation' });
  }
};

export const handleInvitation = async (req, res) => {
  try {
    const { invitationId, status } = req.body; // status: 'accepted' or 'rejected'
    const user = await User.findById(req.userId);

    const invitation = user.invitations.id(invitationId);
    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });

    invitation.status = status;

    if (status === 'accepted') {
      const team = await Team.findById(invitation.team);
      if (!team) return res.status(404).json({ error: 'Team no longer exists' });

      if (!team.members.includes(req.userId)) {
        team.members.push(req.userId);
        await team.save();
      }
    }

    await user.save();
    res.json({ message: `Invitation ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to handle invitation' });
  }
};

export const createTeam = async (req, res) => {
  try {
    const { name, description, requiredRoles, maxMembers } = req.body;
    const team = new Team({
      name,
      description,
      requiredRoles,
      maxMembers: maxMembers || 100,
      creator: req.userId,
      members: [req.userId]
    });
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team' });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('creator', 'name avatar')
      .populate('members', 'name avatar')
      .populate('requests.user', 'name avatar domain skills github linkedin');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

export const requestToJoin = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { message } = req.body;
    console.log(`Join request from ${req.userId} to team ${teamId}`);
    const team = await Team.findById(teamId);

    
    if (!team) return res.status(404).json({ error: 'Team not found' });
    
    // Check if already a member
    if (team.members.includes(req.userId)) {
      return res.status(400).json({ error: 'Already a member' });
    }
    
    // Check if already requested
    const existingRequest = team.requests.find(r => r.user && r.user.toString() === req.userId);

    if (existingRequest) {
      return res.status(400).json({ error: 'Request already sent' });
    }

    team.requests.push({ user: req.userId, message });
    await team.save();
    res.json({ message: 'Join request sent' });
  } catch (error) {
    console.error('Join Request Error:', error);
    res.status(500).json({ error: 'Failed to send request' });
  }

};

export const handleRequest = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { requestId, status } = req.body; // status: 'accepted' or 'rejected'
    const team = await Team.findById(teamId);

    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.creator.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only leader can handle requests' });
    }

    const request = team.requests.id(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = status;

    if (status === 'accepted') {
      if (!team.members.includes(request.user)) {
        team.members.push(request.user);
      }
    }

    await team.save();
    res.json({ message: `Request ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to handle request' });
  }
};

export const sendTeamMessage = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { text, fileUrl, fileName, fileType } = req.body;
    const team = await Team.findById(teamId);

    if (!team) return res.status(404).json({ error: 'Team not found' });

    // Check if user is a member
    const memberIds = team.members.map(m => m.toString());
    if (!memberIds.includes(req.userId)) {
      return res.status(403).json({ error: 'Not a member of this team' });
    }


    team.messages.push({ sender: req.userId, text, fileUrl, fileName, fileType });
    await team.save();

    // Populate the sender of the newly added message to return it
    const updatedTeam = await Team.findById(teamId).populate('messages.sender', 'name avatar');
    const lastMessage = updatedTeam.messages[updatedTeam.messages.length - 1];

    // Emit real-time message via socket
    const io = req.app.get('io');
    io.to(`team_${teamId}`).emit('receive_message', lastMessage);

    res.json(lastMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getTeamMessages = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId).populate('messages.sender', 'name avatar');
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const memberIds = team.members.map(m => m.toString());
    if (!memberIds.includes(req.userId)) {
      return res.status(403).json({ error: 'Not a member of this team' });
    }


    res.json(team.messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
export const removeMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const team = await Team.findById(teamId);

    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.creator.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only leader can remove members' });
    }

    if (memberId === team.creator.toString()) {
      return res.status(400).json({ error: 'Cannot remove the creator' });
    }

    team.members = team.members.filter(m => m.toString() !== memberId);
    await team.save();

    // Emit event
    const io = req.app.get('io');
    io.to(`team_${teamId}`).emit('member_removed', { memberId, teamId });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove member' });
  }
};

export const getMySentRequests = async (req, res) => {
  try {
    const teams = await Team.find({ 'requests.user': req.userId })
      .populate('creator', 'name avatar')
      .select('name requests creator');
    
    const myRequests = [];
    teams.forEach(team => {
      const reqInfo = team.requests.find(r => {
        const rId = r.user?._id ? r.user._id.toString() : (r.user ? r.user.toString() : '');
        return rId === req.userId;
      });
      if (reqInfo) {
        myRequests.push({
          _id: reqInfo._id,
          teamId: team._id,
          teamName: team.name,
          teamLeader: team.creator?.name,
          message: reqInfo.message,
          status: reqInfo.status,
          createdAt: reqInfo.createdAt
        });
      }
    });
    
    res.json(myRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sent requests' });
  }
};

export const getIncomingRequests = async (req, res) => {
  try {
    const teams = await Team.find({ creator: req.userId })
      .populate('requests.user', 'name avatar domain skills github linkedin')
      .select('name requests');
    
    const incomingRequests = [];
    teams.forEach(team => {
      team.requests.forEach(r => {
        if (r.status === 'pending') {
          incomingRequests.push({
            _id: r._id,
            teamId: team._id,
            teamName: team.name,
            user: r.user,
            message: r.message,
            status: r.status,
            createdAt: r.createdAt
          });
        }
      });
    });
    
    res.json(incomingRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incoming requests' });
  }
};

export const getSentInvites = async (req, res) => {
  try {
    // Find all users who have an invitation from req.userId
    const users = await User.find({ 'invitations.sender': req.userId })
      .populate('invitations.team', 'name');
    
    const sentInvites = [];
    users.forEach(u => {
      u.invitations.forEach(inv => {
        if (inv.sender.toString() === req.userId) {
          sentInvites.push({
            _id: inv._id,
            team: inv.team,
            recipientName: u.name,
            recipientAvatar: u.avatar,
            recipientId: u._id,
            message: inv.message,
            status: inv.status,
            createdAt: inv.createdAt
          });
        }
      });
    });
    
    res.json(sentInvites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sent invites' });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId);

    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.creator.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the team creator/leader can delete the team' });
    }

    await Team.findByIdAndDelete(teamId);

    // Emit event via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`team_${teamId}`).emit('team_deleted', { teamId });
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team' });
  }
};

