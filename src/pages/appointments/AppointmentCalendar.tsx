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
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import { Timestamp, orderBy } from 'firebase/firestore';
import type { Appointment, AppointmentStatus, AppointmentType } from '../../types/appointment';
import type { Patient } from '../../types/patient';
import type { Office } from '../../types/office';

export const AppointmentCalendar: React.FC = () => {
    const { currentUser } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [offices, setOffices] = useState<Office[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [formData, setFormData] = useState({
        patientId: '',
        officeId: '',
        date: '',
        time: '',
        duration: '60',
        type: 'followup' as AppointmentType,
        status: 'scheduled' as AppointmentStatus,
        notes: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [appointmentsData, consultationsData, patientsData, officesData] = await Promise.all([
                firebaseService.getAll<Appointment>('appointments', orderBy('date', 'asc')),
                firebaseService.getAll<any>('consultations', orderBy('date', 'asc')), // Cargar consultas también
                firebaseService.getAll<Patient>('patients'),
                firebaseService.getAll<Office>('offices'),
            ]);

            // Combinar appointments y consultations en un solo array
            // Marcar las consultas con un flag para diferenciarlas
            const consultationsAsAppointments = consultationsData.map(consultation => ({
                ...consultation,
                type: 'consultation' as any, // Tipo especial para consultas
                isConsultation: true, // Flag para identificar
            }));

            const allAppointments = [...appointmentsData, ...consultationsAsAppointments];

            setAppointments(allAppointments);
            setPatients(patientsData);
            setOffices(officesData);
        } catch (error) {
            console.error('Error loading data:', error);
            setErrorMessage('Error al cargar datos');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredAppointments = () => {
        if (!selectedDate) return appointments;

        const selected = new Date(selectedDate);
        return appointments.filter(apt => {
            const aptDate = apt.date.toDate();
            return aptDate.toDateString() === selected.toDateString();
        });
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.patientId) errors.patientId = 'El campo Paciente es obligatorio';
        if (!formData.officeId) errors.officeId = 'El campo Consultorio es obligatorio';
        if (!formData.date) errors.date = 'El campo Fecha es obligatorio';
        if (!formData.time) errors.time = 'El campo Hora es obligatorio';
        if (!formData.duration || Number(formData.duration) < 15) {
            errors.duration = 'La duración mínima es 15 minutos';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenForm = (appointment?: Appointment) => {
        if (appointment) {
            setEditingAppointment(appointment);
            const aptDate = appointment.date.toDate();
            setFormData({
                patientId: appointment.patientId,
                officeId: appointment.officeId,
                date: aptDate.toISOString().split('T')[0],
                time: aptDate.toTimeString().slice(0, 5),
                duration: appointment.duration.toString(),
                type: appointment.type,
                status: appointment.status,
                notes: appointment.notes,
            });
        } else {
            setEditingAppointment(null);
            setFormData({
                patientId: '',
                officeId: '',
                date: selectedDate,
                time: '09:00',
                duration: '60',
                type: 'followup',
                status: 'scheduled',
                notes: '',
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
            const office = offices.find(o => o.id === formData.officeId);

            if (!patient || !office) {
                throw new Error('Paciente u oficina no encontrados');
            }

            const dateTime = new Date(`${formData.date}T${formData.time}`);

            const appointmentData = {
                patientId: formData.patientId,
                patientName: `${patient.firstName} ${patient.lastName}`,
                officeId: formData.officeId,
                officeName: office.name,
                psychologistId: currentUser!.uid,
                psychologistName: currentUser!.displayName,
                date: Timestamp.fromDate(dateTime),
                duration: Number(formData.duration),
                type: formData.type,
                status: formData.status,
                notes: formData.notes.trim(),
                createdBy: currentUser!.uid,
            };

            if (editingAppointment) {
                await firebaseService.update('appointments', editingAppointment.id, appointmentData);
                setSuccessMessage('Cita actualizada correctamente');
            } else {
                await firebaseService.create('appointments', appointmentData);
                setSuccessMessage('Cita creada correctamente');
            }

            setShowFormModal(false);
            setShowSuccessModal(true);
            await loadData();
        } catch (error) {
            console.error('Error saving appointment:', error);
            setErrorMessage('Error al guardar cita');
            setShowErrorModal(true);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!appointmentToDelete) return;

        setDeleting(true);
        try {
            await firebaseService.delete('appointments', appointmentToDelete.id);
            setSuccessMessage('Cita eliminada correctamente');
            setShowDeleteModal(false);
            setShowSuccessModal(true);
            await loadData();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            setErrorMessage('Error al eliminar cita');
            setShowErrorModal(true);
        } finally {
            setDeleting(false);
            setAppointmentToDelete(null);
        }
    };

    const getStatusBadge = (status: AppointmentStatus) => {
        const styles = {
            scheduled: 'bg-info/10 text-info',
            confirmed: 'bg-primary/10 text-primary',
            in_progress: 'bg-warning/10 text-warning',
            completed: 'bg-success/10 text-success',
            cancelled: 'bg-danger/10 text-danger',
            no_show: 'bg-danger/10 text-danger',
        };
        const labels = {
            scheduled: 'Programada',
            confirmed: 'Confirmada',
            in_progress: 'En Progreso',
            completed: 'Completada',
            cancelled: 'Cancelada',
            no_show: 'No Asistió',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
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

    const filteredAppointments = getFilteredAppointments();

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-text-primary">Citas</h2>
                        <p className="text-text-secondary mt-1">Gestiona tu calendario de citas</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2"
                    >
                        <FaPlus /> Nueva Cita
                    </Button>
                </div>

                <Card>
                    <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-text-secondary" />
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            showCharCount={false}
                        />
                    </div>
                </Card>

                <Card>
                    {filteredAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-text-secondary">No hay citas para esta fecha</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredAppointments.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="p-4 border border-border rounded-lg hover:bg-background transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-semibold text-text-primary">
                                                    {appointment.date.toDate().toLocaleTimeString('es-MX', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                <span className="text-text-secondary">•</span>
                                                <span className="text-text-primary">{appointment.patientName}</span>
                                                <span className="text-text-secondary">•</span>
                                                <span className="text-text-secondary">{appointment.duration} min</span>
                                            </div>
                                            <p className="text-sm text-text-secondary mb-2">
                                                {appointment.officeName}
                                            </p>
                                            {appointment.notes && (
                                                <p className="text-sm text-text-secondary italic">
                                                    {appointment.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(appointment.status)}
                                            <button
                                                onClick={() => handleOpenForm(appointment)}
                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAppointmentToDelete(appointment);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
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
                title={editingAppointment ? 'Editar Cita' : 'Nueva Cita'}
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

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Consultorio <span className="text-danger">*</span>
                        </label>
                        <select
                            value={formData.officeId}
                            onChange={(e) => setFormData({ ...formData, officeId: e.target.value })}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                        >
                            <option value="">Seleccionar consultorio</option>
                            {offices.map(office => (
                                <option key={office.id} value={office.id}>
                                    {office.name}
                                </option>
                            ))}
                        </select>
                        {formErrors.officeId && (
                            <p className="text-sm text-danger mt-1">{formErrors.officeId}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Duración (minutos)"
                            type="number"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            error={formErrors.duration}
                            required
                            min="15"
                            showCharCount={false}
                        />
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1">
                                Tipo <span className="text-danger">*</span>
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as AppointmentType })}
                                className="w-full px-4 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                            >
                                <option value="initial">Inicial</option>
                                <option value="followup">Seguimiento</option>
                                <option value="emergency">Emergencia</option>
                                <option value="group">Grupal</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Estado <span className="text-danger">*</span>
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                        >
                            <option value="scheduled">Programada</option>
                            <option value="confirmed">Confirmada</option>
                            <option value="in_progress">En Progreso</option>
                            <option value="completed">Completada</option>
                            <option value="cancelled">Cancelada</option>
                            <option value="no_show">No Asistió</option>
                        </select>
                    </div>

                    <TextArea
                        label="Notas"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        maxLength={500}
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
                            {editingAppointment ? 'Actualizar' : 'Crear'} Cita
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setAppointmentToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Eliminar Cita"
                message={`¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.`}
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
