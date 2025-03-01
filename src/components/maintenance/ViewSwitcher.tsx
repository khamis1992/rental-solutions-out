
import React from 'react';
import { Button } from "@/components/ui/button";

interface ViewSwitcherProps {
  view: 'grid' | 'table';
  onChange: (view: 'grid' | 'table') => void;
}

export const ViewSwitcher = ({ view, onChange }: ViewSwitcherProps) => {
  return null; // Component disabled as per request to remove view toggles
};
