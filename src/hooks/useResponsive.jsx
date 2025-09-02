import { useState, useEffect } from 'react';

// React 19 compatible responsive hook
const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [device, setDevice] = useState('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      
      // Determine device type
      if (width < 640) {
        setDevice('mobile');
      } else if (width < 1024) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    windowSize,
    device,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
    breakpoint: {
      xs: windowSize.width < 640,
      sm: windowSize.width >= 640 && windowSize.width < 768,
      md: windowSize.width >= 768 && windowSize.width < 1024,
      lg: windowSize.width >= 1024 && windowSize.width < 1280,
      xl: windowSize.width >= 1280,
    }
  };
};

export default useResponsive;
