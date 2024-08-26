import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settings } from '../ts/options';

interface SettingsContextProps {
  animations: boolean;
  labels: boolean;
  numBottles: number;
  bottleLength: number;
  emptyBottles: number;
  selectedPalette: number;
  seed: string;
  setAnimations: (value: boolean) => void;
  setLabels: (value: boolean) => void;
  setNumBottles: (value: number) => void;
  setBottleLength: (value: number) => void;
  setEmptyBottles: (value: number) => void;
  setSelectedPalette: (value: number) => void;
  setSeed: (value: string) => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [animations, setAnimations] = useState<boolean>(settings.animations);
  const [labels, setLabels] = useState<boolean>(settings.labels);
  const [numBottles, setNumBottles] = useState<number>(settings.numBottles);
  const [bottleLength, setBottleLength] = useState<number>(settings.bottleLength);
  const [emptyBottles, setEmptyBottles] = useState<number>(settings.emptyBottles);
  const [selectedPalette, setSelectedPalette] = useState<number>(settings.selectedPalette);
  const [seed, setSeed] = useState<string>(settings.seed);

  // Sync state with the settings object
  useEffect(() => {
    settings.animations = animations;
  }, [animations]);

  useEffect(() => {
    settings.labels = labels;
  }, [labels]);

  useEffect(() => {
    settings.numBottles = numBottles;
  }, [numBottles]);

  useEffect(() => {
    settings.bottleLength = bottleLength;
  }, [bottleLength]);

  useEffect(() => {
    settings.emptyBottles = emptyBottles;
  }, [emptyBottles]);

  useEffect(() => {
    settings.selectedPalette = selectedPalette;
  }, [selectedPalette]);

  useEffect(() => {
    settings.seed = seed;
  }, [seed]);

  return (
    <SettingsContext.Provider
      value={{
        animations,
        labels,
        numBottles,
        bottleLength,
        emptyBottles,
        selectedPalette,
        seed,
        setAnimations,
        setLabels,
        setNumBottles,
        setBottleLength,
        setEmptyBottles,
        setSelectedPalette,
        setSeed,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextProps => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
