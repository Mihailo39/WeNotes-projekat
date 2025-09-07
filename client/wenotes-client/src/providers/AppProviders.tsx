import React, { type ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Centralizovani provider komponenta koja omotava sve Context provider-e
 * Olakšava upravljanje provider-ima i omogućava lakše testiranje
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

export default AppProviders;
