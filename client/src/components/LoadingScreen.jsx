import React, { useEffect, useState } from 'react';

function LoadingScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-brand-primary/20 filter blur-3xl scale-150 animate-pulse"></div>
        
        {/* Main text */}
        <h1 className="text-brand-primary text-7xl font-bold tracking-wider relative animate-scale-in drop-shadow-lg">
          ANBU PRINTING PRESS
        </h1>

        {/* Loading line */}
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
          <div className="h-[2px] w-32 bg-brand-secondary/50 relative overflow-hidden rounded-full">
            <div className="h-full w-8 bg-brand-primary absolute animate-loading-bounce rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;