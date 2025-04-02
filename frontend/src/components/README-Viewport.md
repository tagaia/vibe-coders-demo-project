# 4K Viewport System

A responsive viewport system that optimizes React applications for various screen sizes, including 4K displays.

## Components

### ViewportProvider

Core context provider that detects and exposes viewport information to all child components.

```jsx
// App.jsx
import { ViewportProvider } from './components/ViewportProvider';

function App() {
  return (
    <ViewportProvider>
      <YourApp />
    </ViewportProvider>
  );
}
```

### ViewportContainer

A responsive container component that adapts to different viewport sizes.

```jsx
// YourComponent.jsx
import ViewportContainer from './components/ViewportContainer';

function YourComponent() {
  return (
    <ViewportContainer>
      <h1>Your Content</h1>
      <p>This content will be responsively scaled based on viewport size.</p>
    </ViewportContainer>
  );
}
```

#### Props

- `className` - Additional CSS classes to apply
- `fluid` - If true, container will be full-width without max-width constraints

### ViewportDebug

A debugging tool that displays current viewport information.

```jsx
// Add to your App.jsx or a development wrapper
import ViewportDebug from './components/ViewportDebug';

<ViewportDebug />
```

## Hooks and Utilities

### useViewport

A hook that provides access to the current viewport information.

```jsx
import { useViewport } from './components/ViewportProvider';

function YourComponent() {
  const { width, height, is4K, isDesktop, breakpoint, scale } = useViewport();
  
  return (
    <div>
      {is4K && <h1>This is a 4K display!</h1>}
      <p style={{ fontSize: is4K ? '1.5rem' : '1rem' }}>
        Responsive text that adapts to the viewport
      </p>
    </div>
  );
}
```

### ViewportUtils

Utility functions for responsive scaling.

```jsx
import { scaleValue, responsiveFontSize } from './components/ViewportUtils';

function YourComponent() {
  const { width } = useViewport();
  
  return (
    <div style={{ 
      padding: `${scaleValue(1, width)}rem`,
      fontSize: responsiveFontSize(16, width)
    }}>
      Responsive content
    </div>
  );
}
```

## Breakpoints

The system uses the following breakpoints:

- Mobile: < 640px
- Tablet: 640px - 1023px
- Desktop: 1024px - 1279px
- Widescreen: 1280px - 1535px
- Ultrawide: 1536px - 2559px
- UHD (2K): 2560px - 3839px
- 4K: >= 3840px

## Demo

Visit `/viewport-demo` route to see a demonstration of the viewport system in action.

## Best Practices

1. **Wrap top-level components** with `ViewportContainer` for consistent scaling
2. **Use the `useViewport` hook** for conditional rendering based on viewport size
3. **Scale font sizes and spacing** using the provided utilities
4. **Test across different devices** and screen sizes to ensure proper responsiveness
5. **Use the debug component** during development to visualize the current viewport state

## Use Cases for 4K Support

- **Data visualization dashboards** that benefit from expanded screen real estate
- **Media-rich applications** where high-definition content is displayed
- **Multi-pane interfaces** that can show more information at once
- **Design and creative tools** that benefit from precise pixel manipulation
- **Presentation and showcasing applications** viewed on large displays

## Performance Considerations

While 4K displays provide additional screen real estate, they can also impact performance. Keep these tips in mind:

- Use efficient rendering techniques like virtualization for large lists
- Optimize image loading based on viewport size
- Consider lazy-loading components that are not visible in the initial viewport
- Use `React.memo` and other optimization techniques for components that render frequently