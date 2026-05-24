import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="relative mt-16 border-t border-white/10 overflow-hidden">
      {/* Gradient Divider */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

      {/* Background with Glassmorphism and slight tint */}
      <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-xl z-0" />
      
      {/* Animated Glowing Orbs/Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Bottom Section Only */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[#94A3B8] text-xs">
            © 2026 BuildBuddy. All rights reserved.
          </div>
          
          <div className="text-[10px] text-[#94A3B8]/60 uppercase tracking-widest font-mono text-center hidden lg:block">
            Crafted with React, Node.js, MongoDB & Socket.io
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#94A3B8] text-xs">Developed by</span>
            <div className="flex items-center gap-2">
              <a 
                href="https://www.linkedin.com/in/vibhor-gupta-7a5672300/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 hover:text-white transition-all group hover:shadow-[0_0_10px_rgba(34,211,238,0.2)]"
              >
                <FaLinkedin className="text-sm group-hover:text-cyan-400 transition-all" />
                <span className="font-mono text-xs text-[#94A3B8] group-hover:text-white transition-colors">LinkedIn</span>
              </a>
              <a 
                href="https://github.com/vibhorgupta00ta" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 hover:text-white transition-all group hover:shadow-[0_0_10px_rgba(34,211,238,0.2)]"
              >
                <FaGithub className="text-sm group-hover:text-cyan-400 transition-all" />
                <span className="font-mono text-xs text-[#94A3B8] group-hover:text-white transition-colors">@vibhorgupta00ta</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
