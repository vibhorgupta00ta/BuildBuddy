import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Rocket, Check, X, MessageSquare, Shield, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openTeamId, setOpenTeamId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchMessages = async (teamId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/teams/${teamId}/chat`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (teamId) => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/teams/${teamId}/chat`, {
        text: newMessage
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      setNotification({ message: 'Failed to send message', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (openTeamId) {
      fetchMessages(openTeamId);
      const interval = setInterval(() => fetchMessages(openTeamId), 5000); // Polling for chat
      return () => clearInterval(interval);
    }
  }, [openTeamId]);


  const fetchTeams = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestJoin = async (teamId) => {
    try {
      await axios.post(`http://localhost:5000/api/teams/${teamId}/request`, { message: 'I would like to join your team!' });
      setNotification({ message: 'Join request sent!', type: 'success' });
      fetchTeams();
    } catch (error) {
      setNotification({ message: error.response?.data?.error || 'Failed to send request', type: 'error' });
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);


  const userId = user?.id || user?._id;

  const myTeams = user ? teams.filter(team => {
    const creatorId = team.creator?._id?.toString() || team.creator?.toString();
    const isCreator = creatorId === userId;
    const isMember = team.members?.some(m => (m._id?.toString() || m.toString()) === userId);
    return isCreator || isMember;
  }) : [];

  const discoverTeams = teams.filter(team => {
    const creatorId = team.creator?._id?.toString() || team.creator?.toString();
    const isCreator = creatorId === userId;
    const isMember = team.members?.some(m => (m._id?.toString() || m.toString()) === userId);
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          team.description.toLowerCase().includes(searchTerm.toLowerCase());
    return !isCreator && !isMember && matchesSearch;
  });

  const TeamCard = ({ team }) => {
    const userId = user?.id || user?._id;
    const creatorId = team.creator?._id?.toString() || team.creator?.toString();
    const isLeader = creatorId === userId;
    const isMember = team.members.some(m => (m._id?.toString() || m.toString()) === userId);
    const spotsLeft = team.maxMembers - team.members.length;

    return (
      <div key={team._id} className="glass rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col hover:border-brand-secondary/30 transition-all group">
        <div className="p-8 flex-1">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-secondary/10 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-brand-secondary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{team.name}</h3>
                <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                  <img src={team.creator?.avatar} className="w-4 h-4 rounded-full" />
                  <span>Leader: {team.creator?.name}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-brand-accent font-bold text-lg">{team.members.length}/{team.maxMembers}</div>
              <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest">Members</div>
            </div>
          </div>

          <p className="text-[#94A3B8] mb-8 line-clamp-2 text-sm">{team.description}</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {team.requiredRoles.map(role => (
              <span key={role} className="text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-white/5 text-[#94A3B8] border border-white/5">
                {role}
              </span>
            ))}
          </div>

          {/* Team Members List */}
          <div className="flex -space-x-3 mb-8">
            {team.members.map(member => (
              <img 
                key={member._id}
                src={member.avatar} 
                className="w-10 h-10 rounded-full border-2 border-[#051424] bg-white/10" 
                title={member.name}
              />
            ))}
            {spotsLeft > 0 && (
              <div className="w-10 h-10 rounded-full border-2 border-[#051424] bg-white/5 flex items-center justify-center text-[10px] text-[#94A3B8] font-bold">
                +{spotsLeft}
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-6 bg-white/5 border-t border-white/5 flex items-center justify-between">
          {isLeader ? (
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-brand-secondary font-bold text-sm">
                <Shield className="w-4 h-4" /> You are the Leader
              </span>
              <button 
                onClick={() => navigate(`/team/${team._id}`)}
                className="text-xs font-bold text-white bg-brand-secondary/20 hover:bg-brand-secondary/40 px-4 py-2 rounded-xl flex items-center gap-2 transition-all border border-brand-secondary/30"
              >
                <Zap className="w-3 h-3" /> Launch Workspace
              </button>
            </div>
          ) : isMember ? (
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-green-400 font-bold text-sm">
                <Check className="w-4 h-4" /> Joined
              </span>
              <button 
                onClick={() => navigate(`/team/${team._id}`)}
                className="text-xs font-bold text-white bg-green-400/10 hover:bg-green-400/20 px-4 py-2 rounded-xl flex items-center gap-2 transition-all border border-green-400/20"
              >
                <Zap className="w-3 h-3" /> Launch Workspace
              </button>
            </div>
          ) : spotsLeft === 0 ? (
            <span className="text-red-400 font-bold text-sm italic">Team Full</span>
          ) : user ? (
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/messages/${creatorId}`)}
                className="btn-secondary px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center"
                title="Message Leader"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              {team.requests?.some(r => (r.user?._id?.toString() || r.user?.toString()) === userId) ? (
                <button 
                  disabled
                  className="bg-white/10 text-[#94A3B8] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-white/10 cursor-not-allowed"
                >
                  <Check className="w-4 h-4" /> Pending
                </button>
              ) : (
                <button 
                  onClick={() => handleRequestJoin(team._id)}
                  className="bg-brand-secondary/20 hover:bg-brand-secondary/40 text-brand-secondary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-brand-secondary/30 transition-all"
                >
                  <Rocket className="w-4 h-4" /> Request to Join
                </button>
              )}
            </div>
          ) : (
            <Link 
              to="/login"
              className="text-brand-accent text-sm font-bold hover:underline underline-offset-4"
            >
              Login to Join →
            </Link>
          )}
        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-display">
            Team <span className="text-gradient">Hub</span>
          </h1>
          <p className="text-[#94A3B8] text-lg max-w-xl">
            Join a squad or manage your own team requests.
          </p>
        </div>
        <Link 
          to={user ? "/create-team" : "/login"} 
          className="btn-secondary px-8 py-4 rounded-2xl flex items-center gap-2 w-fit transition-all hover:scale-105"
        >
          <Rocket className="w-5 h-5" />
          {user ? 'Create Team' : 'Login to Create'}
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative mb-12">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
        <input
          type="text"
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-16 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 transition-all text-lg"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(n => <div key={n} className="h-64 glass animate-pulse rounded-3xl" />)}
        </div>
      ) : (
        <div className="space-y-16">
          {/* My Squads Section */}
          {user && myTeams.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-secondary/30 to-transparent" />
                <h2 className="text-2xl font-bold text-white font-display flex items-center gap-2">
                  <Shield className="w-6 h-6 text-brand-secondary" /> My Squads
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-secondary/30 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {myTeams.map(team => <TeamCard key={team._id} team={team} />)}
              </div>
            </section>
          )}

          {/* Discovery Section */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-accent/30 to-transparent" />
              <h2 className="text-2xl font-bold text-white font-display flex items-center gap-2">
                <Users className="w-6 h-6 text-brand-accent" /> Discover Squads
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-accent/30 to-transparent" />
            </div>
            
            {discoverTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {discoverTeams.map(team => <TeamCard key={team._id} team={team} />)}
              </div>
            ) : (
              <div className="glass p-12 rounded-[2.5rem] border border-white/10 text-center">
                <p className="text-[#94A3B8]">No other teams found. Why not create one?</p>
              </div>
            )}
          </section>
        </div>
      )}

      <Toast 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ ...notification, message: '' })} 
      />
    </div>
  );
};


export default Teams;
