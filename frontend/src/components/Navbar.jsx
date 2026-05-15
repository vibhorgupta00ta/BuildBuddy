import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Users, User, Zap, LogOut, PlusSquare, LayoutDashboard, Bell, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user) return;
      try {
        const msgRes = await axios.get('http://localhost:5000/api/messages/unread-count');
        setUnreadMessages(msgRes.data.count);

        const reqRes = await axios.get('http://localhost:5000/api/teams/requests/incoming');
        setPendingRequests(reqRes.data.length);
      } catch (err) {
        // Silently fail
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    window.addEventListener('messages_read', fetchCounts);

    return () => {
      clearInterval(interval);
      window.removeEventListener('messages_read', fetchCounts);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  const navLinks = [
    { path: '/discover', icon: Search, label: 'Discover' },
    { path: '/teams', icon: Users, label: 'Teams' },
    { path: '/requests', icon: Bell, label: 'Requests' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="text-4xl font-black font-display tracking-tighter text-white">BuildBuddy</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-2 glass p-1.5 rounded-full border border-white/10 shadow-2xl">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 relative group ${
                location.pathname === link.path 
                  ? 'bg-white/10 text-white shadow-inner' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <link.icon className="w-4 h-4" />
                {link.label === 'Messages' && unreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-[10px] text-white flex items-center justify-center rounded-full border border-[#0a1622] font-bold animate-pulse">
                    {unreadMessages}
                  </span>
                )}
                {link.label === 'Requests' && pendingRequests > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-brand-accent text-[10px] text-white flex items-center justify-center rounded-full border border-[#0a1622] font-bold animate-bounce">
                    {pendingRequests}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold tracking-wide uppercase">{link.label}</span>
            </Link>
          ))}
          {user && (
            <Link 
              to="/create-team" 
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 ${
                location.pathname === '/create-team'
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <PlusSquare className="w-4 h-4" />
              <span className="text-sm font-bold tracking-wide uppercase">Create</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary !px-6 !py-2.5 !text-sm">
                Join Sync
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-3 glass hover:bg-white/10 px-4 py-2 rounded-full transition-all border border-white/20 group">
                <img 
                  src={user.avatar} 
                  className="w-8 h-8 rounded-full border-2 border-brand-accent/50 group-hover:scale-110 transition-transform" 
                  alt="avatar"
                />
                <span className="hidden sm:inline text-sm font-bold text-white tracking-wide">{user.name.split(' ')[0]}</span>
              </Link>
              <button 
                onClick={handleLogout}

                className="p-2.5 glass rounded-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all border border-white/10"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


