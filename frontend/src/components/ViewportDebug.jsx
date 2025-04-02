import React, { useState } from 'react';
import { useViewport } from './ViewportProvider';
import { breakpoints } from './ViewportUtils';

/**
 * ViewportDebug component
 * Displays current viewport information for debugging purposes
 * Only shown in development environment
 */
const ViewportDebug = ({ show = true }) => {
  const [expanded, setExpanded] = useState(false);
  const {
    width,
    height,
    is4K,
    isUHD,
    isUltrawide,
    isWidescreen,
    isDesktop,
    isTablet,
    isMobile,
    breakpoint,
    scale
  } = useViewport();
  
  if (!show || process.env.NODE_ENV === 'production') {
    return null;
  }
  
  // Get color based on breakpoint
  const getColor = () => {
    if (is4K) return '#6200ea'; // 4K - deep purple
    if (isUHD) return '#2962ff'; // UHD - blue
    if (isUltrawide) return '#00bfa5'; // Ultrawide - teal
    if (isWidescreen) return '#00c853'; // Widescreen - green
    if (isDesktop) return '#ffab00'; // Desktop - amber
    if (isTablet) return '#ff6d00'; // Tablet - orange
    if (isMobile) return '#dd2c00'; // Mobile - deep orange
    return '#888888';
  };
  
  // Find the current and all breakpoints
  const breakpointEntries = Object.entries(breakpoints)
    .sort((a, b) => b[1] - a[1]) // Sort by value (largest first)
    .map(([name, value]) => ({
      name,
      value,
      active: name === breakpoint ||
        (name === '4k' && breakpoint === 'fourK') ||
        (name === 'fourK' && breakpoint === '4k')
    }));
  
  const toggleExpanded = () => setExpanded(!expanded);
  
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '12px',
        right: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '10px 14px',
        borderRadius: '6px',
        fontSize: expanded ? '14px' : '12px',
        zIndex: 9999,
        fontFamily: 'monospace',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        border: `2px solid ${getColor()}`,
        cursor: 'pointer',
        userSelect: 'none',
        maxWidth: expanded ? '300px' : 'auto',
      }}
      onClick={toggleExpanded}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: expanded ? '8px' : '0'
      }}>
        <span style={{ fontWeight: 'bold' }}>
          {width}×{height}
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: getColor(),
            marginLeft: '8px',
          }}></span>
        </span>
        <span>{is4K ? '4K' : breakpoint.toUpperCase()}</span>
      </div>
      
      {expanded && (
        <>
          <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '8px' }}>
            <div>Scale Factor: {scale.toFixed(2)}</div>
            <div style={{ marginTop: '8px' }}>Breakpoints:</div>
            {breakpointEntries.map(({ name, value, active }) => (
              <div key={name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '2px 0',
                color: active ? getColor() : 'rgba(255,255,255,0.7)',
                fontWeight: active ? 'bold' : 'normal'
              }}>
                <span>{name === 'fourK' ? '4K' : name}</span>
                <span>{value}px{active ? ' ←' : ''}</span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '8px',
            fontSize: '10px',
            opacity: 0.7,
            textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: '8px'
          }}>
            Click to {expanded ? 'collapse' : 'expand'}
          </div>
        </>
      )}
    </div>
  );
};

export default ViewportDebug;