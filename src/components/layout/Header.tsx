import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { ConfirmModal } from '../ui/ConfirmModal';
import { NotificationBell } from '../notifications/NotificationBell';

export const Header: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);


    const handleLogoutClick = () => {
        // El audio ya se detuvo en el onClick del botón
        handleLogout();
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            setIsLoggingOut(false);
            setShowLogoutModal(false);
        }
    };

    if (!currentUser) return null;

    return (
        <header className="bg-white border-b border-border px-4 sm:px-6 py-4 lg:px-6 lg:py-4">
            <div className="flex items-center justify-between gap-2 pt-12 lg:pt-0">
                {/* Title */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-2xl lg:text-2xl font-bold text-text-primary truncate">
                        Panel de Administración
                    </h1>
                    <p className="text-xs sm:text-sm lg:text-sm text-text-secondary truncate">
                        Bienvenido, {currentUser.displayName}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-4 lg:gap-4 flex-shrink-0">
                    {/* Notifications */}
                    <NotificationBell />

                    {/* User Menu Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                        >
                            <FaUserCircle size={32} className="text-primary" />
                            <div className="text-left">
                                <p className="text-sm font-medium text-text-primary">
                                    {currentUser.displayName}
                                </p>
                                <p className="text-xs text-text-secondary capitalize">
                                    {currentUser.role}
                                </p>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn">
                                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                        <p className="text-sm font-semibold text-text-primary">Cuenta</p>
                                        <p className="text-xs text-text-secondary mt-0.5">{currentUser.email}</p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            navigate('/profile');
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-primary hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                    >
                                        <FaUserCircle className="text-lg" />
                                        Mi Perfil
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowLogoutModal(true);
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-50 mt-1 pt-2"
                                    >
                                        <FaSignOutAlt className="text-lg" />
                                        Cerrar sesión
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <ConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogoutClick}
                title="Cerrar sesión"
                message="¿Estás seguro de que deseas cerrar sesión?"
                confirmText="Cerrar sesión"
                cancelText="Cancelar"
                isLoading={isLoggingOut}
            />
        </header>
    );
};
