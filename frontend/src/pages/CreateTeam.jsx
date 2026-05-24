import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Rocket, Target, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { API_URL } from '../config';

const CreateTeam = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requiredRoles, setRequiredRoles] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });

  const handleAddRole = (e) => {
    e.preventDefault();
    if (newRole && !requiredRoles.includes(newRole)) {
      setRequiredRoles([...requiredRoles, newRole]);
      setNewRole('');
    }
  };

  const removeRole = (role) => {
    setRequiredRoles(requiredRoles.filter(r => r !== role));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/teams`, { 
        name, 
        description, 
        requiredRoles,
        maxMembers 
      });

      setNotification({ message: 'Team created successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/teams');
      }, 2000);
    } catch (error) {
      console.error('Error creating team:', error);
      setNotification({ message: 'Failed to create team. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen pt-32 pb-12 flex justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full glass p-8 md:p-12 rounded-[2rem] border border-white/10"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-secondary to-brand-accent rounded-2xl flex items-center justify-center">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white font-display">Assemble Your Squad</h2>
            <p className="text-[#94A3B8]">Create a team and recruit top talent.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94A3B8] flex items-center gap-2">
                <Target className="w-4 h-4" /> Team Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 transition-all"
                placeholder="e.g. Dream Team X"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#94A3B8] flex items-center gap-2">
                <Users className="w-4 h-4" /> Team Size
              </label>
              <input
                type="number"
                min="2"
                max="100"
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 transition-all"
                required
              />
            </div>
          </div>


          <div className="space-y-2">
            <label className="text-sm font-medium text-[#94A3B8]">Team Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 transition-all resize-none"
              placeholder="What are you building? What's your vision?"
              required
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-[#94A3B8] flex items-center gap-2">
              <Users className="w-4 h-4" /> Required Roles
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddRole(e)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                placeholder="e.g. Backend Developer"
              />
              <button 
                onClick={handleAddRole}
                type="button"
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <Plus className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {requiredRoles.map((role) => (
                <span key={role} className="flex items-center gap-2 bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/30 px-4 py-2 rounded-full text-sm">
                  {role}
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeRole(role)} />
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-secondary py-5 rounded-[1.5rem] text-lg font-bold shadow-xl shadow-brand-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Launching...' : 'Create Team & Launch'}
          </button>

        </form>
      </motion.div>
      <Toast 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ ...notification, message: '' })} 
      />
    </div>
  );
};


export default CreateTeam;
