
import { useEffect } from 'react';

/**
 * Hook to inject styles for sort icons globally
 * This can be called from any component, preferably high in the component tree
 */
export const useSortIconStyles = () => {
  useEffect(() => {
    // Check if the style already exists to avoid duplicates
    if (document.getElementById('global-sort-icon-styles')) return;
    
    // Create and inject a style tag
    const styleEl = document.createElement('style');
    styleEl.setAttribute('id', 'global-sort-icon-styles');
    
    // These styles target Lucide icons specifically
    styleEl.innerHTML = `
      /* Target all Lucide icons in sorting contexts */
      button svg[class*="lucide-ArrowUpDown"],
      [role="menuitem"] svg[class*="lucide"],
      span[class*="badge"] svg[class*="lucide-ArrowUpAZ"],
      span[class*="badge"] svg[class*="lucide-ArrowDownAZ"] {
        color: #3B82F6 !important;
        stroke: #3B82F6 !important;
      }
    `;
    
    document.head.appendChild(styleEl);
    
    // Clean up on unmount
    return () => {
      const existingStyle = document.getElementById('global-sort-icon-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
};
