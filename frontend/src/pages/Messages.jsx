import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, MessageCircle, Plus, Check, X, Shield, Users, Paperclip, FileText, Image as ImageIcon, Search } from 'lucide-react';
import Toast from '../components/Toast';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams(); // Selected user ID from URL
  
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  
  // For action dropdown (Invite/Request)
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [myTeams, setMyTeams] = useState([]); // Teams I lead
  const [theirTeams, setTheirTeams] = useState([]); // Teams they lead
  
  // Media Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Socket
  useEffect(() => {
    if (!user) return;
    
    const newSocket = io('http://localhost:5000');
    
    newSocket.on('connect', () => {
      newSocket.emit('join_user', user.id || user._id);
    });

    newSocket.on('receive_dm', async (msg) => {
      // If we are currently chatting with the sender or receiver
      if (
        (userId && msg.sender === userId) || 
        (userId && msg.sender === (user.id || user._id))
      ) {
        setMessages(prev => [...prev, msg]);
        
        // If it's from the other person, mark as read instantly
        if (msg.sender === userId) {
          try {
            await axios.post(`http://localhost:5000/api/messages/${userId}/read`);
            window.dispatchEvent(new Event('messages_read'));
          } catch (e) {
            console.error(e);
          }
        }
      }
      fetchConversations(); // Update sidebar latest message and unread counts
    });

    newSocket.on('dm_action_updated', ({ messageId, status }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, actionStatus: status } : m));
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [user, userId]);

  // Fetch Conversations Sidebar
  const fetchConversations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/messages/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  // Fetch specific chat history when userId changes
  useEffect(() => {
    if (!user || !userId) {
      setLoading(false);
      return;
    }
    
    const fetchChatData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${userId}`);
        setMessages(res.data.messages || []);
        
        // Find other user details from conversations list, or fetch if new
        let other = conversations.find(c => c.otherUser._id === userId)?.otherUser;
        if (!other) {
          const userRes = await axios.get(`http://localhost:5000/api/users`);
          other = userRes.data.find(u => u._id === userId);
        }
        setSelectedUser(other);

        // Fetch teams for action menu
        const teamsRes = await axios.get('http://localhost:5000/api/teams');
        const myUserId = user.id || user._id;
        setMyTeams(teamsRes.data.filter(t => (t.creator?._id || t.creator) === myUserId));
        setTheirTeams(teamsRes.data.filter(t => (t.creator?._id || t.creator) === userId));

        // Mark as read when opened
        await axios.post(`http://localhost:5000/api/messages/${userId}/read`);
        // Refresh conversations to clear badge locally
        fetchConversations();
        // Tell the Navbar to update its global count instantly
        window.dispatchEvent(new Event('messages_read'));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatData();
  }, [userId, user, conversations.length]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSendMessage = async (e, type = 'text', teamId = null) => {
    if (e) e.preventDefault();
    if (type === 'text' && !newMessage.trim() && !selectedFile) return;

    try {
      setIsUploading(true);
      let fileData = {};

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const uploadRes = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        fileData = uploadRes.data;
      }

      const res = await axios.post(`http://localhost:5000/api/messages/${userId}`, {
        text: type === 'text' ? newMessage : 
              type === 'invite' ? 'I would like to invite you to join my team.' : 
              'I would like to request to join your team.',
        type,
        teamId,
        ...fileData
      });
      
      setNewMessage('');
      setSelectedFile(null);
      setShowActionMenu(false);
    } catch (err) {
      setNotification({ message: 'Failed to send message', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleActionResponse = async (messageId, status) => {
    try {
      await axios.post('http://localhost:5000/api/messages/action', {
        messageId,
        status
      });
      setNotification({ message: `Successfully ${status}`, type: 'success' });
    } catch (err) {
      setNotification({ message: err.response?.data?.error || 'Action failed', type: 'error' });
    }
  };

  if (loading && !conversations.length) {
    return (
      <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto flex justify-center items-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-secondary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const myUserId = user?.id || user?._id;

  const filteredConversations = conversations.filter(conv => 
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      {notification.message && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ message: '', type: 'success' })} 
        />
      )}

      <div className="flex h-[calc(100vh-140px)] gap-6">
        
        {/* SIDEBAR */}
        <div className={`w-full md:w-1/3 glass rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col ${userId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-4">
              <MessageCircle className="w-6 h-6 text-brand-secondary" />
              Inbox
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-brand-secondary transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredConversations.length === 0 ? (
              <p className="text-[#94A3B8] text-center mt-10">
                {searchQuery ? 'No matching conversations.' : 'No conversations yet.'}
              </p>
            ) : (
              filteredConversations.map(conv => (
                <button
                  key={conv._id}
                  onClick={() => navigate(`/messages/${conv.otherUser._id}`)}
                  className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all ${
                    userId === conv.otherUser._id ? 'bg-white/10 border-brand-secondary/50' : 'hover:bg-white/5 border-transparent'
                  } border`}
                >
                  <img src={conv.otherUser.avatar} className="w-12 h-12 rounded-full object-cover" alt="avatar" />
                  <div className="flex-1 overflow-hidden flex flex-col justify-center">
                    <div className="flex justify-between items-center w-full">
                      <h4 className={`truncate ${conv.unreadCount > 0 ? 'text-white font-black text-lg' : 'text-white font-bold'}`}>
                        {conv.otherUser.name}
                      </h4>
                      {conv.unreadCount > 0 && (
                        <div className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ml-2">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-white/90 font-bold' : 'text-[#94A3B8]'}`}>
                      {conv.lastMessage?.type === 'invite' ? '🎟️ Team Invite' : 
                       conv.lastMessage?.type === 'request' ? '🙋 Join Request' : 
                       conv.lastMessage?.text || 'No messages'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className={`w-full md:w-2/3 glass rounded-[2.5rem] border border-white/10 flex flex-col overflow-hidden ${!userId ? 'hidden md:flex justify-center items-center' : 'flex'}`}>
          {!userId ? (
            <div className="text-center opacity-50">
              <MessageCircle className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white">Your Messages</h3>
              <p>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-white/5">
                <button className="md:hidden p-2 bg-white/10 rounded-full" onClick={() => navigate('/messages')}>
                  <X className="w-5 h-5 text-white" />
                </button>
                {selectedUser && (
                  <>
                    <img src={selectedUser.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-brand-secondary" />
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                      <p className="text-[#94A3B8] text-sm flex items-center gap-1">
                        <User className="w-3 h-3" /> {selectedUser.domain}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, index) => {
                  const isMine = msg.sender === myUserId;
                  const isAction = msg.type !== 'text';
                  
                  return (
                    <div key={msg._id || index} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      {/* Standard Text & Media Message */}
                      {!isAction && (
                        <div className={`max-w-[75%] px-5 py-3 rounded-2xl ${isMine ? 'bg-brand-secondary text-white rounded-br-none' : 'bg-white/10 text-white rounded-bl-none'}`}>
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
                      )}

                      {/* Action Message (Invite / Request) */}
                      {isAction && (
                        <div className="max-w-[85%] sm:max-w-[400px] w-full mt-2">
                          <div className={`p-1 rounded-2xl ${msg.type === 'invite' ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20' : 'bg-gradient-to-r from-orange-500/20 to-pink-500/20'} border ${msg.type === 'invite' ? 'border-purple-500/30' : 'border-orange-500/30'} p-5 relative overflow-hidden backdrop-blur-sm`}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.type === 'invite' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                {msg.type === 'invite' ? <Shield className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                              </div>
                              <div>
                                <h4 className="text-white font-bold">{msg.type === 'invite' ? 'Team Invitation' : 'Join Request'}</h4>
                                <p className="text-[#94A3B8] text-xs">For team: <span className="text-white font-medium">{msg.teamId?.name || 'Unknown Team'}</span></p>
                              </div>
                            </div>
                            
                            <p className="text-sm text-white/80 mb-4 italic">"{msg.text}"</p>
                            
                            {/* Action Buttons / Status */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                              {msg.actionStatus === 'pending' ? (
                                !isMine ? (
                                  <div className="flex gap-2">
                                    <button onClick={() => handleActionResponse(msg._id, 'accepted')} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-sm font-bold transition flex justify-center items-center gap-1">
                                      <Check className="w-4 h-4" /> Accept
                                    </button>
                                    <button onClick={() => handleActionResponse(msg._id, 'rejected')} className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-500 py-2 rounded-xl text-sm font-bold transition flex justify-center items-center gap-1">
                                      <X className="w-4 h-4" /> Decline
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-center py-2 bg-white/5 rounded-xl text-[#94A3B8] text-sm font-medium">
                                    Awaiting Response
                                  </div>
                                )
                              ) : (
                                <div className={`text-center py-2 rounded-xl text-sm font-bold ${
                                  msg.actionStatus === 'accepted' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                }`}>
                                  {msg.actionStatus === 'accepted' ? 'Accepted' : 'Declined'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-white/10 relative">
                
                {/* Action Menu (Invites/Requests) */}
                <AnimatePresence>
                  {showActionMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full left-4 mb-4 w-72 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-3 bg-white/5 border-b border-white/10">
                        <h4 className="text-white text-sm font-bold">Quick Actions</h4>
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto p-2">
                        {myTeams.length > 0 && (
                          <div className="mb-2">
                            <div className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider mb-2 px-2">Invite to your team</div>
                            {myTeams.map(t => (
                              <button key={t._id} onClick={() => handleSendMessage(null, 'invite', t._id)} className="w-full text-left p-2 hover:bg-white/5 rounded-xl flex items-center gap-3 group transition">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
                                  <Shield className="w-4 h-4" />
                                </div>
                                <span className="text-white text-sm">{t.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {theirTeams.length > 0 && (
                          <div>
                            <div className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider mb-2 px-2 mt-4">Request to join their team</div>
                            {theirTeams.map(t => (
                              <button key={t._id} onClick={() => handleSendMessage(null, 'request', t._id)} className="w-full text-left p-2 hover:bg-white/5 rounded-xl flex items-center gap-3 group transition">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition">
                                  <Users className="w-4 h-4" />
                                </div>
                                <span className="text-white text-sm">{t.name}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {myTeams.length === 0 && theirTeams.length === 0 && (
                          <div className="p-4 text-center text-[#94A3B8] text-sm">
                            Create a team first to send invites.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={(e) => handleSendMessage(e, 'text')} className="flex items-center gap-3 relative z-10">
                  <button 
                    type="button"
                    onClick={() => setShowActionMenu(!showActionMenu)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${showActionMenu ? 'bg-brand-secondary text-white' : 'bg-white/5 text-[#94A3B8] hover:bg-white/10 hover:text-white'}`}
                  >
                    <Plus className={`w-6 h-6 transition-transform ${showActionMenu ? 'rotate-45' : ''}`} />
                  </button>

                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2 focus-within:border-brand-secondary transition-colors">
                    {/* Selected File Indicator */}
                    {selectedFile && (
                      <div className="flex items-center gap-1 bg-brand-accent/20 text-brand-accent px-2 py-1 rounded-md text-xs truncate max-w-[150px]">
                        {selectedFile.type.startsWith('image/') ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        <span className="truncate">{selectedFile.name}</span>
                        <button type="button" onClick={() => setSelectedFile(null)} className="ml-1 hover:text-white"><X className="w-3 h-3"/></button>
                      </div>
                    )}
                    
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={selectedFile ? "Add a message..." : "Type a message..."}
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

                  <button 
                    type="submit"
                    disabled={(!newMessage.trim() && !selectedFile) || isUploading}
                    className="w-12 h-12 flex-shrink-0 rounded-xl bg-brand-secondary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00D4FF] transition"
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 ml-1" />
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

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
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white/60 text-sm font-medium text-center">
              Click anywhere to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Messages;
