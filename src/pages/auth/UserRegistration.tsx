import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { firebaseService } from '../../services/firebaseService';
import { auth } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Timestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { isInvitationExpired } from '../../utils/invitationUtils';
import { FaCheck, FaTimes, FaUserPlus, FaShieldAlt } from 'react-icons/fa';
import type { Invitation } from '../../types/invitation';

// Componente de partículas flotantes (reutilizado)
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

// Validación de contraseña
interface PasswordRequirements {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
}

const validatePassword = (password: string): PasswordRequirements => {
    return {
        minLength: password.length >= 6,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
};

const isPasswordValid = (requirements: PasswordRequirements): boolean => {
    return Object.values(requirements).every(req => req === true);
};

export const UserRegistration: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const inviteToken = searchParams.get('invite');

    const [invitation, setInvitation] = useState<Invitation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
    });
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        validateInvitation();
    }, [inviteToken]);

    useEffect(() => {
        setPasswordRequirements(validatePassword(formData.password));
    }, [formData.password]);

    useEffect(() => {
        if (formData.confirmPassword) {
            setPasswordsMatch(formData.password === formData.confirmPassword);
        } else {
            setPasswordsMatch(true);
        }
    }, [formData.password, formData.confirmPassword]);

    const validateInvitation = async () => {
        if (!inviteToken) {
            setError('Link de invitación inválido');
            setLoading(false);
            return;
        }

        try {
            const inv = await firebaseService.getInvitationByToken(inviteToken);

            if (!inv) {
                setError('Invitación no encontrada');
                setLoading(false);
                return;
            }

            if (inv.status !== 'pending') {
                setError('Esta invitación ya ha sido utilizada');
                setLoading(false);
                return;
            }

            if (isInvitationExpired(inv)) {
                setError('Esta invitación ha expirado');
                setLoading(false);
                return;
            }

            setInvitation(inv);
            setLoading(false);
        } catch (err) {
            console.error('Error validating invitation:', err);
            setError('Error al validar la invitación');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!invitation) return;

        // Validar contraseña
        if (!isPasswordValid(passwordRequirements)) {
            setError('La contraseña no cumple con todos los requisitos');
            return;
        }

        if (!passwordsMatch) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // Crear usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                invitation.email,
                formData.password
            );

            // Crear documento de usuario en Firestore
            const userData = {
                uid: userCredential.user.uid,
                email: invitation.email,
                displayName: invitation.displayName,
                role: invitation.role,
                permissions: invitation.permissions,
                isActive: true,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                invitedBy: invitation.createdBy
            };

            await setDoc(doc(db, 'users', userCredential.user.uid), userData);

            // Actualizar estado de la invitación
            await firebaseService.update('invitations', invitation.id!, {
                status: 'accepted',
                acceptedAt: Timestamp.now(),
                userId: userCredential.user.uid
            });

            // Redirigir al dashboard
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Error creating user:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Este correo ya está registrado');
            } else {
                setError('Error al crear la cuenta. Por favor intenta de nuevo.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1b527c] to-[#2d9bf0]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error && !invitation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1b527c] to-[#2d9bf0] p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTimes className="text-3xl text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Invitación Inválida</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Button onClick={() => navigate('/login')} variant="primary">
                        Ir al Login
                    </Button>
                </div>
            </div>
        );
    }

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
            `}</style>

            <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
                {/* Lado Izquierdo - Información de Bienvenida */}
                <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#1b527c] via-[#2d9bf0] to-[#0f6cbf] text-white relative overflow-hidden">
                    {/* Partículas y formas geométricas (igual que login) */}
                    <FloatingParticles />

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

                        {/* Grid de puntos */}
                        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
                                    <circle cx="15" cy="15" r="1.5" fill="currentColor" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#dots)" />
                        </svg>
                    </div>

                    {/* Contenido */}
                    <div className="relative z-10 min-h-screen lg:min-h-0 flex flex-col justify-center p-8 lg:p-12">
                        {/* Logo */}
                        <div className="mb-8 lg:mb-12">
                            <img
                                src="/images/logotipo-vaiston-byn.png"
                                alt="Vaiston Logo"
                                className="h-12 lg:h-16 w-auto drop-shadow-lg"
                            />
                        </div>

                        {/* Título Principal */}
                        <div className="mb-8 lg:mb-12">
                            <div className="inline-flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <FaUserPlus className="text-2xl" />
                                </div>
                                <h1 className="text-3xl lg:text-5xl font-bold leading-tight drop-shadow-lg">
                                    ¡Bienvenido!
                                </h1>
                            </div>
                            <p className="text-lg lg:text-xl text-white/90 drop-shadow mb-6">
                                Has sido invitado a unirte a nuestro sistema de gestión para consultorios de psicología.
                            </p>
                            {invitation && (
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl">
                                    <p className="text-sm text-white/70 mb-2">Invitado como:</p>
                                    <p className="text-2xl font-bold mb-1">{invitation.displayName}</p>
                                    <p className="text-white/80">{invitation.email}</p>
                                    <div className="mt-3 pt-3 border-t border-white/20">
                                        <p className="text-sm text-white/70">Rol asignado:</p>
                                        <p className="text-lg font-semibold">{invitation.role === 'admin' ? 'Administrador' : invitation.role === 'psychologist' ? 'Psicólogo' : invitation.role === 'receptionist' ? 'Recepcionista' : 'Visualizador'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Características del Sistema */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold mb-4">Con este sistema podrás:</h3>
                            <div className="flex items-center gap-3 backdrop-blur-sm bg-white/5 p-3 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-[#55bff3] shadow-lg shadow-[#55bff3]/50"></div>
                                <p className="text-base lg:text-lg">Gestionar pacientes y expedientes completos</p>
                            </div>
                            <div className="flex items-center gap-3 backdrop-blur-sm bg-white/5 p-3 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-[#55bff3] shadow-lg shadow-[#55bff3]/50"></div>
                                <p className="text-base lg:text-lg">Agendar y organizar consultas</p>
                            </div>
                            <div className="flex items-center gap-3 backdrop-blur-sm bg-white/5 p-3 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-[#55bff3] shadow-lg shadow-[#55bff3]/50"></div>
                                <p className="text-base lg:text-lg">Generar facturas automáticamente</p>
                            </div>
                            <div className="flex items-center gap-3 backdrop-blur-sm bg-white/5 p-3 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-[#55bff3] shadow-lg shadow-[#55bff3]/50"></div>
                                <p className="text-base lg:text-lg">Recibir notificaciones en tiempo real</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* División elegante */}
                <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px z-20">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 rounded-full bg-white/40 backdrop-blur-sm border-2 border-white/60 shadow-lg"></div>
                    </div>
                </div>

                {/* Lado Derecho - Formulario de Registro */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen lg:min-h-0 relative overflow-hidden">
                    {/* Formas geométricas sutiles */}
                    <div className="absolute inset-0 overflow-hidden opacity-30">
                        <div className="absolute top-10 right-10 w-32 h-32 border border-[#1b527c]/20 rounded-full"></div>
                        <div className="absolute bottom-20 left-10 w-24 h-24 border border-[#55bff3]/20 transform rotate-45"></div>
                        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid-right" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <circle cx="20" cy="20" r="1" fill="#1b527c" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid-right)" />
                        </svg>
                    </div>

                    <div className="w-full max-w-md relative z-10">
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 lg:p-8 border border-gray-200/50">
                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#1b527c] to-[#2d9bf0] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaShieldAlt className="text-3xl text-white" />
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Crear Contraseña</h2>
                                <p className="text-sm lg:text-base text-gray-600">Configura una contraseña segura para tu cuenta</p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {/* Formulario */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <Input
                                    label="Contraseña"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                />

                                {/* Indicadores de requisitos de contraseña */}
                                {formData.password && (
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <p className="text-xs font-semibold text-gray-700 mb-2">Requisitos de contraseña:</p>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-xs">
                                                {passwordRequirements.minLength ? (
                                                    <FaCheck className="text-green-500" />
                                                ) : (
                                                    <FaTimes className="text-gray-400" />
                                                )}
                                                <span className={passwordRequirements.minLength ? 'text-green-700' : 'text-gray-600'}>
                                                    Mínimo 6 caracteres
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                {passwordRequirements.hasUpperCase ? (
                                                    <FaCheck className="text-green-500" />
                                                ) : (
                                                    <FaTimes className="text-gray-400" />
                                                )}
                                                <span className={passwordRequirements.hasUpperCase ? 'text-green-700' : 'text-gray-600'}>
                                                    Una letra mayúscula (A-Z)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                {passwordRequirements.hasLowerCase ? (
                                                    <FaCheck className="text-green-500" />
                                                ) : (
                                                    <FaTimes className="text-gray-400" />
                                                )}
                                                <span className={passwordRequirements.hasLowerCase ? 'text-green-700' : 'text-gray-600'}>
                                                    Una letra minúscula (a-z)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                {passwordRequirements.hasNumber ? (
                                                    <FaCheck className="text-green-500" />
                                                ) : (
                                                    <FaTimes className="text-gray-400" />
                                                )}
                                                <span className={passwordRequirements.hasNumber ? 'text-green-700' : 'text-gray-600'}>
                                                    Un número (0-9)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                {passwordRequirements.hasSpecialChar ? (
                                                    <FaCheck className="text-green-500" />
                                                ) : (
                                                    <FaTimes className="text-gray-400" />
                                                )}
                                                <span className={passwordRequirements.hasSpecialChar ? 'text-green-700' : 'text-gray-600'}>
                                                    Un carácter especial (!@#$%^&*)
                                                </span>
                                            </div>

                                            {/* Indicador de coincidencia de contraseñas */}
                                            {formData.confirmPassword && (
                                                <>
                                                    <div className="border-t border-gray-200 my-2 pt-2"></div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        {passwordsMatch ? (
                                                            <FaCheck className="text-green-500" />
                                                        ) : (
                                                            <FaTimes className="text-red-500" />
                                                        )}
                                                        <span className={passwordsMatch ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
                                                            {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Input
                                    label="Confirmar Contraseña"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    error={!passwordsMatch ? 'Las contraseñas no coinciden' : undefined}
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    isLoading={submitting}
                                    disabled={!isPasswordValid(passwordRequirements) || !passwordsMatch || !formData.confirmPassword}
                                >
                                    Crear Cuenta
                                </Button>
                            </form>

                            {/* Términos y Condiciones */}
                            <div className="mt-5 lg:mt-6 text-center">
                                <p className="text-xs text-gray-500">
                                    Al crear tu cuenta, aceptas nuestros{' '}
                                    <Link
                                        to="/terms"
                                        className="text-[#1b527c] hover:text-[#2d9bf0] font-medium underline"
                                    >
                                        Términos y Condiciones
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
