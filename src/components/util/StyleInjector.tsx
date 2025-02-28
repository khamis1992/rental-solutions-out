
import { useEffect } from 'react';

interface StyleInjectorProps {
  children?: React.ReactNode;
}

/**
 * This component injects additional CSS to help override specific styles
 * without having to modify protected system components.
 */
export const StyleInjector: React.FC<StyleInjectorProps> = ({ children }) => {
  useEffect(() => {
    // Create and inject a style element to override icon colors
    const styleEl = document.createElement('style');
    styleEl.setAttribute('id', 'injected-sort-icon-styles');
    
    // These styles will have very high specificity and !important flags
    styleEl.innerHTML = `
      /* Direct targeting of sort icons */
      svg[data-lucide="ArrowUpDown"],
      svg.lucide-ArrowUpDown,
      button svg.h-4.w-4,
      [class*="dropdown"] svg {
        color: #3B82F6 !important;
        stroke: #3B82F6 !important;
      }
      
      /* Target all Lucide icons in buttons */
      button svg[class*="lucide"],
      button svg[data-lucide] {
        color: #3B82F6 !important;
        stroke: #3B82F6 !important;
      }
    `;
    
    document.head.appendChild(styleEl);
    
    // Clean up on unmount
    return () => {
      const existingStyle = document.getElementById('injected-sort-icon-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
  
  return <>{children}</>;
};
