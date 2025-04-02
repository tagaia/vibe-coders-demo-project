import React from 'react';
import { useViewport } from './ViewportProvider';
import ViewportContainer from './ViewportContainer';

/**
 * Demo component to showcase 4K and responsive capabilities
 */
const ViewportDemo = () => {
  const { 
    width, 
    height, 
    is4K, 
    isUHD,
    isUltrawide,
    breakpoint,
    scale
  } = useViewport();

  // Create visual elements based on the current viewport
  const getBackgroundColor = () => {
    if (is4K) return 'linear-gradient(135deg, #6200ea 0%, #3700b3 100%)';
    if (isUHD) return 'linear-gradient(135deg, #2962ff 0%, #0039cb 100%)';
    if (isUltrawide) return 'linear-gradient(135deg, #00bfa5 0%, #008e76 100%)';
    return 'linear-gradient(135deg, #ff6d00 0%, #c43e00 100%)';
  };

  return (
    <ViewportContainer className="py-8">
      <div className="grid grid-cols-1 gap-8">
        <div 
          className="rounded-lg shadow-lg overflow-hidden"
          style={{
            background: getBackgroundColor(),
            padding: is4K ? '3rem' : isUHD ? '2.5rem' : '2rem',
            transition: 'all 0.3s ease'
          }}
        >
          <h1 
            className="text-white font-bold"
            style={{ 
              fontSize: is4K ? '4rem' : isUHD ? '3rem' : '2rem',
              marginBottom: is4K ? '2rem' : '1rem'
            }}
          >
            4K Viewport Demo
          </h1>
          
          <div className="text-white" style={{ fontSize: is4K ? '1.5rem' : '1.1rem' }}>
            <p className="mb-4">
              Current viewport: <strong>{width}×{height}px</strong> ({breakpoint})
            </p>
            <p className="mb-4">
              Scale factor: <strong>{scale.toFixed(2)}</strong>
            </p>
            <p>
              This component demonstrates responsive design with special handling for 4K displays.
              Try resizing your browser window or viewing on different devices to see how the layout adapts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              style={{
                padding: is4K ? '2rem' : isUHD ? '1.5rem' : '1rem',
                transition: 'all 0.3s ease'
              }}
            >
              <h3 
                className="font-bold mb-2"
                style={{ 
                  fontSize: is4K ? '1.8rem' : isUHD ? '1.5rem' : '1.25rem',
                }}
              >
                Card {i + 1}
              </h3>
              <p style={{ fontSize: is4K ? '1.2rem' : '1rem' }}>
                This card automatically scales based on the viewport size.
              </p>
            </div>
          ))}
        </div>
      </div>
    </ViewportContainer>
  );
};

export default ViewportDemo;