'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import './Preloader.css';

export const Preloader = ({ onComplete }) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const obj = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        // Wait 300ms after reaching 100% to let the user see it, then trigger onComplete
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    });

    tl.to(obj, {
      value: 100,
      duration: 2.3,
      ease: 'power2.out',
      onUpdate: () => {
        setPercent(Math.floor(obj.value));
      }
    });
  }, [onComplete]);

  return (
    <motion.div 
      className="preloader-wrapper"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      {/* Top Slide Out Panel */}
      <motion.div 
        className="preloader-panel top"
        exit={{ y: '-100%' }}
        transition={{ duration: 0.8, ease: [0.85, 0, 0.15, 1] }}
      />
      
      {/* Bottom Slide Out Panel */}
      <motion.div 
        className="preloader-panel bottom"
        exit={{ y: '100%' }}
        transition={{ duration: 0.8, ease: [0.85, 0, 0.15, 1] }}
      />

      {/* Central Loading Content */}
      <motion.div 
        className="preloader-content"
        exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Glowing Rings */}
        <div className="loader-ring-wrapper">
          <div className="loader-ring ring-1"></div>
          <div className="loader-ring ring-2"></div>
          <div className="loader-ring ring-3"></div>
          <div className="loader-percentage">{percent}%</div>
        </div>

        {/* Status Text */}
        <div className="loader-text-wrapper">
          <span className="loader-title">SYSTEM INIT</span>
          <span className="loader-sub">ESTABLISHING NEURAL LINK...</span>
        </div>

        {/* Loading Bar */}
        <div className="loader-bar-bg">
          <motion.div 
            className="loader-bar-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Preloader;
