import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { SuccessModal } from '../ui/SuccessModal';
import { AlertModal } from '../ui/AlertModal';
import { firebaseService } from '../../services/firebaseService';
import { notificationService } from '../../services/notificationService';
import { Timestamp } from 'firebase/firestore';
import type { Consultation, ConsultationFormData } from '../../types/consultation';
import { useAuth } from '../../contexts/AuthContext';

interface ConsultationModalProps {
    consultation: Consultation | null;
    onClose: () => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({ consultation, onClose }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // Estados para modales personalizados
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState<ConsultationFormData>({
        patientId: '',
        patientName: '',
        psychologistId: '',
        officeId: '',
        date: new Date(),
        time: '09:00',
        duration: 60,
        status: 'scheduled',
        reason: '',
        notes: '',
        diagnosis: '',
        treatmentPlan: '',
        nextSessionGoals: '',
        amount: undefined,
        paymentMethod: undefined,
        tax: 16,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Eliminado efecto de autoseleccion de psicologo

    useEffect(() => {
        if (consultation) {
            const consultationDate = consultation.date.toDate();
            setFormData({
                patientId: consultation.patientId || '',
                patientName: consultation.patientName || '',
                psychologistId: consultation.psychologistId || '',
                officeId: consultation.officeId || '',
                date: consultationDate,
                time: `${consultationDate.getHours().toString().padStart(2, '0')}:${consultationDate.getMinutes().toString().padStart(2, '0')}`,
                duration: consultation.duration,
                status: consultation.status,
                reason: consultation.reason || '',
                notes: consultation.notes || '',
                diagnosis: consultation.diagnosis || '',
                treatmentPlan: consultation.treatmentPlan || '',
                nextSessionGoals: consultation.nextSessionGoals || '',
                amount: consultation.amount,
                paymentMethod: consultation.paymentMethod,
                tax: 16,
            });
        }
    }, [consultation]);

    // Eliminada funcion loadData

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.patientName?.trim()) newErrors.patientName = 'El título de la sesión es obligatorio';
        // if (!formData.officeId) newErrors.officeId = 'Campo Consultorio obligatorio'; // Opcional
        if (!formData.date) newErrors.date = 'Campo Fecha obligatorio';
        if (!formData.time) newErrors.time = 'Campo Hora obligatorio';
        if (!formData.duration || formData.duration <= 0) newErrors.duration = 'Duración debe ser mayor a 0';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            const [hours, minutes] = formData.time.split(':');
            // Usar la fecha local sin conversión UTC
            const dateStr = formData.date instanceof Date
                ? formData.date.toISOString().split('T')[0]
                : formData.date;
            const [year, month, day] = dateStr.split('-').map(Number);
            const consultationDate = new Date(year, month - 1, day, parseInt(hours), parseInt(minutes), 0, 0);

            const consultationData: any = {
                patientId: null,
                patientName: formData.patientName || 'Sesión General',
                psychologistId: null,
                psychologistName: '',
                officeId: null,
                officeName: '',
                date: Timestamp.fromDate(consultationDate),
                duration: formData.duration,
                status: formData.status,
                reason: formData.reason,
                notes: formData.notes,
                diagnosis: formData.diagnosis,
                treatmentPlan: formData.treatmentPlan,
                nextSessionGoals: formData.nextSessionGoals,
                updatedAt: Timestamp.now(),
            };

            let consultationId: string;

            if (consultation) {
                // Actualizar consulta existente
                await firebaseService.update('consultations', consultation.id, consultationData);
                consultationId = consultation.id;

                // Crear notificación de actualización
                await notificationService.createNotification(
                    currentUser!.uid,
                    'consultation_updated',
                    'Sesión actualizada',
                    `La sesión "${consultationData.patientName}" ha sido actualizada exitosamente.`,
                    consultation.id
                );
            } else {
                // Crear nueva consulta
                consultationId = await firebaseService.create('consultations', {
                    ...consultationData,
                    createdBy: currentUser?.uid || '',
                    createdAt: Timestamp.now(),
                });

                // Crear notificación de creación
                await notificationService.createNotification(
                    currentUser!.uid,
                    'consultation_created',
                    'Nueva sesión registrada',
                    `La sesión "${consultationData.patientName}" ha sido registrada exitosamente.`,
                    consultationId
                );

                await notificationService.createNotification(
                    currentUser!.uid,
                    'consultation_created',
                    'Nueva sesión registrada',
                    `La sesión "${consultationData.patientName}" ha sido registrada exitosamente.`,
                    consultationId
                );
            }

            setSuccessMessage('Sesión guardada correctamente');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error saving consultation:', error);
            setErrorMessage('Error al guardar la sesión');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal
                isOpen={true}
                onClose={onClose}
                title={consultation ? 'Editar Sesión' : 'Crear Sesión'}
                size="xl"
            >
                <div className="space-y-6">
                    <div className="space-y-4">
                        <Input
                            label="Título de la Sesión / Nombre del Cliente"
                            value={formData.patientName || ''}
                            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                            placeholder="Ej: Juan Pérez, Sesión de Grupo, etc."
                            error={errors.patientName}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Fecha"
                                type="date"
                                value={formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : ''}
                                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                                error={errors.date}
                            />
                            <Input
                                label="Hora"
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                error={errors.time}
                            />
                        </div>

                        <Input
                            label="Duración (minutos)"
                            type="number"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                            error={errors.duration}
                        />

                        <Select
                            label="Estado"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        >
                            <option value="scheduled">Programada</option>
                            <option value="in-progress">En Curso</option>
                            <option value="completed">Completada</option>
                            <option value="cancelled">Cancelada</option>
                        </Select>

                        <TextArea
                            label="Descripción / Motivo"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            rows={3}
                            placeholder="Motivo de la sesión"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button onClick={onClose} variant="secondary">
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} variant="primary" isLoading={loading}>
                            {consultation ? 'Actualizar' : 'Crear'} Sesión
                        </Button>
                    </div>
                </div>
            </Modal>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    onClose();
                }}
                title="¡Operación exitosa!"
                message={successMessage}
            />

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
