import React, { createContext, useContext } from 'react';
import { experimentalSettingsManager } from "../core/ExperimentalSettingsManager.ts";
import {ExperimentalSettings} from "../models/ExperimentalSettings.ts";

interface ExperimentalSettingsContextType {
  experimentalSettings: ExperimentalSettings;
}

const ExperimentalSettingsContext = createContext<ExperimentalSettingsContextType | undefined>(
    undefined
);

export const ExperimentalSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const contextValue = {
    experimentalSettings: experimentalSettingsManager.getSettings(),
  };

  return (
      <ExperimentalSettingsContext.Provider value={contextValue}>
        {children}
      </ExperimentalSettingsContext.Provider>
  );
};

export const useExperimentalSettings = (): ExperimentalSettingsContextType => {
  const context = useContext(ExperimentalSettingsContext);
  if (!context) {
    throw new Error("useExperimentalSettings must be used within ExperimentalSettingsProvider");
  }
  return context;
};