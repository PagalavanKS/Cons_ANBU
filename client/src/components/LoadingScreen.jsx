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
    <div className="loading-screen">
      <div className="loading-container">
        {/* Background glow effect */}
        <div className="loading-background-glow"></div>
        
        {/* Main text */}
        <h1 className="loading-title">
          ANBU PRINTING PRESS
        </h1>

        {/* Loading line */}
        <div className="loading-line-container">
          <div className="loading-line">
            <div className="loading-line-indicator"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;