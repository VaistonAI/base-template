import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { AlertModal } from '../../components/ui/AlertModal';
import { ConsultationModal } from '../../components/consultations/ConsultationModal';
import { firebaseService } from '../../services/firebaseService';
import { notificationService } from '../../services/notificationService';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaList, FaClock, FaCheckCircle, FaTimesCircle, FaDollarSign, FaExclamationTriangle, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import type { Consultation } from '../../types/consultation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../../contexts/AuthContext';

const localizer = dateFnsLocalizer({
    format,
    parse: (str: string) => new Date(str),
    startOfWeek: () => new Date(),
    getDay: (date: Date) => date.getDay(),
    locales: { 'es': es },
});

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: Consultation;
    hasConflict?: boolean;
}

export const ConsultationList: React.FC = () => {
    const { currentUser } = useAuth();
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [calendarView, setCalendarView] = useState<View>('month');
    const [calendarDate, setCalendarDate] = useState(new Date());

    // Estados para búsqueda, ordenamiento y paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<'date' | 'patient' | 'status' | 'payment' | 'amount'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Modales personalizados
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [consultationToDelete, setConsultationToDelete] = useState<Consultation | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadConsultations();
    }, []);

    const loadConsultations = async () => {
        try {
            const data = await firebaseService.getAll<Consultation>('consultations');
            const sorted = data.sort((a, b) => b.date.toMillis() - a.date.toMillis());
            setConsultations(sorted);
        } catch (error) {
            console.error('Error loading consultations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar ordenamiento
    const handleSort = (field: 'date' | 'patient' | 'status' | 'payment' | 'amount') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
        setCurrentPage(1); // Reset a primera página al ordenar
    };

    const getSortIcon = (field: 'date' | 'patient' | 'status' | 'payment' | 'amount') => {
        if (sortField !== field) return <FaSort className="opacity-30" />;
        return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    // Filtrar y ordenar consultas
    const getFilteredAndSortedConsultations = () => {
        let filtered = consultations;

        // Aplicar búsqueda
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.patientName?.toLowerCase().includes(search) ||
                c.reason?.toLowerCase().includes(search) ||
                c.status?.toLowerCase().includes(search) ||
                c.paymentStatus?.toLowerCase().includes(search) ||
                c.amount?.toString().includes(search) ||
                format(c.date.toDate(), "dd 'de' MMMM, yyyy", { locale: es }).toLowerCase().includes(search) ||
                format(c.date.toDate(), 'HH:mm').includes(search)
            );
        }

        // Aplicar ordenamiento
        filtered = [...filtered].sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'date':
                    comparison = a.date.toMillis() - b.date.toMillis();
                    break;
                case 'patient':
                    comparison = (a.patientName || '').localeCompare(b.patientName || '');
                    break;
                case 'status':
                    comparison = (a.status || '').localeCompare(b.status || '');
                    break;
                case 'payment':
                    comparison = (a.paymentStatus || '').localeCompare(b.paymentStatus || '');
                    break;
                case 'amount':
                    comparison = (a.amount || 0) - (b.amount || 0);
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return filtered;
    };

    // Obtener consultas paginadas
    const getPaginatedConsultations = () => {
        const filtered = getFilteredAndSortedConsultations();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filtered.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(getFilteredAndSortedConsultations().length / itemsPerPage);


    // Detectar conflictos de horario
    const detectConflicts = useCallback((events: CalendarEvent[]): CalendarEvent[] => {
        return events.map(event => {
            const hasConflict = events.some(other =>
                other.id !== event.id &&
                event.start < other.end &&
                event.end > other.start
            );
            return { ...event, hasConflict };
        });
    }, []);

    // Convertir consultas a eventos del calendario
    const calendarEvents = useMemo(() => {
        const events: CalendarEvent[] = consultations.map(consultation => {
            const start = consultation.date.toDate();
            const end = new Date(start.getTime() + consultation.duration * 60000);

            return {
                id: consultation.id,
                title: `${consultation.patientName || 'Sin nombre'} - ${consultation.reason || 'Consulta'}`,
                start,
                end,
                resource: consultation,
            };
        });

        return detectConflicts(events);
    }, [consultations, detectConflicts]);

    const handleCreate = () => {
        setSelectedConsultation(null);
        setShowModal(true);
    };

    const handleEdit = (consultation: Consultation, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedConsultation(consultation);
        setShowModal(true);
        setShowEventModal(false);
    };

    const handleDeleteClick = (consultation: Consultation, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setConsultationToDelete(consultation);
        setShowDeleteModal(true);
        setShowEventModal(false);
    };

    const handleDelete = async () => {
        if (!consultationToDelete) return;

        setDeleting(true);
        try {
            const patientName = consultationToDelete.patientName;

            if (consultationToDelete.invoiceId) {
                await firebaseService.delete('invoices', consultationToDelete.invoiceId);
            }
            await firebaseService.delete('consultations', consultationToDelete.id);

            // Crear notificación de eliminación
            await notificationService.createNotification(
                currentUser!.uid,
                'consultation_deleted',
                'Consulta eliminada',
                `La consulta con ${patientName} ha sido eliminada del sistema.`,
                consultationToDelete.id
            );

            setSuccessMessage('Consulta eliminada correctamente');
            setShowDeleteModal(false);
            setShowSuccessModal(true);
            await loadConsultations();
        } catch (error) {
            console.error('Error deleting consultation:', error);
            setErrorMessage('Error al eliminar la consulta');
            setShowErrorModal(true);
        } finally {
            setDeleting(false);
            setConsultationToDelete(null);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedConsultation(null);
        loadConsultations();
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setShowEventModal(true);
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        const consultation = event.resource;
        let backgroundColor = '#3174ad';

        // Color según estado
        if (consultation.status === 'completed') backgroundColor = '#10b981';
        else if (consultation.status === 'cancelled') backgroundColor = '#ef4444';
        else if (consultation.status === 'in-progress') backgroundColor = '#f59e0b';

        // Resaltar conflictos
        if (event.hasConflict) {
            return {
                style: {
                    backgroundColor,
                    border: '3px solid #dc2626',
                    borderRadius: '5px',
                    opacity: 0.9,
                    color: 'white',
                    fontWeight: 'bold',
                }
            };
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            scheduled: { label: 'Programada', color: 'bg-blue-100 text-blue-800', icon: FaClock },
            'in-progress': { label: 'En Curso', color: 'bg-yellow-100 text-yellow-800', icon: FaClock },
            completed: { label: 'Completada', color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
            cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: FaTimesCircle },
        };
        const badge = badges[status as keyof typeof badges] || badges.scheduled;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                <Icon className="text-xs" />
                {badge.label}
            </span>
        );
    };

    const getPaymentBadge = (paymentStatus: string) => {
        if (paymentStatus === 'paid') {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaDollarSign className="text-xs" />
                    Pagada
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <FaClock className="text-xs" />
                Pendiente
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

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-text-primary">Sesiones</h2>
                        <p className="text-text-secondary mt-1">
                            Gestiona tu agenda: sesiones, citas y eventos.
                        </p>
                    </div>
                    <Button onClick={handleCreate} variant="primary" className="flex items-center">
                        <FaPlus className="mr-2" />
                        Nueva Sesión
                    </Button>
                </div>

                {/* Tabs */}
                <div className="border-b border-border">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-3 font-medium transition-colors border-b-2 ${viewMode === 'list'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <FaList />
                                Lista
                            </div>
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-4 py-3 font-medium transition-colors border-b-2 ${viewMode === 'calendar'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <FaCalendarAlt />
                                Calendario
                            </div>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FaClock className="text-2xl text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Programadas</p>
                                <p className="text-2xl font-bold text-text-primary">
                                    {consultations.filter(c => c.status === 'scheduled').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FaCheckCircle className="text-2xl text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Completadas</p>
                                <p className="text-2xl font-bold text-text-primary">
                                    {consultations.filter(c => c.status === 'completed').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <FaDollarSign className="text-2xl text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Pendientes Cobro</p>
                                <p className="text-2xl font-bold text-text-primary">
                                    {consultations.filter(c => c.paymentStatus === 'pending' && c.status === 'completed').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FaDollarSign className="text-2xl text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Pagadas</p>
                                <p className="text-2xl font-bold text-text-primary">
                                    {consultations.filter(c => c.paymentStatus === 'paid').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Consultations List */}
                {viewMode === 'list' && (
                    <Card>
                        {/* Barra de búsqueda */}
                        <div className="p-4 border-b border-border">
                            <Input
                                type="text"
                                placeholder="Buscar por fecha y hora, paciente, estado, pago o monto..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset a primera página al buscar
                                }}
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-background">
                                    <tr>
                                        <th
                                            onClick={() => handleSort('date')}
                                            className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                Fecha y Hora
                                                {getSortIcon('date')}
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleSort('patient')}
                                            className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                Paciente
                                                {getSortIcon('patient')}
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleSort('status')}
                                            className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                Estado
                                                {getSortIcon('status')}
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleSort('payment')}
                                            className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                Pago
                                                {getSortIcon('payment')}
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleSort('amount')}
                                            className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                Monto
                                                {getSortIcon('amount')}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-border">
                                    {getPaginatedConsultations().length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">
                                                {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay consultas registradas. Crea tu primera consulta.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        getPaginatedConsultations().map((consultation) => (
                                            <tr
                                                key={consultation.id}
                                                onClick={() => handleEdit(consultation)}
                                                className="hover:bg-background transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-text-primary">
                                                        {format(consultation.date.toDate(), "dd 'de' MMMM, yyyy", { locale: es })}
                                                    </div>
                                                    <div className="text-sm text-text-secondary">
                                                        {format(consultation.date.toDate(), 'HH:mm')} ({consultation.duration} min)
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-text-primary">
                                                        {consultation.patientName || 'Sin nombre'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(consultation.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getPaymentBadge(consultation.paymentStatus)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-text-primary">
                                                        {consultation.amount ? `$${consultation.amount.toLocaleString()}` : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => handleEdit(consultation, e)}
                                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                                            title="Editar"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteClick(consultation, e)}
                                                            className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                                                            title="Eliminar"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginador Personalizado */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-border flex items-center justify-between">
                                <div className="text-sm text-text-secondary">
                                    Página {currentPage} de {totalPages} ({getFilteredAndSortedConsultations().length} consultas)
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 rounded-lg border border-border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white hover:border-primary"
                                    >
                                        Primera
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 rounded-lg border border-border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white hover:border-primary"
                                    >
                                        Anterior
                                    </button>

                                    {/* Números de página */}
                                    <div className="flex gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page => {
                                                // Mostrar primera, última, actual y 2 adyacentes
                                                return page === 1 ||
                                                    page === totalPages ||
                                                    Math.abs(page - currentPage) <= 1;
                                            })
                                            .map((page, index, array) => (
                                                <React.Fragment key={page}>
                                                    {index > 0 && array[index - 1] !== page - 1 && (
                                                        <span className="px-2 py-1 text-text-secondary">...</span>
                                                    )}
                                                    <button
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                            ? 'bg-primary text-white border-primary'
                                                            : 'border border-border hover:bg-primary hover:text-white hover:border-primary'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                </React.Fragment>
                                            ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 rounded-lg border border-border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white hover:border-primary"
                                    >
                                        Siguiente
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 rounded-lg border border-border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white hover:border-primary"
                                    >
                                        Última
                                    </button>
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {/* Calendar View */}
                {viewMode === 'calendar' && (
                    <Card className="p-6">
                        <div style={{ height: '700px' }}>
                            <Calendar
                                localizer={localizer}
                                events={calendarEvents}
                                startAccessor="start"
                                endAccessor="end"
                                view={calendarView}
                                onView={setCalendarView}
                                date={calendarDate}
                                onNavigate={(newDate) => setCalendarDate(newDate)}
                                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                                onSelectEvent={handleSelectEvent}
                                eventPropGetter={eventStyleGetter}
                                toolbar={true}
                                messages={{
                                    next: "Siguiente",
                                    previous: "Anterior",
                                    today: "Hoy",
                                    month: "Mes",
                                    week: "Semana",
                                    day: "Día",
                                    agenda: "Agenda",
                                    date: "Fecha",
                                    time: "Hora",
                                    event: "Evento",
                                    noEventsInRange: "No hay consultas en este rango",
                                    showMore: (total: number) => `+ Ver más (${total})`
                                }}
                                culture="es"
                            />
                        </div>
                    </Card>
                )}
            </div>

            {/* Consultation Modal */}
            {showModal && (
                <ConsultationModal
                    consultation={selectedConsultation}
                    onClose={handleModalClose}
                />
            )}

            {/* Event Details Modal */}
            {showEventModal && selectedEvent && (
                <Modal
                    isOpen={showEventModal}
                    onClose={() => setShowEventModal(false)}
                    title="Detalles de la Sesión"
                    size="md"
                >
                    <div className="space-y-4">
                        {selectedEvent.hasConflict && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <FaExclamationTriangle className="text-red-600" />
                                <span className="text-sm text-red-800 font-medium">
                                    ⚠️ Esta consulta tiene conflicto de horario con otra
                                </span>
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-text-secondary">Paciente</label>
                                <p className="text-base text-text-primary font-medium">
                                    {selectedEvent.resource.patientName || 'Sin nombre'}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-text-secondary">Fecha y Hora</label>
                                <p className="text-base text-text-primary">
                                    {format(selectedEvent.start, "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-text-secondary">Duración</label>
                                <p className="text-base text-text-primary">
                                    {selectedEvent.resource.duration} minutos
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-text-secondary">Estado</label>
                                <div className="mt-1">
                                    {getStatusBadge(selectedEvent.resource.status)}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-text-secondary">Pago</label>
                                <div className="mt-1">
                                    {getPaymentBadge(selectedEvent.resource.paymentStatus)}
                                </div>
                            </div>

                            {selectedEvent.resource.reason && (
                                <div>
                                    <label className="text-sm font-medium text-text-secondary">Motivo</label>
                                    <p className="text-base text-text-primary">
                                        {selectedEvent.resource.reason}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-border">
                            <Button
                                onClick={() => handleEdit(selectedEvent.resource)}
                                variant="primary"
                                className="flex-1"
                            >
                                Editar
                            </Button>
                            <Button
                                onClick={() => handleDeleteClick(selectedEvent.resource)}
                                variant="secondary"
                                className="flex-1 text-danger hover:bg-danger/10"
                            >
                                Eliminar
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setConsultationToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Eliminar Sesión"
                message={`¿Estás seguro de que deseas eliminar esta sesión? Esta acción no se puede deshacer.${consultationToDelete?.invoiceId ? ' También se eliminará la factura vinculada.' : ''}`}
                confirmText="Eliminar"
                isLoading={deleting}
            />

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="¡Operación exitosa!"
                message={successMessage}
            />

            {/* Error Modal */}
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
