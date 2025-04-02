import React from 'react';
import { useViewport } from './ViewportProvider';
import { scaleValue, responsiveFontSize } from './ViewportUtils';

const ViewportContainer = ({ children, className = '', fluid = false }) => {
  const {
    is4K,
    isUHD,
    isUltrawide,
    isWidescreen,
    width,
    scale,
    breakpoint
  } = useViewport();
  
  // Generate containerStyle based on current viewport
  let containerStyle = {};
  
  // Set max-width based on breakpoint unless fluid=true
  if (!fluid) {
    if (is4K) {
      containerStyle.maxWidth = '3840px';
    } else if (isUHD) {
      containerStyle.maxWidth = '2560px';
    } else if (isUltrawide) {
      containerStyle.maxWidth = '1536px';
    } else if (isWidescreen) {
      containerStyle.maxWidth = '1280px';
    }
  }
  
  // Apply responsive styling based on viewport
  containerStyle = {
    ...containerStyle,
    margin: '0 auto',
    padding: `0 ${scaleValue(1, width, 1024, 1, 2.5)}rem`,
    fontSize: responsiveFontSize(16, width),
    lineHeight: is4K ? '1.8' : isUHD ? '1.7' : '1.6',
  };
  
  return (
    <div className={`viewport-container ${className}`} style={containerStyle}>
      {children}
    </div>
  );
};

export default ViewportContainer;