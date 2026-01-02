import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { UserRole } from '../../types/user';
import { getPermissionsByRole } from '../../types/user';
import { firebaseService } from '../../services/firebaseService';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { generateInvitationToken, generateInvitationLink, getExpirationDate, copyToClipboard } from '../../utils/invitationUtils';
import { Timestamp } from 'firebase/firestore';
import { FaCopy, FaCheck, FaWhatsapp } from 'react-icons/fa';
import { AlertModal } from '../ui/AlertModal';

interface InvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    existingUsers: Array<{ email: string; displayName: string }>;
}

export const InvitationModal: React.FC<InvitationModalProps> = ({ isOpen, onClose, onSuccess, existingUsers }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        role: 'psychologist' as UserRole,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [invitationLink, setInvitationLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.displayName.trim()) {
            errors.displayName = 'El nombre es obligatorio';
        }
        if (!formData.email.trim()) {
            errors.email = 'El email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Email inválido';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !currentUser) return;

        // Verificar si el email ya existe
        const emailExists = existingUsers.some(
            user => user.email.toLowerCase() === formData.email.trim().toLowerCase()
        );

        if (emailExists) {
            const existingUser = existingUsers.find(
                user => user.email.toLowerCase() === formData.email.trim().toLowerCase()
            );
            setErrorMessage(
                `El correo ${formData.email} ya está registrado para ${existingUser?.displayName || 'un usuario existente'}. Por favor usa otro correo electrónico.`
            );
            setShowErrorModal(true);
            return;
        }

        setLoading(true);
        try {
            const token = generateInvitationToken();
            const permissions = getPermissionsByRole(formData.role);
            const expiresAt = getExpirationDate();

            const roleLabels = {
                admin: 'Administrador',
                psychologist: 'Psicólogo',
                receptionist: 'Recepcionista',
            };

            const invitationData = {
                token,
                displayName: formData.displayName.trim(),
                email: formData.email.trim(),
                role: formData.role,
                permissions,
                createdBy: currentUser.uid,
                expiresAt: Timestamp.fromDate(expiresAt),
                status: 'pending',
            };

            await firebaseService.create('invitations', invitationData);

            // Crear notificación de invitación
            await notificationService.createNotification(
                currentUser!.uid,
                'invitation_created',
                'Invitación enviada',
                `Se ha enviado una invitación a ${formData.email} para el rol de ${roleLabels[formData.role]}.`,
                token
            );

            const link = generateInvitationLink(token);
            setInvitationLink(link);
            onSuccess();
        } catch (error) {
            console.error('Error creating invitation:', error);
            setErrorMessage('Error al crear invitación. Por favor intenta nuevamente.');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        if (invitationLink) {
            const success = await copyToClipboard(invitationLink);
            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        }
    };

    const handleWhatsAppShare = () => {
        if (invitationLink) {
            const message = `Hola ${formData.displayName}, has sido invitado a unirte a nuestro sistema CRM. Completa tu registro usando el siguiente link: ${invitationLink}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    const handleClose = () => {
        setFormData({
            displayName: '',
            email: '',
            role: 'psychologist',
        });
        setFormErrors({});
        setInvitationLink(null);
        setCopied(false);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={invitationLink ? '¡Invitación Creada!' : 'Invitar Nuevo Usuario'}
        >
            {!invitationLink ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nombre Completo"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        error={formErrors.displayName}
                        required
                        maxLength={100}
                    />

                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        error={formErrors.email}
                        required
                        maxLength={100}
                    />

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Rol <span className="text-danger">*</span>
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                        >
                            <option value="admin">Administrador</option>
                            <option value="psychologist">Psicólogo</option>
                            <option value="receptionist">Recepcionista</option>
                        </select>
                    </div>

                    {formErrors.submit && (
                        <div className="text-danger text-sm">{formErrors.submit}</div>
                    )}

                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={loading}
                        >
                            Generar Invitación
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                        <p className="text-sm text-success font-medium mb-2">
                            ✓ Invitación creada exitosamente
                        </p>
                        <p className="text-sm text-text-secondary">
                            Comparte el siguiente link con <strong>{formData.displayName}</strong> para que complete su registro.
                            El link expira en 7 días.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Link de Invitación
                        </label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={invitationLink}
                                readOnly
                                className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-sm"
                            />
                            <Button
                                variant={copied ? 'success' : 'primary'}
                                onClick={handleCopyLink}
                                className="flex items-center gap-2"
                            >
                                {copied ? (
                                    <>
                                        <FaCheck /> Copiado
                                    </>
                                ) : (
                                    <>
                                        <FaCopy /> Copiar
                                    </>
                                )}
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleWhatsAppShare}
                            className="w-full flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600 border-green-500"
                        >
                            <FaWhatsapp className="text-xl" /> Enviar por WhatsApp
                        </Button>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            variant="primary"
                            onClick={handleClose}
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            <AlertModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="Error"
                message={errorMessage}
                type="error"
            />
        </Modal>
    );
};
