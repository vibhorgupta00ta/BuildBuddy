import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Rocket, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {

  return (
    <div className="relative pt-32 min-h-screen overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-20 overflow-hidden pointer-events-none">

        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-secondary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-brand-purple/20 rounded-full blur-[120px]" />
      </div>


      {/* Hero Section */}
      <section className="px-6 py-20 flex flex-col items-center text-center relative z-10">
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black mb-8 font-display leading-[1.1] max-w-5xl"
        >
          Build Faster With The <br />
          <span className="text-gradient">Perfect Squad.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl text-xl text-slate-400 mb-12 leading-relaxed"
        >
          Connect with driven developers, designers, and innovators. 
          Stop solo-hacking and start building legendary projects together.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Link to="/discover" className="btn-primary group">
            Start Discovering
          </Link>
          <Link to="/teams" className="btn-secondary group">
            <Users className="w-5 h-5 mr-2 group-hover:text-brand-accent transition-colors" />
            Browse Teams
          </Link>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/5 pt-12"
        >
          <div>
            <div className="text-4xl font-bold text-white mb-1">10k+</div>
            <div className="text-sm text-slate-500 uppercase tracking-widest font-bold">Hackers</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-1">2.5k</div>
            <div className="text-sm text-slate-500 uppercase tracking-widest font-bold">Teams Built</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-1">150+</div>
            <div className="text-sm text-slate-500 uppercase tracking-widest font-bold">Events</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-1">500+</div>
            <div className="text-sm text-slate-500 uppercase tracking-widest font-bold">Projects</div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl mb-6">How it Works</h2>
            <p className="text-slate-400 text-lg">Three steps to your next big launch.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: Rocket,
                title: "Build Your Identity",
                desc: "Sync your GitHub, showcase your best work, and define your tech expertise.",
                color: "from-blue-500/20 to-cyan-500/20",
                iconColor: "text-blue-400"
              },
              {
                icon: Target,
                title: "Find Your Match",
                desc: "Our algorithm suggests teammates based on tech stack, goals, and availability.",
                color: "from-purple-500/20 to-pink-500/20",
                iconColor: "text-purple-400"
              },
              {
                icon: Zap,
                title: "Launch Together",
                desc: "Join a team, set milestones, and ship your product to the world.",
                color: "from-orange-500/20 to-yellow-500/20",
                iconColor: "text-orange-400"
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-10 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-8 border border-white/5 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-2xl mb-4 text-white font-display">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

