
import React from 'react';
import { StyleInjector } from './StyleInjector';

interface SortIconStyleWrapperProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that applies the StyleInjector
 * Can be used to wrap specific parts of the application that need the sort icon styling
 */
export const SortIconStyleWrapper: React.FC<SortIconStyleWrapperProps> = ({ children }) => {
  return (
    <StyleInjector>
      {children}
    </StyleInjector>
  );
};

// Export a hook to use the injector anywhere
export const useSortIconStyles = () => {
  React.useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('id', 'global-sort-icon-styles');
    
    styleEl.innerHTML = `
      svg[data-lucide="ArrowUpDown"],
      svg.lucide-ArrowUpDown,
      button svg.h-4.w-4 {
        color: #3B82F6 !important;
        stroke: #3B82F6 !important;
      }
    `;
    
    document.head.appendChild(styleEl);
    
    return () => {
      const existingStyle = document.getElementById('global-sort-icon-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
};
