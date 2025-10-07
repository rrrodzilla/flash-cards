import { createContext } from 'react';
import type { User, Settings } from '../types';

export interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  isLoading: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
