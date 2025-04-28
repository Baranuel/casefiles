'use client'
import React, { createContext, useContext, ReactNode } from "react";

interface ConfigContextType {
  BASE_API_URL: string;
}

const defaultConfig: ConfigContextType = {
  BASE_API_URL: "",
};

const ConfigContext = createContext<ConfigContextType>(defaultConfig);

export const useConfig = () => useContext(ConfigContext);

interface ConfigProviderProps {
  children: ReactNode;
  variables: ConfigContextType;
}

export const ConfigProvider = ({
  children,
  variables,
}: ConfigProviderProps) => {
  const value = {
    ...variables,
  };

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
};
