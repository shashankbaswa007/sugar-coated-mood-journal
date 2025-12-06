import React, { createContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Mood } from '../types';

interface MoodContextType {
  currentMood: Mood | '';
  setCurrentMood: (mood: Mood | '') => void;
}

export const MoodContext = createContext<MoodContextType>({
  currentMood: '',
  setCurrentMood: () => {},
});

export const MoodProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [currentMood, setCurrentMood] = useLocalStorage<Mood | ''>('scmj.currentMood', '');

  // On a full page load at the Home route, clear any persisted mood so
  // mood options appear deselected until the user clicks one.
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.pathname === '/') {
        if (currentMood) setCurrentMood('');
      }
    } catch (e) {
      // ignore
    }
    // We only want to run this on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MoodContext.Provider value={{ currentMood, setCurrentMood }}>{children}</MoodContext.Provider>
  );
};