import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { AlertModal } from '../../components/ui/AlertModal';
import { firebaseService } from '../../services/firebaseService';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Timestamp, orderBy } from 'firebase/firestore';
import type { Session } from '../../types/session';
import type { Patient } from '../../types/patient';

export const SessionList: React.FC = () => {
    const { currentUser } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState('');

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [formData, setFormData] = useState({
        patientId: '',
        date: '',
        time: '',
        duration: '60',
        notes: '',
        progress: '',
        nextObjectives: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [sessionsData, patientsData] = await Promise.all([
                firebaseService.getAll<Session>('sessions', orderBy('date', 'desc')),
                firebaseService.getAll<Patient>('patients'),
            ]);

            setSessions(sessionsData);
            setPatients(patientsData);
        } catch (error) {
            console.error('Error loading data:', error);
            setErrorMessage('Error al cargar datos');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredSessions = () => {
        if (!selectedPatient) return sessions;
        return sessions.filter(s => s.patientId === selectedPatient);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.patientId) errors.patientId = 'El campo Paciente es obligatorio';
        if (!formData.date) errors.date = 'El campo Fecha es obligatorio';
        if (!formData.time) errors.time = 'El campo Hora es obligatorio';
        if (!formData.duration || Number(formData.duration) < 15) {
            errors.duration = 'La duración mínima es 15 minutos';
        }
        if (!formData.notes.trim()) errors.notes = 'El campo Notas es obligatorio';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenForm = (session?: Session) => {
        if (session) {
            setEditingSession(session);
            const sessionDate = session.date.toDate();
            setFormData({
                patientId: session.patientId,
                date: sessionDate.toISOString().split('T')[0],
                time: sessionDate.toTimeString().slice(0, 5),
                duration: session.duration.toString(),
                notes: session.notes,
                progress: session.progress,
                nextObjectives: session.nextObjectives,
            });
        } else {
            setEditingSession(null);
            setFormData({
                patientId: selectedPatient || '',
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                duration: '60',
                notes: '',
                progress: '',
                nextObjectives: '',
            });
        }
        setFormErrors({});
        setShowFormModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSaving(true);
        try {
            const patient = patients.find(p => p.id === formData.patientId);
            if (!patient) throw new Error('Paciente no encontrado');

            const dateTime = new Date(`${formData.date}T${formData.time}`);

            const sessionData = {
                patientId: formData.patientId,
                patientName: `${patient.firstName} ${patient.lastName}`,
                psychologistId: currentUser!.uid,
                psychologistName: currentUser!.displayName,
                date: Timestamp.fromDate(dateTime),
                duration: Number(formData.duration),
                notes: formData.notes.trim(),
                progress: formData.progress.trim(),
                nextObjectives: formData.nextObjectives.trim(),
                attachments: editingSession?.attachments || [],
                createdBy: currentUser!.uid,
            };

            if (editingSession) {
                await firebaseService.update('sessions', editingSession.id, sessionData);
                setSuccessMessage('Sesión actualizada correctamente');
            } else {
                await firebaseService.create('sessions', sessionData);
                setSuccessMessage('Sesión creada correctamente');
            }

            setShowFormModal(false);
            setShowSuccessModal(true);
            await loadData();
        } catch (error) {
            console.error('Error saving session:', error);
            setErrorMessage('Error al guardar sesión');
            setShowErrorModal(true);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!sessionToDelete) return;

        setDeleting(true);
        try {
            await firebaseService.delete('sessions', sessionToDelete.id);
            setSuccessMessage('Sesión eliminada correctamente');
            setShowDeleteModal(false);
            setShowSuccessModal(true);
            await loadData();
        } catch (error) {
            console.error('Error deleting session:', error);
            setErrorMessage('Error al eliminar sesión');
            setShowErrorModal(true);
        } finally {
            setDeleting(false);
            setSessionToDelete(null);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <Spinner size="lg" />
                </div>
            </MainLayout>
        );
    }

    const filteredSessions = getFilteredSessions();

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-text-primary">Sesiones Clínicas</h2>
                        <p className="text-text-secondary mt-1">Gestiona las sesiones y notas clínicas</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2"
                    >
                        <FaPlus /> Nueva Sesión
                    </Button>
                </div>

                <Card>
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Filtrar por Paciente
                        </label>
                        <select
                            value={selectedPatient}
                            onChange={(e) => setSelectedPatient(e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                        >
                            <option value="">Todos los pacientes</option>
                            {patients.map(patient => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.firstName} {patient.lastName}
                                </option>
                            ))}
                        </select>
                    </div>
                </Card>

                <Card>
                    {filteredSessions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-text-secondary">
                                {selectedPatient ? 'No hay sesiones para este paciente' : 'No hay sesiones registradas'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="p-4 border border-border rounded-lg hover:bg-background transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-semibold text-text-primary">
                                                    {session.date.toDate().toLocaleDateString('es-MX')}
                                                </span>
                                                <span className="text-text-secondary">•</span>
                                                <span className="text-text-primary">{session.patientName}</span>
                                                <span className="text-text-secondary">•</span>
                                                <span className="text-text-secondary">{session.duration} min</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenForm(session)}
                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSessionToDelete(session);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-sm font-medium text-text-primary mb-1">Notas:</p>
                                            <p className="text-sm text-text-secondary">{session.notes}</p>
                                        </div>
                                        {session.progress && (
                                            <div>
                                                <p className="text-sm font-medium text-text-primary mb-1">Progreso:</p>
                                                <p className="text-sm text-text-secondary">{session.progress}</p>
                                            </div>
                                        )}
                                        {session.nextObjectives && (
                                            <div>
                                                <p className="text-sm font-medium text-text-primary mb-1">Próximos Objetivos:</p>
                                                <p className="text-sm text-text-secondary">{session.nextObjectives}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            <Modal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                title={editingSession ? 'Editar Sesión' : 'Nueva Sesión'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Paciente <span className="text-danger">*</span>
                        </label>
                        <select
                            value={formData.patientId}
                            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                        >
                            <option value="">Seleccionar paciente</option>
                            {patients.map(patient => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.firstName} {patient.lastName}
                                </option>
                            ))}
                        </select>
                        {formErrors.patientId && (
                            <p className="text-sm text-danger mt-1">{formErrors.patientId}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Fecha"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            error={formErrors.date}
                            required
                            showCharCount={false}
                        />
                        <Input
                            label="Hora"
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            error={formErrors.time}
                            required
                            showCharCount={false}
                        />
                        <Input
                            label="Duración (min)"
                            type="number"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            error={formErrors.duration}
                            required
                            min="15"
                            showCharCount={false}
                        />
                    </div>

                    <TextArea
                        label="Notas de la Sesión"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        error={formErrors.notes}
                        required
                        maxLength={2000}
                        rows={4}
                    />

                    <TextArea
                        label="Evaluación del Progreso"
                        value={formData.progress}
                        onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                        maxLength={1000}
                        rows={3}
                    />

                    <TextArea
                        label="Objetivos para Próxima Sesión"
                        value={formData.nextObjectives}
                        onChange={(e) => setFormData({ ...formData, nextObjectives: e.target.value })}
                        maxLength={1000}
                        rows={3}
                    />

                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowFormModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={saving}
                        >
                            {editingSession ? 'Actualizar' : 'Crear'} Sesión
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSessionToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Eliminar Sesión"
                message={`¿Estás seguro de que deseas eliminar esta sesión? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                isLoading={deleting}
            />

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
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
        </MainLayout>
    );
};
