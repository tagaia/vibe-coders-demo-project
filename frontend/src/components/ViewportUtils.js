/**
 * Viewport Utility Functions
 * Helper functions for handling viewport-specific scaling and responsive design
 */

// Viewport breakpoints
export const breakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  widescreen: 1280,
  ultrawide: 1536,
  uhd: 2560,     // 2K/QHD
  fourK: 3840,   // 4K UHD
};

/**
 * Scales a value based on the viewport width
 * @param {number} baseValue - Base value at standard desktop size
 * @param {number} viewportWidth - Current viewport width
 * @param {number} baseWidth - Base width to scale from (defaults to desktop)
 * @param {number} minScale - Minimum scale factor
 * @param {number} maxScale - Maximum scale factor
 * @returns {number} - Scaled value
 */
export const scaleValue = (
  baseValue, 
  viewportWidth, 
  baseWidth = breakpoints.desktop, 
  minScale = 0.75, 
  maxScale = 2.5
) => {
  // Calculate scale factor based on viewport width
  let scaleFactor = viewportWidth / baseWidth;
  
  // Clamp scale factor to reasonable limits
  scaleFactor = Math.max(minScale, Math.min(maxScale, scaleFactor));
  
  return baseValue * scaleFactor;
};

/**
 * Creates a responsive font size value based on viewport
 * @param {number} baseFontSize - Base font size in pixels
 * @param {number} viewportWidth - Current viewport width
 * @returns {string} - CSS font-size value with relative units
 */
export const responsiveFontSize = (baseFontSize, viewportWidth) => {
  if (viewportWidth >= breakpoints.fourK) {
    // 4K displays need larger scaling
    return `${baseFontSize * 1.75}px`;
  } else if (viewportWidth >= breakpoints.uhd) {
    // QHD/UHD (2K) displays
    return `${baseFontSize * 1.35}px`;
  } else if (viewportWidth >= breakpoints.ultrawide) {
    // Ultrawide monitors
    return `${baseFontSize * 1.15}px`;
  } else {
    // Standard desktop or smaller
    return `${baseFontSize}px`;
  }
};

/**
 * Determines if the current viewport matches the given breakpoint
 * @param {string} breakpoint - Breakpoint name ('mobile', 'tablet', 'desktop', etc.)
 * @param {number} viewportWidth - Current viewport width
 * @returns {boolean} - True if viewport matches the breakpoint
 */
export const matchesBreakpoint = (breakpoint, viewportWidth) => {
  switch (breakpoint) {
    case 'mobile':
      return viewportWidth < breakpoints.tablet;
    case 'tablet':
      return viewportWidth >= breakpoints.tablet && viewportWidth < breakpoints.desktop;
    case 'desktop':
      return viewportWidth >= breakpoints.desktop && viewportWidth < breakpoints.widescreen;
    case 'widescreen':
      return viewportWidth >= breakpoints.widescreen && viewportWidth < breakpoints.ultrawide;
    case 'ultrawide':
      return viewportWidth >= breakpoints.ultrawide && viewportWidth < breakpoints.uhd;
    case 'uhd':
      return viewportWidth >= breakpoints.uhd && viewportWidth < breakpoints.fourK;
    case '4k':
    case 'fourK':
      return viewportWidth >= breakpoints.fourK;
    default:
      return false;
  }
};