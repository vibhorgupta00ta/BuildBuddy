import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Camera, Terminal, Briefcase, Mail, User as UserIcon, Code2, Shield, Plus, X, Layout, Database, Palette, Cpu, ShieldCheck, Save, Loader2, Globe, Binary, Brain, Box, Cloud, Settings, Monitor, Rocket, MessageCircle, ExternalLink, Smartphone, Gamepad2, Glasses } from 'lucide-react';

const DOMAINS = [
  { id: 'frontend', name: 'Frontend', icon: Layout, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'backend', name: 'Backend', icon: Database, color: 'text-green-400', bg: 'bg-green-400/10' },
  { id: 'fullstack', name: 'Fullstack', icon: Code2, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'design', name: 'Design', icon: Palette, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: ShieldCheck, color: 'text-red-400', bg: 'bg-red-400/10' },
  { id: 'web3', name: 'Web3 / Blockchain', icon: Globe, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { id: 'python', name: 'Python', icon: Binary, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'java springboot', name: 'Java Springboot', icon: Settings, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'gen ai', name: 'Gen AI', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'machine learning', name: 'Machine Learning', icon: Cpu, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { id: 'data science', name: 'Data Science', icon: Database, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { id: 'software engineering', name: 'Software Engineering', icon: Monitor, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'robotics', name: 'Robotics', icon: Box, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { id: 'aws', name: 'AWS / Cloud', icon: Cloud, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'cloud ops', name: 'Cloud Ops', icon: Rocket, color: 'text-sky-400', bg: 'bg-sky-400/10' },
  { id: 'android ios', name: 'Android / iOS', icon: Smartphone, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'app development', name: 'App Development', icon: Rocket, color: 'text-orange-600', bg: 'bg-orange-600/10' },
  { id: 'game development', name: 'Game Development', icon: Gamepad2, color: 'text-purple-600', bg: 'bg-purple-600/10' },
  { id: 'ar vr', name: 'AR / VR', icon: Glasses, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
];

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateProfile } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    domain: '',
    expertise: [],
    isDiscoverable: false,
    github: '',
    linkedin: '',
    avatar: '',
    skills: []
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const effectiveUserId = userId || currentUser?.id || currentUser?._id;
      
      if (!effectiveUserId) {
        setLoading(false);
        return;
      }

      if (effectiveUserId === (currentUser?.id || currentUser?._id)) {
        setIsOwnProfile(true);
        setProfileUser(currentUser);
        setFormData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          bio: currentUser.bio || '',
          domain: currentUser.domain || '',
          expertise: Array.isArray(currentUser.expertise) ? currentUser.expertise : [],
          isDiscoverable: currentUser.isDiscoverable || false,
          github: currentUser.github || '',
          linkedin: currentUser.linkedin || '',
          avatar: currentUser.avatar || '',
          skills: Array.isArray(currentUser.skills) ? currentUser.skills : []
        });
        setLoading(false);
      } else {
        setIsOwnProfile(false);
        try {
          const res = await axios.get(`http://localhost:5000/api/users/profile/${effectiveUserId}`);
          setProfileUser(res.data);
          setFormData({
            name: res.data.name || '',
            email: res.data.email || '',
            bio: res.data.bio || '',
            domain: res.data.domain || '',
            expertise: Array.isArray(res.data.expertise) ? res.data.expertise : [],
            isDiscoverable: res.data.isDiscoverable || false,
            github: res.data.github || '',
            linkedin: res.data.linkedin || '',
            avatar: res.data.avatar || '',
            skills: Array.isArray(res.data.skills) ? res.data.skills : []
          });
        } catch (err) {
          console.error('Error fetching profile:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [userId, currentUser]);

  const [newSkill, setNewSkill] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const toggleExpertise = (id) => {
    if (!isOwnProfile) return;
    const domain = DOMAINS.find(d => d.id === id);
    setFormData(prev => {
      const isSelecting = !prev.expertise.includes(id);
      const newExpertise = isSelecting
        ? [...prev.expertise, id]
        : prev.expertise.filter(e => e !== id);
      
      let newSkills = [...prev.skills];
      if (isSelecting && domain && !newSkills.includes(domain.name)) {
        newSkills.push(domain.name);
      }

      return {
        ...prev,
        expertise: newExpertise,
        skills: newSkills
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwnProfile) return;
    setUpdating(true);
    setSuccess(false);
    const updatedData = { 
      ...formData, 
      domain: formData.expertise[0] || 'Member',
      onboarded: true 
    };
    const result = await updateProfile(updatedData);
    setUpdating(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const [domainSearch, setDomainSearch] = useState('');
  const filteredDomains = DOMAINS.filter(d => 
    d.name.toLowerCase().includes(domainSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-secondary animate-spin" />
      </div>
    );
  }

  if (!profileUser && !loading) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h2 className="text-2xl text-white">User not found</h2>
        <button onClick={() => navigate('/discover')} className="mt-4 text-brand-secondary hover:underline">Go back to Discover</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 font-display">
              {isOwnProfile ? 'Your Profile' : `${profileUser.name}'s Profile`}
            </h1>
            <p className="text-[#94A3B8]">
              {isOwnProfile ? 'Manage your public presence and expertise.' : 'View technical expertise and experience.'}
            </p>
          </div>
          {success && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-green-500/20 text-green-400 px-6 py-3 rounded-2xl border border-green-500/20 font-bold"
            >
              Profile Updated!
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass p-8 rounded-[2.5rem] border border-white/10 text-center relative group">
              <div className="relative inline-block mb-6">
                <img 
                  src={formData.avatar || null} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full border-4 border-brand-secondary/30 p-1 mx-auto object-cover shadow-2xl"
                />

                {isOwnProfile && (
                  <div className="absolute bottom-0 right-0 flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}` })}
                      className="p-2 bg-brand-surface border border-white/10 rounded-full text-[#94A3B8] hover:text-white transition-all shadow-lg"
                    >
                      <Cpu className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="p-3 bg-brand-secondary rounded-full text-white shadow-lg hover:scale-110 transition-transform"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>

              <h2 className="text-2xl font-bold text-white">{formData.name}</h2>
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {formData.expertise.map((exp, i) => (
                  <span key={i} className="text-brand-accent font-bold uppercase tracking-tighter text-[9px] bg-brand-accent/5 px-2 py-0.5 rounded border border-brand-accent/10">{exp}</span>
                ))}
              </div>
              
              <div className="mt-8 space-y-4 text-left border-t border-white/5 pt-6">
                <div className="flex items-center gap-3 text-sm text-[#94A3B8]">
                  <Mail className="w-4 h-4" /> {formData.email}
                </div>
                
                {!isOwnProfile && (
                  <button 
                    onClick={() => navigate(`/messages/${profileUser._id || profileUser.id}`)}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-brand-secondary/10 hover:bg-brand-secondary text-brand-secondary hover:text-white rounded-xl transition-all font-bold border border-brand-secondary/20"
                  >
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                )}

                {isOwnProfile && (
                  <div className="flex items-center justify-between gap-4 py-2 border-t border-white/5 mt-4 pt-4">
                    <div>
                      <h5 className="text-xs font-bold text-white mb-1">Discoverable</h5>
                      <p className="text-[10px] text-[#94A3B8]">Show up in searches</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer scale-75 origin-right">
                      <input 
                        type="checkbox" 
                        checked={formData.isDiscoverable}
                        onChange={(e) => setFormData({ ...formData, isDiscoverable: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-secondary"></div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass p-8 rounded-[3rem] border border-white/10 space-y-8">
              <div>
                <label className="text-sm font-medium text-[#94A3B8] mb-4 block">Bio</label>
                {isOwnProfile ? (
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 min-h-[150px] transition-all"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white min-h-[100px]">
                    {formData.bio || "No bio provided."}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-[#94A3B8] mb-4 block">LinkedIn</label>
                  {isOwnProfile ? (
                    <div className="relative">
                      <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
                      <input 
                        type="text"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 transition-all"
                      />
                    </div>
                  ) : formData.linkedin ? (
                    <a href={formData.linkedin.startsWith('http') ? formData.linkedin : `https://linkedin.com/in/${formData.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all group">
                      <svg className="w-5 h-5 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      <span className="text-sm truncate">Visit LinkedIn Profile</span>
                      <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[#94A3B8] italic text-sm">Not linked</div>}
                </div>
                <div>
                  <label className="text-sm font-medium text-[#94A3B8] mb-4 block">GitHub</label>
                  {isOwnProfile ? (
                    <div className="relative">
                      <Code2 className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-secondary w-5 h-5" />
                      <input 
                        type="text"
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 transition-all"
                      />
                    </div>
                  ) : formData.github ? (
                    <a href={formData.github.startsWith('http') ? formData.github : `https://github.com/${formData.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all group">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      <span className="text-sm truncate">Visit GitHub Profile</span>
                      <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[#94A3B8] italic text-sm">Not linked</div>}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#94A3B8] mb-4 block">Skills</label>
                {isOwnProfile && (
                  <div className="flex gap-4 mb-6">
                    <input 
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 transition-all"
                      placeholder="Add a skill..."
                    />
                    <button type="button" onClick={handleAddSkill} className="p-4 bg-brand-secondary/10 hover:bg-brand-secondary text-brand-secondary hover:text-white rounded-2xl transition-all border border-brand-secondary/20">
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <span key={skill} className="bg-brand-secondary/20 text-brand-secondary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-brand-secondary/10">
                      {skill}
                      {isOwnProfile && <X className="w-4 h-4 cursor-pointer hover:text-red-400" onClick={() => removeSkill(skill)} />}
                    </span>
                  ))}
                  {formData.skills.length === 0 && <p className="text-sm text-[#94A3B8] italic">No skills listed.</p>}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <label className="text-sm font-medium text-[#94A3B8]">Technical Expertise</label>
                  {isOwnProfile && (
                    <div className="relative max-w-xs w-full">
                      <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                      <input 
                        type="text"
                        placeholder="Search fields..."
                        value={domainSearch}
                        onChange={(e) => setDomainSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(isOwnProfile ? filteredDomains : DOMAINS.filter(d => formData.expertise.includes(d.id))).map((d) => {
                    const isSelected = formData.expertise.includes(d.id);
                    return (
                      <div 
                        key={d.id}
                        onClick={() => toggleExpertise(d.id)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                          isOwnProfile ? 'cursor-pointer' : ''
                        } ${
                          isSelected 
                            ? 'bg-brand-secondary/20 border-brand-secondary shadow-lg shadow-brand-secondary/5' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected ? 'bg-brand-secondary border-brand-secondary' : 'bg-white/5 border-white/20'
                        }`}>
                          {isSelected && <Plus className="w-3 h-3 text-white rotate-45" />}
                        </div>
                        <div className="flex items-center gap-3 overflow-hidden">
                          <d.icon className={`w-4 h-4 flex-shrink-0 ${d.color}`} />
                          <span className={`text-xs font-medium truncate ${isSelected ? 'text-white' : 'text-[#94A3B8]'}`}>
                            {d.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {!isOwnProfile && formData.expertise.length === 0 && <p className="col-span-full text-sm text-[#94A3B8] italic">No expertise listed.</p>}
                </div>
              </div>

              {isOwnProfile && (
                <div className="pt-8">
                  <button 
                    onClick={handleSubmit}
                    disabled={updating}
                    className="w-full btn-secondary py-5 rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-brand-secondary/20 hover:shadow-brand-secondary/40 transition-all disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
