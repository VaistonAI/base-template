import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';
import {
    FaHome,
    FaCalendarAlt,
    FaFileInvoiceDollar,
    FaChartBar,
    FaUsersCog,
    FaBars,
    FaTimes,
    FaQuestionCircle,
    FaDownload,
    FaDatabase,
} from 'react-icons/fa';

import type { UserPermissions } from '../../types/user';

interface MenuItem {
    path: string;
    label: string;
    icon: React.ReactNode;
    permission?: keyof UserPermissions;
}

// Componente de partículas flotantes
const FloatingParticles: React.FC = () => {
    const [particles, setParticles] = useState<Array<{ id: number; y: number; size: number; duration: number }>>([]);

    useEffect(() => {
        const newParticles = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 15 + 10
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute rounded-full bg-white/10"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        animation: `float ${particle.duration}s infinite ease-in-out`,
                        animationDelay: `${Math.random() * 3}s`
                    }}
                />
            ))}
        </div>
    );
};

// Modal de Descarga
const DownloadModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                    <FaTimes className="text-gray-500" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <FaDownload className="text-3xl text-primary mx-auto mb-2" />
                    <h2 className="text-2xl font-bold text-gray-800">Descarga en tu teléfono</h2>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('android')}
                        className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${activeTab === 'android'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Android
                    </button>
                    <button
                        onClick={() => setActiveTab('ios')}
                        className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${activeTab === 'ios'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        iOS
                    </button>
                </div>

                {/* Content */}
                <div className="mb-6">
                    {activeTab === 'android' && (
                        <div className="space-y-4">
                            <ol className="space-y-3 text-gray-700 text-sm">
                                <li className="flex gap-3">
                                    <span className="font-bold text-primary flex-shrink-0">1.</span>
                                    <div className="flex-1">
                                        <span>Haz clic en instalar</span>
                                        <button
                                            onClick={() => {
                                                // Descargar archivo APK
                                                const link = document.createElement('a');
                                                link.href = '/crm-psicologos.apk';
                                                link.download = 'crm-psicologos.apk';
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="block mt-2 w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-3 rounded-lg transition-colors text-xs"
                                        >
                                            Descargar aplicación
                                        </button>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-primary flex-shrink-0">2.</span>
                                    <span>Espera a que la instalación se complete en tu celular</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-primary flex-shrink-0">3.</span>
                                    <span>Busca la aplicación en tu inicio e ingresa a ella</span>
                                </li>
                            </ol>
                        </div>
                    )}
                    {activeTab === 'ios' && (
                        <div className="space-y-3">
                            <ol className="space-y-3 text-gray-700 text-sm">
                                <li className="flex gap-3">
                                    <span className="font-bold text-primary flex-shrink-0">1.</span>
                                    <span>Haz click en el icono de compartir</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-primary flex-shrink-0">2.</span>
                                    <span>Encuentra y selecciona la opción Agregar al Inicio</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-primary flex-shrink-0">3.</span>
                                    <span>Haz click en Agregar y la app será agregada a tu celular</span>
                                </li>
                            </ol>
                        </div>
                    )}
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const { currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    if (!currentUser) return null;

    const { config } = useConfig();

    // Helper to dynamically get icon component
    const getIcon = (iconName: string) => {
        const icons: Record<string, React.ReactNode> = {
            FaHome: <FaHome />,
            FaCalendarAlt: <FaCalendarAlt />,
            FaFileInvoiceDollar: <FaFileInvoiceDollar />,
            FaChartBar: <FaChartBar />,
            FaUsersCog: <FaUsersCog />,
            FaQuestionCircle: <FaQuestionCircle />,
            FaDatabase: <FaDatabase />,
            FaUserInjured: <FaDatabase />, // Fallback for specific icons if needed or map correctly
            FaChartLine: <FaChartBar />, // Reuse chart icon or import specific
        };
        return icons[iconName] || <FaQuestionCircle />;
    };

    const menuItems: MenuItem[] = config.menuItems.map(item => ({
        path: item.path,
        label: item.label,
        icon: getIcon(item.icon),
        permission: item.permission as keyof UserPermissions | undefined
    }));

    const filteredMenuItems = menuItems.filter(item => {
        if (!item.permission) return true;
        return currentUser.permissions[item.permission];
    });

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    25% { transform: translateY(-15px) translateX(5px); }
                    50% { transform: translateY(-8px) translateX(-5px); }
                    75% { transform: translateY(-20px) translateX(3px); }
                }
            `}</style>

            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-br from-[#1b527c] to-[#2d9bf0] text-white rounded-lg cursor-pointer shadow-lg"
            >
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-gradient-to-b from-[#1b527c] via-[#2d9bf0] to-[#0f6cbf] transition-transform duration-300 z-40 overflow-hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64`}
            >
                {/* Partículas flotantes */}
                <FloatingParticles />

                {/* Formas geométricas de fondo */}
                <div className="absolute inset-0 overflow-hidden opacity-10">
                    <div className="absolute top-10 right-5 w-20 h-20">
                        <svg viewBox="0 0 100 100" className="w-full h-full animate-[float_20s_ease-in-out_infinite]">
                            <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="white" strokeWidth="2" />
                        </svg>
                    </div>
                    <div className="absolute bottom-20 left-5 w-16 h-16">
                        <svg viewBox="0 0 100 100" className="w-full h-full animate-[float_18s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}>
                            <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="2" />
                        </svg>
                    </div>
                </div>

                {/* Contenido */}
                <div className="relative z-10 h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/20">
                        <img
                            src="/images/logotipo-vaiston-byn.png"
                            alt="Vaiston Logo"
                            className="h-12 w-auto drop-shadow-lg"
                        />
                        <p className="text-xs text-white/80 mt-2 font-medium">Panel de Administración</p>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {filteredMenuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group
                ${isActive(item.path)
                                        ? 'bg-white/25 !text-white shadow-lg backdrop-blur-sm border border-white/30 hover:bg-white/40'
                                        : '!text-white/70 hover:bg-white/15 !hover:text-white hover:shadow-md hover:border hover:border-white/20'
                                    }`}
                            >
                                <span className={`text-xl transition-transform duration-200 ${!isActive(item.path) && 'group-hover:scale-110'}`}>{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Botón de Descarga - Solo en responsive */}
                    <div className="p-4 border-t border-white/20 lg:hidden">
                        <button
                            onClick={() => setShowDownloadModal(true)}
                            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <FaDownload className="text-lg" />
                            <span>Descarga en tu teléfono</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Modal de Descarga */}
            <DownloadModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} />
        </>
    );
};
