import React, { useEffect, useState } from 'react';

function LoadingScreen() {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animation timing
    const totalDuration = 4000; // 4 seconds
    const interval = 40; // Update every 40ms
    const steps = totalDuration / interval;
    
    // Progress bar animation
    let currentStep = 0;
    const progressTimer = setInterval(() => {
      currentStep++;
      // Using easeOutQuad function for smoother progress
      const t = currentStep / steps;
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setProgress(Math.min(eased * 100, 100));
      
      if (currentStep >= steps) {
        clearInterval(progressTimer);
      }
    }, interval);

    // Hide the loading screen after the animation completes
    const timer = setTimeout(() => {
      setShow(false);
    }, totalDuration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="loading-screen">
      <div className="loading-container">
        {/* Enhanced background glow effect */}
        <div className="loading-background-glow"></div>
        
        {/* Main text with enhanced glow */}
        <h1 className="loading-title">
          ANBU PRINTING PRESS
          <span className="loading-title-glow"></span>
        </h1>

        {/* Enhanced loading progress bar */}
        <div className="loading-progress-container">
          <div 
            className="loading-progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
          <div className="loading-progress-glow" style={{ left: `${progress-10}%` }}></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;