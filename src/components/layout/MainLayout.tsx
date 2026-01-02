import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <Sidebar />

            <div className="lg:ml-64">
                <Header />

                <main className="p-3 sm:p-6 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};
