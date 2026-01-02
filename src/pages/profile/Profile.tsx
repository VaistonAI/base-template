import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserCircle, FaEnvelope, FaShieldAlt } from 'react-icons/fa';

export const Profile: React.FC = () => {
    const { currentUser } = useAuth();

    if (!currentUser) return null;

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Mi Perfil</h2>
                    <p className="text-text-secondary">Gestiona tu información personal</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tarjeta de Resumen */}
                    <Card className="md:col-span-1 flex flex-col items-center text-center p-6">
                        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <FaUserCircle className="text-8xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary">{currentUser.displayName}</h3>
                        <p className="text-text-secondary mb-4 capitalize">{currentUser.role}</p>

                        <div className="w-full pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                                <FaShieldAlt className="text-primary" />
                                <span>Cuenta verificada</span>
                            </div>
                        </div>
                    </Card>

                    {/* Información Detallada */}
                    <Card className="md:col-span-2">
                        <h3 className="text-lg font-semibold text-text-primary mb-6">Información Personal</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    Nombre Completo
                                </label>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <FaUserCircle className="text-text-secondary" />
                                    <span className="text-text-primary font-medium">{currentUser.displayName}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    Correo Electrónico
                                </label>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <FaEnvelope className="text-text-secondary" />
                                    <span className="text-text-primary font-medium">{currentUser.email}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    Rol en el Sistema
                                </label>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <FaShieldAlt className="text-text-secondary" />
                                    <span className="text-text-primary font-medium capitalize">{currentUser.role}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-text-primary mb-2">Permisos</h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">Gestión de Usuarios</span>
                                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">Vista Dashboard</span>
                                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">Reportes</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};
