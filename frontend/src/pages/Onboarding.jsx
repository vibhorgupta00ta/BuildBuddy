import React, { useState, useRef, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, Code2, Palette, ShieldCheck, Cpu, Database, ArrowRight, User as UserIcon, Terminal, Briefcase, Camera, Plus, X, Globe, Binary, Brain, Box, Cloud, Settings, Monitor, Rocket, Smartphone, Gamepad2, Glasses } from 'lucide-react';


import { motion, AnimatePresence } from 'framer-motion';

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

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [selectedExpertise, setSelectedExpertise] = useState([]);
  const [isDiscoverable, setIsDiscoverable] = useState(false);
  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Initialize avatar with Dicebear if empty
  useEffect(() => {
    if (!avatar && user?.name) {
      setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`);
    }
  }, [user, avatar]);


  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const toggleExpertise = (id) => {
    const domain = DOMAINS.find(d => d.id === id);
    const isSelecting = !selectedExpertise.includes(id);
    
    setSelectedExpertise(prev => 
      isSelecting ? [...prev, id] : prev.filter(e => e !== id)
    );

    if (isSelecting && domain && !skills.includes(domain.name)) {
      setSkills(prev => [...prev, domain.name]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    const result = await updateProfile({ 
      expertise: selectedExpertise,
      isDiscoverable,
      domain: selectedExpertise[0] || 'Member', // Fallback for old fields
      bio,
      github,
      linkedin,
      skills,
      avatar,
      onboarded: true 
    });

    setLoading(false);
    if (result.success) {
      navigate('/discover');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 flex flex-col items-center px-4">
      <div className="max-w-3xl w-full">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                step >= s ? 'bg-brand-secondary' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-white mb-4 font-display">What's your field?</h2>
              <p className="text-[#94A3B8] mb-12 text-lg">Pick your areas of expertise (multiple allowed).</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                {DOMAINS.map((domain) => {
                  const isSelected = selectedExpertise.includes(domain.id);
                  return (
                    <div
                      key={domain.id}
                      onClick={() => toggleExpertise(domain.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-2 relative group ${
                        isSelected 
                          ? 'bg-brand-secondary/20 border-brand-secondary shadow-lg shadow-brand-secondary/10' 
                          : 'glass border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <div className={`absolute top-3 right-3 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-brand-secondary border-brand-secondary' : 'bg-white/5 border-white/20'
                      }`}>
                        {isSelected && <Plus className="w-3 h-3 text-white rotate-45" />}
                      </div>
                      <domain.icon className={`w-6 h-6 mb-1 ${domain.color}`} />
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider">{domain.name}</span>
                    </div>
                  );
                })}
              </div>


              {/* Discovery Toggle */}
              <div className="glass p-8 rounded-[2rem] border border-white/10 mb-12 text-left flex items-center justify-between gap-6 group hover:border-brand-secondary/30 transition-all">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-brand-secondary" /> Discovery Settings
                  </h4>
                  <p className="text-[#94A3B8] text-sm leading-relaxed">
                    Do you want people to connect and find you? If enabled, your profile will be listed in the Discover feed so others can invite you to their squads.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isDiscoverable}
                    onChange={(e) => setIsDiscoverable(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-14 h-8 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-secondary"></div>
                </label>
              </div>

              <button
                disabled={selectedExpertise.length === 0}
                onClick={() => setStep(2)}
                className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}


          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-4 font-display">Professional Bio</h2>
                <p className="text-[#94A3B8] mb-8">Tell us about your experience and skills.</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-[#94A3B8] mb-2 block">Your Bio</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                    rows={4}
                    placeholder="E.g. Passionate developer building future-proof apps..."
                  />
                </div>

                <div>
                  <label className="text-sm text-[#94A3B8] mb-2 block">GitHub Profile URL</label>
                  <div className="relative">
                    <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
                    <input 
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-[#94A3B8] mb-2 block">LinkedIn Profile URL</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
                    <input 
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                      placeholder="https://linkedin.com/in/yourusername"
                    />
                  </div>
                </div>


                <div>
                  <label className="text-sm text-[#94A3B8] mb-2 block">Add Skills</label>
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                      placeholder="e.g. React"
                    />
                    <button onClick={handleAddSkill} className="p-4 bg-white/10 rounded-xl hover:bg-white/20">
                      <Plus className="text-white" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <span key={skill} className="bg-brand-secondary/20 text-brand-secondary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {skill}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button onClick={() => setStep(1)} className="flex-1 py-4 border border-white/10 rounded-xl text-white hover:bg-white/5">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 btn-primary py-4 rounded-xl">Next</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-white mb-4 font-display">One Last Thing</h2>
              <p className="text-[#94A3B8] mb-12">Choose your profile picture.</p>
              
              <div className="flex flex-col items-center gap-8 mb-12">
                <div className="relative group">
                  <img 
                    src={avatar || null} 
                    alt="Preview" 
                    className="w-40 h-40 rounded-full border-4 border-brand-secondary/30 p-1 object-cover"
                  />

                  <div className="absolute bottom-0 right-0 flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`)}
                      className="p-2 bg-brand-surface border border-white/10 rounded-full text-[#94A3B8] hover:text-white transition-all shadow-lg"
                      title="Generate AI Avatar"
                    >
                      <Cpu className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="p-3 bg-brand-secondary rounded-full text-white shadow-lg hover:scale-110 transition-transform"
                      title="Upload from Device"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>


                <div className="w-full">
                  <label className="text-sm text-[#94A3B8] mb-2 block text-left">Or paste an Image URL</label>
                  <input 
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-secondary"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-4 border border-white/10 rounded-xl text-white hover:bg-white/5">Back</button>
                <button 
                  onClick={handleFinish} 
                  disabled={loading}
                  className="flex-1 btn-secondary py-4 rounded-xl font-bold disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Launch Profile'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
