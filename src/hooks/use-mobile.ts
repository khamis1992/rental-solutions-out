
import { useEffect, useState } from 'react';
import { UseIsMobileResult } from '@/types/hooks.types';

export const useIsMobile = (): UseIsMobileResult => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Listen for resize events
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return { isMobile };
};
