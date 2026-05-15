import React from 'react';
import Galaxy from './Galaxy';

const GlobalBackground = () => {
  return (
    <div className="fixed inset-0 -z-[100] pointer-events-none overflow-hidden bg-[#020617]">
      <div className="absolute inset-0 opacity-40">
        <Galaxy 
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1.0}
          glowIntensity={0.4}
          saturation={0.3}
          hueShift={220}
        />
      </div>
      
      {/* Mesh Gradients for depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-secondary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-purple/10 rounded-full blur-[150px]" />
      
      {/* Noise texture overlay if you have one, or just a subtle vignette */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
    </div>
  );
};

export default GlobalBackground;
