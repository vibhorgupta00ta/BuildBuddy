import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Send, ArrowLeft, Shield, Check, User, Code, Star, Zap, Terminal, UserMinus, Paperclip, FileText, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import Toast from '../components/Toast';
import { BASE_URL, API_URL } from '../config';

const TeamWorkspace = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);
  
  // Media Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  const fetchTeamData = async () => {
    try {
      const teamRes = await axios.get(`${API_URL}/teams`);
      const currentTeam = teamRes.data.find(t => t._id === teamId);
      
      if (!currentTeam) {
        navigate('/teams');
        return;
      }

      // Check if user is a member
      const isMember = currentTeam.members.some(m => m._id === user?.id) || currentTeam.creator._id === user?.id;
      if (!isMember) {
        setNotification({ message: 'Access Denied: You are not a member of this team.', type: 'error' });
        setTimeout(() => navigate('/teams'), 2000);
        return;
      }

      setTeam(currentTeam);
      
      const msgRes = await axios.get(`${API_URL}/teams/${teamId}/chat`);
      setMessages(msgRes.data);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();

    // Initialize Socket
    socketRef.current = io(BASE_URL);
    
    socketRef.current.emit('join_team', teamId);

    socketRef.current.on('receive_message', (message) => {
      setMessages(prev => {
        // Prevent duplicate messages (sender already adds it locally)
        const exists = prev.some(m => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
    });

    socketRef.current.on('member_removed', ({ memberId, teamId: removedFromTeamId }) => {
      if (removedFromTeamId === teamId) {
        if (memberId === user?.id) {
          setNotification({ message: 'You have been removed from the team.', type: 'info' });
          setTimeout(() => navigate('/teams'), 3000);
        } else {
          // Update team state for others
          setTeam(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              members: prev.members.filter(m => m._id !== memberId)
            };
          });
        }
      }
    });

    socketRef.current.on('team_deleted', ({ teamId: deletedId }) => {
      if (deletedId === teamId) {
        setNotification({ message: 'This team has been deleted by the leader.', type: 'info' });
        setTimeout(() => navigate('/teams'), 3000);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [teamId]);

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleRemoveMember = async (memberId) => {
    // Extra safety check
    if (user?.id !== team.creator._id) {
      setNotification({ message: 'Only the team leader has the power to remove members.', type: 'error' });
      return;
    }
    
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await axios.delete(`${API_URL}/teams/${teamId}/members/${memberId}`);
      setNotification({ message: 'Member removed successfully', type: 'success' });
      // State will be updated via socket event
    } catch (error) {
      setNotification({ message: error.response?.data?.error || 'Failed to remove member', type: 'error' });
    }
  };

  const handleDeleteTeam = async () => {
    if (user?.id !== team.creator._id) {
      setNotification({ message: 'Only the team leader can delete this team.', type: 'error' });
      return;
    }

    if (!window.confirm('WARNING: Are you sure you want to permanently delete this team? This action cannot be undone.')) return;

    try {
      await axios.delete(`${API_URL}/teams/${teamId}`);
      setNotification({ message: 'Team deleted successfully!', type: 'success' });
      setTimeout(() => navigate('/teams'), 1500);
    } catch (error) {
      setNotification({ message: error.response?.data?.error || 'Failed to delete team', type: 'error' });
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || isSending || isUploading) return;
    setIsSending(true);
    setIsUploading(true);
    
    try {
      let fileData = {};

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        fileData = uploadRes.data;
      }

      const res = await axios.post(`${API_URL}/teams/${teamId}/chat`, {
        text: newMessage,
        ...fileData
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
      setSelectedFile(null);
    } catch (error) {
      setNotification({ message: 'Failed to send message', type: 'error' });
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-[#051424]">
      <div className="max-w-[1600px] mx-auto h-[calc(100vh-120px)] flex gap-6 px-6">
        
        {/* Left Sidebar: Team Members */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 glass rounded-[2rem] border border-white/10 flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 bg-white/5">
            <Link to="/teams" className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-all mb-6 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Hub
            </Link>
            <h2 className="text-2xl font-bold text-white mb-1">{team.name}</h2>
            <div className="flex items-center gap-2 text-brand-secondary text-sm font-bold">
              <Users className="w-4 h-4" />
              {team.members.length} Members Syncing
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-bold px-2 mb-4">The Squad</div>
            
            {/* Leader First */}
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-brand-secondary/10 border border-brand-secondary/20">
              <div className="relative">
                <img src={team.creator.avatar} className="w-12 h-12 rounded-xl border-2 border-brand-secondary" />
                <div className="absolute -top-1 -right-1 bg-brand-secondary rounded-full p-1 shadow-lg">
                  <Shield className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold truncate">{team.creator.name}</div>
                <div className="text-[10px] text-brand-secondary font-black uppercase">Project Lead</div>
              </div>
            </div>

            {/* Other Members */}
            {team.members.filter(m => m._id !== team.creator._id).map(member => (
              <div key={member._id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group">
                <img src={member.avatar} className="w-12 h-12 rounded-xl border border-white/10" />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold truncate group-hover:text-brand-secondary transition-colors">{member.name}</div>
                  <div className="text-[10px] text-[#94A3B8] font-bold uppercase">{member.domain || 'Member'}</div>
                </div>
                {user?.id === team.creator._id && (
                  <button 
                    onClick={() => handleRemoveMember(member._id)}
                    className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Remove from team"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="p-6 bg-white/5 border-t border-white/10">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#94A3B8]">Stack Compatibility</span>
                <span className="text-brand-accent font-bold">94%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-brand-accent w-[94%]" />
              </div>
              {user?.id === team.creator._id && (
                <button 
                  onClick={handleDeleteTeam}
                  className="w-full mt-4 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all font-bold border border-red-500/20 text-xs flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Team
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Section: Private Chat */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 glass rounded-[2rem] border border-white/10 flex flex-col overflow-hidden relative"
        >
          {/* Chat Header */}
          <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-secondary/20 rounded-full flex items-center justify-center border border-brand-secondary/30">
                <Zap className="w-5 h-5 text-brand-secondary animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-bold">Mission Control</h3>
                <div className="text-[10px] text-green-400 font-bold uppercase flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Encrypted Team Channel
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {team.members.slice(0, 3).map(m => (
                  <img key={m._id} src={m.avatar} className="w-8 h-8 rounded-full border-2 border-[#051424]" />
                ))}
              </div>
              {team.members.length > 3 && <span className="text-xs text-[#94A3B8]">+{team.members.length - 3}</span>}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                  <Terminal className="w-8 h-8 text-[#94A3B8]" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">No transmissions yet</h4>
                <p className="text-[#94A3B8] max-w-xs text-sm">This is your team's private sanctuary. Send a message to start building.</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isOwn = msg.sender?._id === user?.id;
                return (
                  <div key={i} className={`flex gap-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <img src={msg.sender?.avatar} className="w-10 h-10 rounded-xl border border-white/10 shadow-lg" />
                    <div className={`max-w-[60%] space-y-1 ${isOwn ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 px-1">
                        {!isOwn && <span className="text-[10px] font-bold text-brand-secondary uppercase">{msg.sender?.name}</span>}
                        <span className="text-[10px] text-[#94A3B8]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`p-4 rounded-2xl shadow-xl text-sm leading-relaxed ${
                        isOwn 
                          ? 'bg-gradient-to-br from-brand-secondary to-brand-purple text-white rounded-tr-none border border-white/10' 
                          : 'glass text-slate-200 rounded-tl-none border border-white/10'
                      }`}>
                        {msg.fileUrl && (
                          <div className="mb-2">
                            {msg.fileType?.startsWith('image/') ? (
                              <img 
                                src={msg.fileUrl} 
                                alt="attachment" 
                                className="rounded-lg max-h-64 object-contain bg-black/20 cursor-zoom-in hover:opacity-90 transition-opacity shadow-lg" 
                                onClick={() => setZoomedImage(msg.fileUrl)}
                              />
                            ) : (
                              <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition">
                                <FileText className="w-6 h-6 text-brand-accent" />
                                <span className="truncate max-w-[200px] text-sm font-medium">{msg.fileName || 'Download File'}</span>
                              </a>
                            )}
                          </div>
                        )}
                        {msg.text && <div>{msg.text}</div>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white/5 border-t border-white/10">
            <form onSubmit={handleSendMessage} className="relative flex gap-4 items-center">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex flex-col focus-within:ring-2 focus-within:ring-brand-secondary/50 transition-all shadow-inner">
                {/* Selected File Indicator */}
                {selectedFile && (
                  <div className="flex items-center gap-1 bg-brand-accent/20 text-brand-accent px-2 py-1 rounded-md text-xs w-fit mb-2">
                    {selectedFile.type.startsWith('image/') ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    <span className="truncate max-w-[150px]">{selectedFile.name}</span>
                    <button type="button" onClick={() => setSelectedFile(null)} className="ml-1 hover:text-white"><X className="w-3 h-3"/></button>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={selectedFile ? "Add a message..." : "Share an idea, a link, or a progress update..."}
                    className="flex-1 bg-transparent text-white focus:outline-none min-w-0"
                    disabled={isUploading}
                  />

                  {/* Hidden File Input & Trigger */}
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#94A3B8] hover:text-white transition-colors"
                    title="Attach file"
                    disabled={isUploading}
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={(!newMessage.trim() && !selectedFile) || isSending || isUploading}
                className="btn-primary h-full px-8 rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <span className="font-bold">Send</span>
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                )}
              </button>
            </form>
          </div>
        </motion.div>

      </div>
      <Toast 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ ...notification, message: '' })} 
      />

      {/* Image Lightbox Overlay */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={() => setZoomedImage(null)}
            >
              <X className="w-6 h-6" />
            </motion.button>
            
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={zoomedImage} 
              alt="Zoomed" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white/60 text-sm font-medium">
              Click anywhere to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default TeamWorkspace;
