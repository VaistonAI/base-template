import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AssistantContextType {
    showAssistant: (message?: string) => void;
    hideAssistant: () => void;
    isAssistantOpen: boolean;
    welcomeMessage: string | undefined;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const useAssistant = () => {
    const context = useContext(AssistantContext);
    if (!context) {
        throw new Error('useAssistant must be used within an AssistantProvider');
    }
    return context;
};

interface AssistantProviderProps {
    children: ReactNode;
}

export const AssistantProvider: React.FC<AssistantProviderProps> = ({ children }) => {
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [welcomeMessage, setWelcomeMessage] = useState<string | undefined>(undefined);

    const showAssistant = (message?: string) => {
        setWelcomeMessage(message);
        setIsAssistantOpen(true);
    };

    const hideAssistant = () => {
        setIsAssistantOpen(false);
        // Reset welcome message after a delay to allow smooth transition
        setTimeout(() => setWelcomeMessage(undefined), 300);
    };

    return (
        <AssistantContext.Provider
            value={{
                showAssistant,
                hideAssistant,
                isAssistantOpen,
                welcomeMessage,
            }}
        >
            {children}
        </AssistantContext.Provider>
    );
};
