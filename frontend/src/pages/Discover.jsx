import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import UserCard from '../components/UserCard';
import { RefreshCw, Zap, Filter, Loader2, Search, Send, Rocket } from 'lucide-react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';


const DOMAINS = [
  { id: 'all', name: 'All Members' },
  { id: 'frontend', name: 'Frontend' },
  { id: 'backend', name: 'Backend' },
  { id: 'fullstack', name: 'Fullstack' },
  { id: 'design', name: 'Design' },
  { id: 'cybersecurity', name: 'Cybersecurity' },
  { id: 'web3', name: 'Web3 / Blockchain' },
  { id: 'python', name: 'Python' },
  { id: 'java springboot', name: 'Java Springboot' },
  { id: 'gen ai', name: 'Gen AI' },
  { id: 'machine learning', name: 'Machine Learning' },
  { id: 'data science', name: 'Data Science' },
  { id: 'data engineering', name: 'Data Engineering' },
  { id: 'software engineering', name: 'Software Engineering' },
  { id: 'robotics', name: 'Robotics' },
  { id: 'aws', name: 'AWS / Cloud' },
  { id: 'cloud ops', name: 'Cloud Ops' },
  { id: 'android ios', name: 'Android / iOS' },
  { id: 'app development', name: 'App Development' },
  { id: 'game development', name: 'Game Development' },
  { id: 'ar vr', name: 'AR / VR' },
];

const Discover = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [invitingUserId, setInvitingUserId] = useState(null);
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        // Filter out current user
        setUsers(response.data.filter(u => u._id !== currentUser?.id));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();

    const fetchMyTeams = async () => {
      if (currentUser) {
        try {
          const res = await axios.get('http://localhost:5000/api/teams');
          const leading = res.data.filter(t => t.creator?._id === currentUser.id);
          setMyTeams(leading);
          if (leading.length > 0) setSelectedTeamId(leading[0]._id);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchMyTeams();
  }, [currentUser]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesFilter = filters.length === 0 || filters.some(f => 
                            (user.expertise && user.expertise.some(e => e.toLowerCase() === f.toLowerCase())) ||
                            (user.domain && user.domain.toLowerCase() === f.toLowerCase()));
      
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (user.skills && user.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
      return matchesFilter && matchesSearch;
    });
  }, [filters, searchTerm, users]);


  const navigate = useNavigate();

  const handleSwipe = (direction) => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  const handleFilterChange = (newFilter) => {
    if (newFilter === 'all') {
      setFilters([]);
    } else {
      setFilters(prev => {
        if (prev.includes(newFilter)) {
          return prev.filter(f => f !== newFilter);
        } else {
          return [...prev, newFilter];
        }
      });
    }
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-secondary animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-32 min-h-screen flex flex-col items-center px-4">
      {/* Header & Filter Bar */}
      <div className="mb-8 text-center w-full max-w-4xl">
        <h2 className="text-4xl mb-6 bg-gradient-to-r from-brand-accent to-brand-secondary bg-clip-text text-transparent font-display font-bold">
          Find Your Match
        </h2>

        {/* Search Input */}
        <div className="relative max-w-xl mx-auto mb-10">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or skill..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentIndex(0);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 transition-all shadow-inner"
          />
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="flex items-center gap-2 mr-4 text-[#94A3B8]">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          {DOMAINS.map((d) => {
            const isSelected = d.id === 'all' ? filters.length === 0 : filters.includes(d.id);
            return (
              <button
                key={d.id}
                onClick={() => handleFilterChange(d.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  isSelected 
                    ? 'bg-brand-accent text-white border-brand-accent shadow-lg shadow-brand-accent/20' 
                    : 'glass border-white/10 text-[#94A3B8] hover:border-white/20'
                }`}
              >
                {d.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full max-w-7xl mx-auto pb-20">
        <AnimatePresence>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-4 h-full"
              >
                <div className="flex-grow w-full h-full">
                  <UserCard user={user} />
                </div>
                <button 
                  onClick={() => navigate(`/messages/${user._id}`)}
                  className="w-full max-w-sm py-4 bg-gradient-to-r from-brand-secondary to-brand-accent rounded-2xl flex items-center justify-center gap-2 text-white font-bold shadow-lg shadow-brand-secondary/20 hover:scale-[1.02] transition-all mt-auto"
                >
                  <Send className="w-5 h-5" />
                  Message
                </button>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center glass p-12 rounded-[2.5rem] border border-white/10 max-w-lg mx-auto"
            >
              <div className="w-20 h-20 bg-brand-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Zap className="w-10 h-10 text-brand-accent animate-pulse" />
              </div>
              <h3 className="text-2xl mb-4 font-display text-white">No more matches</h3>
              <p className="text-[#94A3B8] mb-8">Try a different search or check back later.</p>
              <button 
                onClick={() => { setSearchTerm(''); setFilters([]); }}
                className="btn-secondary flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" /> Start Over
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Toast 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ ...notification, message: '' })} 
      />
    </div>
  );
};


export default Discover;
