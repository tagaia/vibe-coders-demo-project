import React, { createContext, useContext, useState, useEffect } from 'react';
import { breakpoints, matchesBreakpoint } from './ViewportUtils';

// Create viewport context with extended properties
const ViewportContext = createContext({
  width: window.innerWidth,
  height: window.innerHeight,
  is4K: false,
  isUHD: false,
  isUltrawide: false,
  isWidescreen: false,
  isDesktop: false,
  isTablet: false,
  isMobile: false,
  breakpoint: 'desktop', // Current breakpoint name
  scale: 1, // Scale factor based on viewport
});

export const ViewportProvider = ({ children }) => {
  // Determine current breakpoint name
  const getBreakpointName = (width) => {
    if (width >= breakpoints.fourK) return '4k';
    if (width >= breakpoints.uhd) return 'uhd';
    if (width >= breakpoints.ultrawide) return 'ultrawide';
    if (width >= breakpoints.widescreen) return 'widescreen';
    if (width >= breakpoints.desktop) return 'desktop';
    if (width >= breakpoints.tablet) return 'tablet';
    return 'mobile';
  };
  
  // Calculate scale factor based on viewport width
  const getScaleFactor = (width) => {
    if (width >= breakpoints.fourK) return 2;
    if (width >= breakpoints.uhd) return 1.5;
    if (width >= breakpoints.ultrawide) return 1.25;
    if (width >= breakpoints.widescreen) return 1.1;
    return 1;
  };

  // Initialize state with window dimensions and viewport categorization
  const initialWidth = window.innerWidth;
  const initialHeight = window.innerHeight;
  
  const [viewport, setViewport] = useState({
    width: initialWidth,
    height: initialHeight,
    is4K: initialWidth >= breakpoints.fourK,
    isUHD: initialWidth >= breakpoints.uhd && initialWidth < breakpoints.fourK,
    isUltrawide: initialWidth >= breakpoints.ultrawide && initialWidth < breakpoints.uhd,
    isWidescreen: initialWidth >= breakpoints.widescreen && initialWidth < breakpoints.ultrawide,
    isDesktop: initialWidth >= breakpoints.desktop && initialWidth < breakpoints.widescreen,
    isTablet: initialWidth >= breakpoints.tablet && initialWidth < breakpoints.desktop,
    isMobile: initialWidth < breakpoints.tablet,
    breakpoint: getBreakpointName(initialWidth),
    scale: getScaleFactor(initialWidth),
  });

  useEffect(() => {
    // Handle resize events
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({
        width,
        height,
        is4K: width >= breakpoints.fourK,
        isUHD: width >= breakpoints.uhd && width < breakpoints.fourK,
        isUltrawide: width >= breakpoints.ultrawide && width < breakpoints.uhd,
        isWidescreen: width >= breakpoints.widescreen && width < breakpoints.ultrawide,
        isDesktop: width >= breakpoints.desktop && width < breakpoints.widescreen,
        isTablet: width >= breakpoints.tablet && width < breakpoints.desktop,
        isMobile: width < breakpoints.tablet,
        breakpoint: getBreakpointName(width),
        scale: getScaleFactor(width),
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Initial call to set initial state accurately
    handleResize();
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ViewportContext.Provider value={viewport}>
      {children}
    </ViewportContext.Provider>
  );
};

// Custom hook to use the viewport context
export const useViewport = () => {
  const context = useContext(ViewportContext);
  if (context === undefined) {
    throw new Error('useViewport must be used within a ViewportProvider');
  }
  
  // Add a helper method to check a specific breakpoint
  context.isBreakpoint = (breakpointName) => {
    return matchesBreakpoint(breakpointName, context.width);
  }
  return context;
};