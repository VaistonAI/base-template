import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AlertModal } from '../../components/ui/AlertModal';
import { FcGoogle } from 'react-icons/fc';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { validationMessages, getRequiredFieldError } from '../../utils/errorMessages';

interface PasswordValidation {
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasSpecialChar: boolean;
    hasMinLength: boolean;
    passwordsMatch: boolean;
}

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register, loginWithGoogle } = useAuth();

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
        hasUpperCase: false,
        hasLowerCase: false,
        hasSpecialChar: false,
        hasMinLength: false,
        passwordsMatch: false,
    });

    // Validar contraseña en tiempo real
    useEffect(() => {
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;

        setPasswordValidation({
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            hasMinLength: password.length >= 6,
            passwordsMatch: password === confirmPassword && password.length > 0,
        });
    }, [formData.password, formData.confirmPassword]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.displayName.trim()) {
            newErrors.displayName = validationMessages.name.required;
        }

        if (!formData.email.trim()) {
            newErrors.email = validationMessages.email.required;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = validationMessages.email.invalid;
        }

        if (!formData.password) {
            newErrors.password = validationMessages.password.required;
        } else if (!passwordValidation.hasUpperCase || !passwordValidation.hasLowerCase ||
            !passwordValidation.hasSpecialChar || !passwordValidation.hasMinLength) {
            newErrors.password = 'La contraseña no cumple con todos los requisitos';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = getRequiredFieldError('Confirmar Contraseña');
        } else if (!passwordValidation.passwordsMatch) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            await register(formData.email, formData.password, formData.displayName);
            navigate('/dashboard');
        } catch (error: any) {
            setErrorMessage(error.message || 'Error al registrar usuario');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
            // Usar window.location para forzar recarga completa
            window.location.href = '/dashboard';
        } catch (error: any) {
            setErrorMessage(error.message || 'Error al registrarse con Google');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const ValidationItem: React.FC<{ isValid: boolean; text: string }> = ({ isValid, text }) => (
        <div className="flex items-center gap-2">
            {isValid ? (
                <FaCheck className="text-success text-sm" />
            ) : (
                <FaTimes className="text-danger text-sm" />
            )}
            <span className={`text-sm ${isValid ? 'text-success' : 'text-text-secondary'}`}>
                {text}
            </span>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-accent-2 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img
                        src="/images/logotipo-vaiston.png"
                        alt="Vaiston Logo"
                        className="h-16 mx-auto mb-4"
                    />
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        Crear Cuenta
                    </h1>
                    <p className="text-text-secondary">
                        Regístrate en el CRM
                    </p>
                </div>

                {/* Google Login - Botón principal */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer disabled:opacity-50 mb-6"
                >
                    <FcGoogle className="text-2xl" />
                    <span className="font-medium text-text-primary">Continuar con Google</span>
                </button>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-text-secondary">O usa tu correo</span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nombre Completo"
                        type="text"
                        placeholder="Juan Pérez"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        error={errors.displayName}
                        required
                        maxLength={100}
                    />

                    <Input
                        label="Correo Electrónico"
                        type="email"
                        placeholder="tu@correo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        error={errors.email}
                        required
                        maxLength={100}
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        error={errors.password}
                        required
                        maxLength={50}
                        showCharCount={false}
                    />

                    <Input
                        label="Confirmar Contraseña"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        error={errors.confirmPassword}
                        required
                        maxLength={50}
                        showCharCount={false}
                    />

                    {/* Password Validation Checklist */}
                    {formData.password && (
                        <div className="bg-background p-4 rounded-lg space-y-2">
                            <p className="text-sm font-medium text-text-primary mb-2">
                                Requisitos de la contraseña:
                            </p>
                            <ValidationItem
                                isValid={passwordValidation.hasUpperCase}
                                text="Mínimo una letra mayúscula"
                            />
                            <ValidationItem
                                isValid={passwordValidation.hasLowerCase}
                                text="Mínimo una letra minúscula"
                            />
                            <ValidationItem
                                isValid={passwordValidation.hasSpecialChar}
                                text="Mínimo un caracter especial"
                            />
                            <ValidationItem
                                isValid={passwordValidation.hasMinLength}
                                text="Al menos 6 caracteres"
                            />
                            <ValidationItem
                                isValid={passwordValidation.passwordsMatch}
                                text="Ambas contraseñas coinciden"
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={loading}
                    >
                        Registrarse
                    </Button>
                </form>

                {/* Login Link */}
                <p className="text-center mt-6 text-text-secondary">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-primary hover:text-accent-1 font-medium cursor-pointer">
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>

            {/* Error Modal */}
            <AlertModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="Error de registro"
                message={errorMessage}
                type="error"
            />
        </div>
    );
};
