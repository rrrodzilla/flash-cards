import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, Settings } from '../types';
import { StorageKeys } from '../types';
import { getSettings, getUser } from '../storage';
import { AppContext, AppContextType } from './createAppContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [settings, setSettingsState] = useState<Settings>(getSettings());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem(StorageKeys.CURRENT_USER);

    if (storedUserId) {
      const user = getUser(storedUserId);
      if (user) {
        setCurrentUserState(user);
      } else {
        localStorage.removeItem(StorageKeys.CURRENT_USER);
      }
    }

    const storedSettings = getSettings();
    setSettingsState(storedSettings);

    setIsLoading(false);
  }, []);

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user);

    if (user) {
      localStorage.setItem(StorageKeys.CURRENT_USER, user.id);
    } else {
      localStorage.removeItem(StorageKeys.CURRENT_USER);
    }
  }, []);

  const setSettings = useCallback((newSettings: Settings) => {
    setSettingsState(newSettings);
  }, []);

  const value: AppContextType = {
    currentUser,
    setCurrentUser,
    settings,
    setSettings,
    isLoading,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
