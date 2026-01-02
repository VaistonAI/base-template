import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { AlertModal } from '../../components/ui/AlertModal';
import { Modal } from '../../components/ui/Modal';
import { TextArea } from '../../components/ui/TextArea';
import { firebaseService } from '../../services/firebaseService';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaDatabase, FaCheckCircle, FaTimesCircle, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { Timestamp } from 'firebase/firestore';

// Generic Record Type
interface GenericRecord {
    id: string;
    // Basic Info
    title: string;
    description: string;
    code: string;
    // Contact
    email: string;
    phone: string;
    website: string;
    // Numeric
    quantity: number;
    price: number;
    rating: number;
    // Dates & Times
    startDate: Timestamp;
    endDate: Timestamp | null;
    appointmentTime: string;
    createdDateTime: Timestamp;
    // Selection
    category: 'category-a' | 'category-b' | 'category-c' | 'category-d';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'active' | 'inactive' | 'pending' | 'completed';
    // Boolean
    isActive: boolean;
    isFeatured: boolean;
    hasAttachments: boolean;
    // Choice
    type: 'option-1' | 'option-2' | 'option-3';
    // Visual
    color: string;
    fileReference: string;
    attachedFile: string; // File name or path
    // Long Text
    notes: string;
    comments: string;
    // Meta
    createdBy: string;
}

type SortField = 'title' | 'category' | 'priority' | 'status';
type SortDirection = 'asc' | 'desc';

