import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] min-w-[320px] max-w-[90vw]"
        >
          <div className={`
            glass-darker border-l-4 rounded-2xl p-4 shadow-2xl flex items-center gap-4
            ${type === 'success' ? 'border-green-500 bg-green-500/10' : ''}
            ${type === 'error' ? 'border-red-500 bg-red-500/10' : ''}
            ${type === 'info' ? 'border-brand-secondary bg-brand-secondary/10' : ''}
          `}>
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              ${type === 'success' ? 'bg-green-500/20 text-green-400' : ''}
              ${type === 'error' ? 'bg-red-500/20 text-red-400' : ''}
              ${type === 'info' ? 'bg-brand-secondary/20 text-brand-secondary' : ''}
            `}>
              {type === 'success' && <CheckCircle className="w-5 h-5" />}
              {type === 'error' && <XCircle className="w-5 h-5" />}
              {type === 'info' && <Info className="w-5 h-5" />}
            </div>
            
            <div className="flex-1">
              <p className="text-white font-bold text-sm">{message}</p>
            </div>

            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/5 rounded-lg transition-colors text-[#94A3B8]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
