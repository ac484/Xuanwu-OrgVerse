'use client';
import { useContext } from 'react';
import { WbsContext } from '@/components/wbs/wbs-provider';

export function useWbs() {
  const context = useContext(WbsContext);
  if (context === undefined) {
    throw new Error('useWbs must be used within a WbsProvider');
  }
  return context;
}
