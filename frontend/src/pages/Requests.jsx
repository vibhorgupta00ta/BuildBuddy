import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Check, X, Bell, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Requests = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const { user } = useAuth();

  const fetchIncomingRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teams/requests/incoming');
      setIncomingRequests(response.data);
    } catch (error) {
      console.error('Error fetching incoming requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchIncomingRequests();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleAcceptRejectRequest = async (teamId, requestId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/teams/${teamId}/request`, { requestId, status });
      setNotification({ message: `Request ${status} successfully!`, type: 'success' });
      fetchIncomingRequests();
    } catch (error) {
      setNotification({ message: error.response?.data?.error || 'Failed to process request', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-display">
            Team <span className="text-gradient">Requests</span>
          </h1>
          <p className="text-[#94A3B8] text-lg max-w-xl">
            Review and manage requests to join your teams.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => <div key={n} className="h-64 glass animate-pulse rounded-[2rem]" />)}
        </div>
      ) : (
        <div className="space-y-16">
          {user && incomingRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {incomingRequests.map(req => (
                <div key={req._id} className="glass p-6 rounded-[2rem] border border-white/10 flex flex-col gap-4 hover:border-brand-accent/30 transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <img src={req.user?.avatar} alt={req.user?.name} className="w-12 h-12 rounded-full border border-white/20" />
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {req.user?.name}
                        </h3>
                        <p className="text-sm text-[#94A3B8]">{req.user?.domain} • {req.teamName}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {req.user?.github && (
                        <a 
                          href={req.user.github.startsWith('http') ? req.user.github : `https://github.com/${req.user.github}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-[#94A3B8] hover:text-white transition-all border border-white/5"
                          title="GitHub Profile"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        </a>
                      )}
                      {req.user?.linkedin && (
                        <a 
                          href={req.user.linkedin.startsWith('http') ? req.user.linkedin : `https://linkedin.com/in/${req.user.linkedin}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-[#94A3B8] hover:text-[#0077b5] transition-all border border-white/5"
                          title="LinkedIn Profile"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </a>
                      )}
                    </div>
                  </div>
                  {req.message && (
                    <p className="text-sm text-[#94A3B8] italic bg-white/5 p-3 rounded-xl border border-white/5">"{req.message}"</p>
                  )}
                  {req.user?.skills && req.user.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {req.user.skills.slice(0,3).map(skill => (
                        <span key={skill} className="text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3 mt-auto pt-2 border-t border-white/10">
                    <button onClick={() => handleAcceptRejectRequest(req.teamId, req._id, 'accepted')} className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button onClick={() => handleAcceptRejectRequest(req.teamId, req._id, 'rejected')} className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass p-12 rounded-[2.5rem] border border-white/10 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mb-6">
                <Bell className="w-8 h-8 text-brand-accent" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Pending Requests</h2>
              <p className="text-[#94A3B8] max-w-md">You don't have any pending requests to join your teams at the moment.</p>
            </div>
          )}
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

export default Requests;