export const PatientList: React.FC = () => {
    const { currentUser } = useAuth();
    const [records, setRecords] = useState<GenericRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('title');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Modals
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Form
    const [editingRecord, setEditingRecord] = useState<GenericRecord | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        code: '',
        email: '',
        phone: '',
        website: '',
        quantity: 0,
        price: 0,
        rating: 5,
        startDate: '',
        endDate: '',
        appointmentTime: '',
        createdDateTime: '',
        category: '' as GenericRecord['category'],
        priority: '' as GenericRecord['priority'],
        status: '' as GenericRecord['status'],
        isActive: true,
        isFeatured: false,
        hasAttachments: false,
        type: 'option-1' as GenericRecord['type'],
        color: '#3b82f6',
        fileReference: '',
        attachedFile: '',
        notes: '',
        comments: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<GenericRecord | null>(null);

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        try {
            const data = await firebaseService.getAll<GenericRecord>('patients');
            setRecords(data);
        } catch (error) {
            console.error('Error loading records:', error);
            setErrorMessage('Error al cargar registros');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredAndSortedRecords = () => {
        let filtered = records;

        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(record => {
                const categoryText = getCategoryLabel(record.category).toLowerCase();
                const priorityText = getPriorityLabel(record.priority).toLowerCase();
                const statusText = getStatusLabel(record.status).toLowerCase();
                return record.title.toLowerCase().includes(search) ||
                    record.code.toLowerCase().includes(search) ||
                    record.description.toLowerCase().includes(search) ||
                    categoryText.includes(search) ||
                    priorityText.includes(search) ||
                    statusText.includes(search);
            });
        }

        filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortField) {
                case 'title':
                    aValue = (a.title || '').toLowerCase();
                    bValue = (b.title || '').toLowerCase();
                    break;
                case 'category':
                    aValue = a.category || '';
                    bValue = b.category || '';
                    break;
                case 'priority':
                    const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
                    aValue = priorityOrder[a.priority] || 0;
                    bValue = priorityOrder[b.priority] || 0;
                    break;
                case 'status':
                    aValue = a.status || '';
                    bValue = b.status || '';
                    break;
                default:
                    aValue = '';
                    bValue = '';
            }
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    };

    const getPaginatedRecords = () => {
        const filtered = getFilteredAndSortedRecords();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filtered.slice(startIndex, endIndex);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <FaSort className="opacity-30" />;
        return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.title.trim()) errors.title = 'El campo Título es obligatorio';
        if (!formData.code.trim()) errors.code = 'El campo Código es obligatorio';
        if (!formData.email.trim()) {
            errors.email = 'El campo Email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Email inválido';
        }
        if (!formData.startDate) errors.startDate = 'El campo Fecha de Inicio es obligatorio';
        if (!formData.category) errors.category = 'El campo Categoría es obligatorio';
        if (!formData.priority) errors.priority = 'El campo Prioridad es obligatorio';
        if (!formData.status) errors.status = 'El campo Estado es obligatorio';
        if (formData.quantity < 0) errors.quantity = 'La cantidad no puede ser negativa';
        if (formData.price < 0) errors.price = 'El precio no puede ser negativo';
        if (formData.rating < 1 || formData.rating > 5) errors.rating = 'La calificación debe estar entre 1 y 5';
        if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
            errors.website = 'URL inválida (debe comenzar con http:// o https://)';
        }
        if (formData.endDate && formData.startDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end < start) {
                errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenForm = (record?: GenericRecord) => {
        if (record) {
            setEditingRecord(record);
            setFormData({
                title: record.title,
                description: record.description,
                code: record.code,
                email: record.email,
                phone: record.phone,
                website: record.website,
                quantity: record.quantity,
                price: record.price,
                rating: record.rating,
                startDate: record.startDate.toDate().toISOString().split('T')[0],
                endDate: record.endDate ? record.endDate.toDate().toISOString().split('T')[0] : '',
                appointmentTime: record.appointmentTime,
                createdDateTime: record.createdDateTime.toDate().toISOString().slice(0, 16),
                category: record.category,
                priority: record.priority,
                status: record.status,
                isActive: record.isActive,
                isFeatured: record.isFeatured,
                hasAttachments: record.hasAttachments,
                type: record.type,
                color: record.color,
                fileReference: record.fileReference,
                attachedFile: record.attachedFile,
                notes: record.notes,
                comments: record.comments,
            });
            setSelectedFile(null);
        } else {
            setEditingRecord(null);
            const now = new Date();
            setFormData({
                title: '',
                description: '',
                code: '',
                email: '',
                phone: '',
                website: '',
                quantity: 0,
                price: 0,
                rating: 5,
                startDate: now.toISOString().split('T')[0],
                endDate: '',
                appointmentTime: '09:00',
                createdDateTime: now.toISOString().slice(0, 16),
                category: '' as GenericRecord['category'],
                priority: '' as GenericRecord['priority'],
                status: '' as GenericRecord['status'],
                isActive: true,
                isFeatured: false,
                hasAttachments: false,
                type: 'option-1' as GenericRecord['type'],
                color: '#3b82f6',
                fileReference: '',
                attachedFile: '',
                notes: '',
                comments: '',
            });
            setSelectedFile(null);
        }
        setFormErrors({});
        setShowFormModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFormData({ ...formData, attachedFile: file.name });
        } else {
            setSelectedFile(null);
            setFormData({ ...formData, attachedFile: '' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSaving(true);
        try {
            const recordData: Omit<GenericRecord, 'id'> = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                code: formData.code.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                website: formData.website.trim(),
                quantity: formData.quantity,
                price: formData.price,
                rating: formData.rating,
                startDate: Timestamp.fromDate(new Date(formData.startDate)),
                endDate: formData.endDate ? Timestamp.fromDate(new Date(formData.endDate)) : null,
                appointmentTime: formData.appointmentTime,
                createdDateTime: Timestamp.fromDate(new Date(formData.createdDateTime)),
                category: formData.category,
                priority: formData.priority,
                status: formData.status,
                isActive: formData.isActive,
                isFeatured: formData.isFeatured,
                hasAttachments: formData.hasAttachments,
                type: formData.type,
                color: formData.color,
                fileReference: formData.fileReference.trim(),
                attachedFile: formData.attachedFile.trim(),
                notes: formData.notes.trim(),
                comments: formData.comments.trim(),
                createdBy: currentUser!.uid,
            };

            if (editingRecord) {
                await firebaseService.update('patients', editingRecord.id, recordData);
                setSuccessMessage('Registro actualizado correctamente');

                await notificationService.createNotification(
                    currentUser!.uid,
                    'record_updated',
                    'Registro actualizado',
                    `El registro "${formData.title}" ha sido actualizado exitosamente.`,
                    editingRecord.id
                );
            } else {
                const newRecordId = await firebaseService.create('patients', recordData);
                setSuccessMessage('Registro creado correctamente');

                await notificationService.createNotification(
                    currentUser!.uid,
                    'record_created',
                    'Nuevo registro creado',
                    `El registro "${formData.title}" ha sido creado exitosamente.`,
                    newRecordId
                );
            }

            setShowFormModal(false);
            setShowSuccessModal(true);
            await loadRecords();
        } catch (error) {
            console.error('Error saving record:', error);
            setErrorMessage('Error al guardar registro');
            setShowErrorModal(true);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!recordToDelete) return;

        setDeleting(true);
        try {
            await firebaseService.delete('patients', recordToDelete.id);

            await notificationService.createNotification(
                currentUser!.uid,
                'record_deleted',
                'Registro eliminado',
                `El registro "${recordToDelete.title}" ha sido eliminado del sistema.`,
                recordToDelete.id
            );

            setSuccessMessage('Registro eliminado correctamente');
            setShowDeleteModal(false);
            setShowSuccessModal(true);
            await loadRecords();
        } catch (error) {
            console.error('Error deleting record:', error);
            setErrorMessage('Error al eliminar registro');
            setShowErrorModal(true);
        } finally {
            setDeleting(false);
            setRecordToDelete(null);
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            'category-a': 'Categoría A',
            'category-b': 'Categoría B',
            'category-c': 'Categoría C',
            'category-d': 'Categoría D',
        };
        return labels[category] || category;
    };

    const getPriorityLabel = (priority: string) => {
        const labels: Record<string, string> = {
            low: 'Baja',
            medium: 'Media',
            high: 'Alta',
            urgent: 'Urgente',
        };
        return labels[priority] || priority;
    };

    const getPriorityBadge = (priority: string) => {
        const styles: Record<string, string> = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[priority]}`}>
                {getPriorityLabel(priority)}
            </span>
        );
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            active: 'Activo',
            inactive: 'Inactivo',
            pending: 'Pendiente',
            completed: 'Completado',
        };
        return labels[status] || status;
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-success/10 text-success',
            inactive: 'bg-gray-100 text-gray-800',
            pending: 'bg-warning/10 text-warning',
            completed: 'bg-primary/10 text-primary',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {getStatusLabel(status)}
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

    const filteredRecords = getFilteredAndSortedRecords();
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const activeRecords = records.filter(r => r.status === 'active').length;
    const inactiveRecords = records.filter(r => r.status === 'inactive').length;

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-text-primary">CRUD</h2>
                        <p className="text-text-secondary mt-1">
                            Gestiona tus registros de manera eficiente
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2"
                    >
                        <FaPlus /> Nuevo Registro
                    </Button>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm mb-1">Total Registros</p>
                                <p className="text-3xl font-bold text-text-primary">{records.length}</p>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <FaDatabase className="text-3xl text-primary" />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm mb-1">Registros Activos</p>
                                <p className="text-3xl font-bold text-success">{activeRecords}</p>
                            </div>
                            <div className="p-3 bg-success/10 rounded-lg">
                                <FaCheckCircle className="text-3xl text-success" />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm mb-1">Registros Inactivos</p>
                                <p className="text-3xl font-bold text-warning">{inactiveRecords}</p>
                            </div>
                            <div className="p-3 bg-warning/10 rounded-lg">
                                <FaTimesCircle className="text-3xl text-warning" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Records Table */}
                <Card>
                    <div className="p-4 border-b border-border">
                        <Input
                            type="text"
                            placeholder="Buscar por título, código, categoría, prioridad o estado..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {filteredRecords.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-text-secondary">
                                {searchTerm ? 'No se encontraron registros' : 'No hay registros creados'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th
                                                className="text-left py-3 px-4 text-text-secondary font-medium hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => handleSort('title')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Título
                                                    {getSortIcon('title')}
                                                </div>
                                            </th>
                                            <th
                                                className="text-left py-3 px-4 text-text-secondary font-medium hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => handleSort('category')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Categoría
                                                    {getSortIcon('category')}
                                                </div>
                                            </th>
                                            <th
                                                className="text-left py-3 px-4 text-text-secondary font-medium hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => handleSort('priority')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Prioridad
                                                    {getSortIcon('priority')}
                                                </div>
                                            </th>
                                            <th
                                                className="text-left py-3 px-4 text-text-secondary font-medium hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => handleSort('status')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Estado
                                                    {getSortIcon('status')}
                                                </div>
                                            </th>
                                            <th className="text-right py-3 px-4 text-text-secondary font-medium">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getPaginatedRecords().map((record) => (
                                            <tr
                                                key={record.id}
                                                className="border-b border-border hover:bg-background transition-colors cursor-pointer"
                                                onClick={() => handleOpenForm(record)}
                                            >
                                                <td className="py-3 px-4">
                                                    <p className="font-medium text-text-primary">
                                                        {record.title}
                                                    </p>
                                                    <p className="text-xs text-text-secondary">{record.code}</p>
                                                </td>
                                                <td className="py-3 px-4 text-text-secondary">
                                                    {getCategoryLabel(record.category)}
                                                </td>
                                                <td className="py-3 px-4">{getPriorityBadge(record.priority)}</td>
                                                <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenForm(record);
                                                            }}
                                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                                            title="Editar"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setRecordToDelete(record);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                                                            title="Eliminar"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-text-secondary">
                                            Página {currentPage} de {totalPages} ({filteredRecords.length} registros)
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 rounded-lg border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                            >
                                                Primera
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 rounded-lg border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                            >
                                                Anterior
                                            </button>

                                            <div className="flex items-center gap-1">
                                                {currentPage > 2 && (
                                                    <>
                                                        <button
                                                            onClick={() => setCurrentPage(1)}
                                                            className="px-3 py-1 rounded-lg border border-border hover:bg-background transition-colors text-sm"
                                                        >
                                                            1
                                                        </button>
                                                        {currentPage > 3 && <span className="px-2 text-text-secondary">...</span>}
                                                    </>
                                                )}

                                                {currentPage > 1 && (
                                                    <button
                                                        onClick={() => setCurrentPage(currentPage - 1)}
                                                        className="px-3 py-1 rounded-lg border border-border hover:bg-background transition-colors text-sm"
                                                    >
                                                        {currentPage - 1}
                                                    </button>
                                                )}

                                                <button
                                                    className="px-3 py-1 rounded-lg bg-primary text-white border border-primary text-sm font-medium"
                                                >
                                                    {currentPage}
                                                </button>

                                                {currentPage < totalPages && (
                                                    <button
                                                        onClick={() => setCurrentPage(currentPage + 1)}
                                                        className="px-3 py-1 rounded-lg border border-border hover:bg-background transition-colors text-sm"
                                                    >
                                                        {currentPage + 1}
                                                    </button>
                                                )}
                                                {currentPage < totalPages - 1 && (
                                                    <>
                                                        {currentPage < totalPages - 2 && <span className="px-2 text-text-secondary">...</span>}
                                                        <button
                                                            onClick={() => setCurrentPage(totalPages)}
                                                            className="px-3 py-1 rounded-lg border border-border hover:bg-background transition-colors text-sm"
                                                        >
                                                            {totalPages}
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 rounded-lg border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                            >
                                                Siguiente
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(totalPages)}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 rounded-lg border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                            >
                                                Última
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Card>
            </div>

            {/* Form Modal */}
            <Modal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                title={editingRecord ? 'Editar Registro' : 'Nuevo Registro'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información Básica */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">
                            Información Básica
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Título"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                error={formErrors.title}
                                maxLength={100}
                            />
                            <Input
                                label="Código"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                error={formErrors.code}
                                maxLength={50}
                            />
                        </div>
                        <Input
                            label="Descripción"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            maxLength={200}
                        />
                    </div>

                    {/* Información de Contacto */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">
                            Información de Contacto
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                error={formErrors.email}
                                maxLength={100}
                            />
                            <Input
                                label="Teléfono"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setFormData({ ...formData, phone: value });
                                }}
                                maxLength={20}
                                placeholder="1234567890"
                            />
                        </div>
                        <Input
                            label="Sitio Web"
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            error={formErrors.website}
                            placeholder="https://ejemplo.com"
                            maxLength={200}
                        />
                    </div>

                    {/* Detalles Numéricos */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">
                            Detalles Numéricos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Cantidad"
                                type="number"
                                value={formData.quantity.toString()}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                error={formErrors.quantity}
                                min={0}
                                showCharCount={false}
                            />
                            <Input
                                label="Precio"
                                type="number"
                                value={formData.price.toString()}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                error={formErrors.price}
                                min={0}
                                step={0.01}
                                showCharCount={false}
                            />
                            <Input
                                label="Calificación (1-5)"
                                type="number"
                                value={formData.rating.toString()}
                                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
                                error={formErrors.rating}
                                min={1}
                                max={5}
                                showCharCount={false}
                            />
                        </div>
                    </div>

                    {/* Fechas y Horarios */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">
                            Fechas y Horarios
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Fecha de Inicio"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                error={formErrors.startDate}
                                showCharCount={false}
                            />
                            <Input
                                label="Fecha de Fin"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                error={formErrors.endDate}
                                showCharCount={false}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Hora de Cita"
                                type="time"
                                value={formData.appointmentTime}
                                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                                showCharCount={false}
                            />
                            <Input
                                label="Fecha y Hora de Creación"
                                type="datetime-local"
                                value={formData.createdDateTime}
                                onChange={(e) => setFormData({ ...formData, createdDateTime: e.target.value })}
                                showCharCount={false}
                            />
                        </div>
                    </div>

                    {/* Clasificación */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">
                            Clasificación
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">
                                    Categoría <span className="text-danger">*</span>
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer ${formErrors.category ? 'border-danger' : 'border-border'
                                        }`}
                                >
                                    <option value="" disabled>Seleccionar opción</option>
                                    <option value="category-a">Categoría A</option>
                                    <option value="category-b">Categoría B</option>
                                    <option value="category-c">Categoría C</option>
                                    <option value="category-d">Categoría D</option>
                                </select>
                                {formErrors.category && (
                                    <p className="text-danger text-xs mt-1">{formErrors.category}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">
                                    Prioridad <span className="text-danger">*</span>
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer ${formErrors.priority ? 'border-danger' : 'border-border'
                                        }`}
                                >
                                    <option value="" disabled>Seleccionar opción</option>
                                    <option value="low">Baja</option>
                                    <option value="medium">Media</option>
                                    <option value="high">Alta</option>
                                    <option value="urgent">Urgente</option>
                                </select>
                                {formErrors.priority && (
                                    <p className="text-danger text-xs mt-1">{formErrors.priority}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">
                                    Estado <span className="text-danger">*</span>
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer ${formErrors.status ? 'border-danger' : 'border-border'
                                        }`}
                                >
                                    <option value="" disabled>Seleccionar opción</option>
                                    <option value="active">Activo</option>
                                    <option value="inactive">Inactivo</option>
                                    <option value="pending">Pendiente</option>
                                    <option value="completed">Completado</option>
                                </select>
                                {formErrors.status && (
                                    <p className="text-danger text-xs mt-1">{formErrors.status}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Opciones (Checkboxes y Radio) */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">
                            Opciones
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                />
                                <span className="text-sm text-text-primary">Activo</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                    className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                />
                                <span className="text-sm text-text-primary">Destacado</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hasAttachments}
                                    onChange={(e) => setFormData({ ...formData, hasAttachments: e.target.checked })}
                                    className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                />
                                <span className="text-sm text-text-primary">Tiene Adjuntos</span>
                            </label>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Tipo
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="option-1"
                                        checked={formData.type === 'option-1'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    />
                                    <span className="text-sm text-text-primary">Opción 1</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="option-2"
                                        checked={formData.type === 'option-2'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    />
                                    <span className="text-sm text-text-primary">Opción 2</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="option-3"
                                        checked={formData.type === 'option-3'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    />
                                    <span className="text-sm text-text-primary">Opción 3</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">
                            Visual
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">
                                    Color
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-12 h-10 border border-border rounded cursor-pointer"
                                    />
                                    <Input
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        maxLength={7}
                                        placeholder="#3b82f6"
                                    />
                                </div>
                            </div>
                            <Input
                                label="Referencia de Archivo"
                                value={formData.fileReference}
                                onChange={(e) => setFormData({ ...formData, fileReference: e.target.value })}
                                placeholder="/ruta/al/archivo.pdf"
                                maxLength={200}
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1">
                                Adjuntar Archivo
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-text-secondary
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-lg file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-primary file:text-white
                                        hover:file:bg-primary/90
                                        file:cursor-pointer cursor-pointer
                                        border border-border rounded-lg p-2"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                                />
                                {formData.attachedFile && (
                                    <div className="flex items-center gap-2 text-sm text-text-secondary bg-background p-2 rounded-lg">
                                        <span className="font-medium">Archivo seleccionado:</span>
                                        <span className="text-primary">{formData.attachedFile}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setFormData({ ...formData, attachedFile: '' });
                                            }}
                                            className="ml-auto text-danger hover:text-danger/80 text-xs"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">
                            Notas y Comentarios
                        </h3>
                        <TextArea
                            label="Notas"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            maxLength={500}
                            rows={3}
                        />
                        <TextArea
                            label="Comentarios"
                            value={formData.comments}
                            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                            maxLength={500}
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-border">
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
                            {editingRecord ? 'Actualizar' : 'Crear'} Registro
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setRecordToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Eliminar Registro"
                message={`¿Estás seguro de que deseas eliminar el registro "${recordToDelete?.title}"? Esta acción no se puede deshacer.`}
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
