import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AlertModal } from '../../components/ui/AlertModal';
import { validationMessages } from '../../utils/errorMessages';
import './Login.css';

// Componente de partículas flotantes
const FloatingParticles: React.FC = () => {
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([]);

    useEffect(() => {
        const newParticles = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            duration: Math.random() * 20 + 15
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute rounded-full bg-white/20"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        animation: `float ${particle.duration}s infinite ease-in-out`,
                        animationDelay: `${Math.random() * 5}s`
                    }}
                />
            ))}
        </div>
    );
};

import { useConfig } from '../../contexts/ConfigContext';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { config } = useConfig();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = validationMessages.email.required;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = validationMessages.email.invalid;
        }

        if (!formData.password) {
            newErrors.password = validationMessages.password.required;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (error: any) {
            setErrorMessage(error.message || 'Error al iniciar sesión');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    25% { transform: translateY(-20px) translateX(10px); }
                    50% { transform: translateY(-10px) translateX(-10px); }
                    75% { transform: translateY(-30px) translateX(5px); }
                }
                
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.1); }
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slide-up {
                    animation: slideInUp 0.6s ease-out forwards;
                }

                .animate-slide-down {
                    animation: slideInDown 0.6s ease-out forwards;
                }

                @media (max-width: 1023px) {
                    .mobile-full-height {
                        min-height: 100dvh;
                    }
                }
            `}</style>

            <div className="min-h-screen w-full flex flex-col lg:flex-row relative bg-white">
                {/* Lado Izquierdo - Sales Funnel - Oculto en móvil y tablet */}
                <div className="hidden lg:flex lg:w-1/2 h-screen bg-gradient-to-br from-[#1b527c] via-[#2d9bf0] to-[#0f6cbf] text-white relative overflow-hidden flex-col justify-between">
                    {/* Partículas flotantes */}
                    <FloatingParticles />

                    {/* Formas geométricas grandes y visibles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Hexágonos */}
                        <div className="absolute top-20 right-20 w-40 h-40 opacity-10">
                            <svg viewBox="0 0 100 100" className="w-full h-full animate-[rotate_30s_linear_infinite]">
                                <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className="absolute bottom-40 left-10 w-32 h-32 opacity-10">
                            <svg viewBox="0 0 100 100" className="w-full h-full animate-[rotate_25s_linear_infinite_reverse]">
                                <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>

                        {/* Círculos con glow */}
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border-2 border-[#55bff3]/20 animate-[pulse-glow_4s_ease-in-out_infinite]"></div>
                        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full border-2 border-[#55bff3]/20 animate-[pulse-glow_5s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}></div>

                        {/* Cuadrados rotados */}
                        <div className="absolute top-1/2 right-10 w-24 h-24 border-2 border-[#55bff3]/15 transform rotate-45 animate-[rotate_40s_linear_infinite]"></div>
                        <div className="absolute bottom-20 left-1/3 w-20 h-20 border-2 border-[#55bff3]/15 transform rotate-12 animate-[rotate_35s_linear_infinite_reverse]"></div>

                        {/* Triángulos */}
                        <div className="absolute top-40 left-1/2 w-32 h-32 opacity-10">
                            <svg viewBox="0 0 100 100" className="w-full h-full animate-[float_15s_ease-in-out_infinite]">
                                <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>

                        {/* Grid de puntos más visible */}
                        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
                                    <circle cx="15" cy="15" r="1.5" fill="currentColor" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#dots)" />
                        </svg>

                        {/* Líneas diagonales animadas */}
                        <div className="absolute inset-0">
                            <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#55bff3]/30 to-transparent transform -rotate-12"></div>
                            <div className="absolute top-2/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#55bff3]/30 to-transparent transform rotate-12"></div>
                            <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#55bff3]/30 to-transparent transform -rotate-6"></div>
                        </div>
                    </div>
                    {/* Partículas flotantes */}
                    <FloatingParticles />

                    {/* Formas geométricas grandes y visibles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Hexágonos */}
                        <div className="absolute top-20 right-20 w-40 h-40 opacity-10">
                            <svg viewBox="0 0 100 100" className="w-full h-full animate-[rotate_30s_linear_infinite]">
                                <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className="absolute bottom-40 left-10 w-32 h-32 opacity-10">
                            <svg viewBox="0 0 100 100" className="w-full h-full animate-[rotate_25s_linear_infinite_reverse]">
                                <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>

                        {/* Círculos con glow */}
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border-2 border-[#55bff3]/20 animate-[pulse-glow_4s_ease-in-out_infinite]"></div>
                        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full border-2 border-[#55bff3]/20 animate-[pulse-glow_5s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}></div>

                        {/* Cuadrados rotados */}
                        <div className="absolute top-1/2 right-10 w-24 h-24 border-2 border-[#55bff3]/15 transform rotate-45 animate-[rotate_40s_linear_infinite]"></div>
                        <div className="absolute bottom-20 left-1/3 w-20 h-20 border-2 border-[#55bff3]/15 transform rotate-12 animate-[rotate_35s_linear_infinite_reverse]"></div>

                        {/* Triángulos */}
                        <div className="absolute top-40 left-1/2 w-32 h-32 opacity-10">
                            <svg viewBox="0 0 100 100" className="w-full h-full animate-[float_15s_ease-in-out_infinite]">
                                <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>

                        {/* Grid de puntos más visible */}
                        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
                                    <circle cx="15" cy="15" r="1.5" fill="currentColor" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#dots)" />
                        </svg>

                        {/* Líneas diagonales animadas */}
                        <div className="absolute inset-0">
                            <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#55bff3]/30 to-transparent transform -rotate-12"></div>
                            <div className="absolute top-2/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#55bff3]/30 to-transparent transform rotate-12"></div>
                            <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#55bff3]/30 to-transparent transform -rotate-6"></div>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="relative z-10 h-full flex flex-col justify-between p-6 lg:p-8">
                        <div className="animate-slide-down">
                            {/* Logo */}
                            <div className="mb-6">
                                <img
                                    src="/images/logotipo-vaiston-byn.png"
                                    alt="Vaiston Logo"
                                    className="h-10 lg:h-12 w-auto drop-shadow-lg"
                                />
                            </div>

                            {/* Título Principal */}
                            <div className="mb-8">
                                <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight drop-shadow-lg">
                                    {config.projectName}
                                </h1>
                                <p className="text-base lg:text-lg text-white/90 drop-shadow">
                                    {config.description}
                                </p>
                            </div>

                            {/* Demo Badge */}
                            <div className="mb-6 inline-block">
                                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/30 shadow-lg">
                                    <p className="text-xs font-semibold">✨ Versión Demo</p>
                                </div>
                            </div>

                            {/* Características Clave - Expandidas */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-white/90 mb-3">Funcionalidades Principales</h3>

                                {/* Grid de 2 columnas para características */}
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        'Gestión de clientes',
                                        'Calendario inteligente',
                                        'Agenda de citas',
                                        'Reportes detallados',
                                        'Facturación automática',
                                        'Historial completo',
                                        'Multi-sucursal',
                                        'Recordatorios auto.',
                                        'Dashboard analítico',
                                        'Gestión de usuarios',
                                    ].map((feature, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 backdrop-blur-sm bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#55bff3] shadow-lg shadow-[#55bff3]/50 flex-shrink-0"></div>
                                            <p className="text-xs">{feature}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                {/* División elegante con efecto glassmorphism - Solo visible en desktop */}
                <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px z-20">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 rounded-full bg-white/40 backdrop-blur-sm border-2 border-white/60 shadow-lg"></div>
                    </div>
                </div>

                {/* Lado Derecho - Login con formas geométricas */}
                <div className="w-full lg:w-1/2 mobile-full-height flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
                    {/* Fondo - decorativo en móvil también */}
                    <div className="absolute inset-0 overflow-hidden opacity-20 lg:opacity-30">
                        <div className="absolute top-10 right-10 w-32 h-32 border border-[#1b527c]/20 rounded-full"></div>
                        <div className="absolute bottom-20 left-10 w-24 h-24 border border-[#55bff3]/20 transform rotate-45"></div>
                        <div className="absolute top-1/2 right-1/4 w-20 h-20 border border-[#2d9bf0]/20 rounded-lg transform rotate-12"></div>

                        {/* Grid sutil */}
                        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid-right" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <circle cx="20" cy="20" r="1" fill="#1b527c" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid-right)" />
                        </svg>
                    </div>

                    {/* Logo móvil - Solo visible en móvil/tablet */}
                    <div className="lg:hidden absolute top-4 left-4 z-20">
                        <img
                            src="/images/logotipo-vaiston.png"
                            alt="Vaiston Logo"
                            className="h-8 sm:h-10 w-auto drop-shadow-lg"
                        />
                    </div>

                    {/* Contenedor del formulario con scroll en móvil */}
                    <div className="w-full max-w-md relative z-10 mt-14 sm:mt-0 animate-slide-up">
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 lg:p-8 border border-gray-200/50 hover:shadow-3xl transition-shadow duration-300">
                            {/* Header del formulario */}
                            <div className="text-center mb-6 lg:mb-8">
                                <h2 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-800 mb-2">
                                    {config.loginTitle}
                                </h2>
                                <p className="text-sm lg:text-base text-gray-600">
                                    {config.loginSubtitle}
                                </p>
                            </div>

                            {/* Credenciales de Demo - Responsive */}
                            <div className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 border border-blue-200 hover:shadow-md transition-shadow">
                                <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                    Credenciales de Demo
                                </p>
                                <div className="space-y-1.5">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/60 rounded-lg px-3 py-2 gap-1">
                                        <span className="text-xs text-gray-600">Usuario:</span>
                                        <span className="text-xs font-mono font-semibold text-gray-800 break-all">admin@admin.com</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/60 rounded-lg px-3 py-2 gap-1">
                                        <span className="text-xs text-gray-600">Contraseña:</span>
                                        <span className="text-xs font-mono font-semibold text-gray-800">$Vaiston123</span>
                                    </div>
                                </div>
                            </div>

                            {/* Formulario */}
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">
                                <Input
                                    label="Correo Electrónico"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    error={errors.email}
                                    placeholder="tu@email.com"
                                    required
                                    className="text-sm sm:text-base"
                                />

                                <Input
                                    label="Contraseña"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    error={errors.password}
                                    placeholder="••••••••"
                                    required
                                    className="text-sm sm:text-base"
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full text-sm sm:text-base py-2.5 sm:py-3"
                                    isLoading={loading}
                                >
                                    Iniciar Sesión
                                </Button>
                            </form>

                            {/* Términos y Condiciones */}
                            <div className="mt-5 lg:mt-6 text-center">
                                <p className="text-xs sm:text-sm text-gray-500">
                                    Al iniciar sesión, aceptas nuestros{' '}
                                    <Link
                                        to="/terms"
                                        className="text-[#1b527c] hover:text-[#2d9bf0] font-medium underline hover:no-underline transition-colors"
                                    >
                                        Términos y Condiciones
                                    </Link>
                                </p>
                            </div>
                        </div>

                        {/* Footer adicional en móvil */}
                        <div className="mt-4 lg:hidden text-center text-xs text-gray-500">
                            <p>¿Necesitas ayuda? <a href="mailto:contacto@vaiston.com" className="text-[#1b527c] hover:text-[#2d9bf0] font-medium">Contáctanos</a></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Modal */}
            <AlertModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="Error"
                message={errorMessage}
                type="error"
            />
        </>
    );
};
