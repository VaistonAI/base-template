import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ProjectConfig } from '../types/config';
import defaultConfig from '../config/projectConfig.json';

interface ConfigContextType {
    config: ProjectConfig;
    loading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<ProjectConfig>(defaultConfig as ProjectConfig);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real generic engine, we might fetch this from an API endpoint or load a JSON file dynamically.
        // For this architecture, we import the JSON directly which is rewritten by the Cloud Function.
        // So 'defaultConfig' IS the vital config.
        setConfig(defaultConfig as ProjectConfig);
        setLoading(false);
    }, []);

    return (
        <ConfigContext.Provider value={{ config, loading }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
