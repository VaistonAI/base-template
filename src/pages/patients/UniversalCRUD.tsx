import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { AlertModal } from '../../components/ui/AlertModal';
import { Modal } from '../../components/ui/Modal';
import { firebaseService } from '../../services/firebaseService';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import type { EntityConfig, EntityField } from '../../types/config';

interface UniversalCRUDProps {
    config: EntityConfig;
}

export const UniversalCRUD: React.FC<UniversalCRUDProps> = ({ config }) => {
    const { currentUser } = useAuth();
    // Use proper type for dynamic records or keep as any[] if schema is unknown at compile time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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
    const [editingRecord, setEditingRecord] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<any | null>(null);

    useEffect(() => {
        loadRecords();
        setFormData(getInitialFormData());
    }, [config.name]); // Reload when entity changes

    const getInitialFormData = () => {
        const initialData: any = {};
        config.schema.forEach(field => {
            initialData[field.name] = '';
        });
        return initialData;
    };

    const loadRecords = async () => {
        setLoading(true);
        try {
            const data = await firebaseService.getAll(config.name);
            setRecords(data);
        } catch (error) {
            console.error('Error loading records:', error);
            setErrorMessage('Error al cargar registros');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredRecords = () => {
        if (!searchTerm.trim()) return records;
        const search = searchTerm.toLowerCase();
        return records.filter(record => {
            // Search in all text fields
            return config.schema.some(field => {
                const value = record[field.name];
                return value && String(value).toLowerCase().includes(search);
            });
        });
    };

    const getPaginatedRecords = () => {
        const filtered = getFilteredRecords();
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filtered.slice(startIndex, startIndex + itemsPerPage);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        config.schema.forEach(field => {
            if (field.required && !formData[field.name]) {
                errors[field.name] = `El campo ${field.label} es obligatorio`;
            }
        });
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenForm = (record?: any) => {
        if (record) {
            setEditingRecord(record);
            setFormData({ ...record });
        } else {
            setEditingRecord(null);
            setFormData(getInitialFormData());
        }
        setFormErrors({});
        setShowFormModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSaving(true);
        try {
            const recordData = { ...formData, createdBy: currentUser!.uid };

            if (editingRecord) {
                await firebaseService.update(config.name, editingRecord.id, recordData);
                setSuccessMessage('Registro actualizado correctamente');
            } else {
                await firebaseService.create(config.name, recordData);
                setSuccessMessage('Registro creado correctamente');
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
            await firebaseService.delete(config.name, recordToDelete.id);
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

    const renderFieldInput = (field: EntityField) => {
        switch (field.type) {
            case 'select':
                return (
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                        <select
                            value={formData[field.name]}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        >
                            <option value="">Seleccionar...</option>
                            {field.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        {formErrors[field.name] && <p className="text-red-500 text-xs">{formErrors[field.name]}</p>}
                    </div>
                );
            case 'textarea':
                return ( // Simplified TextArea for this example, or use the component if compatible
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                        <textarea
                            value={formData[field.name]}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                        {formErrors[field.name] && <p className="text-red-500 text-xs">{formErrors[field.name]}</p>}
                    </div>
                );
            default:
                return (
                    <Input
                        key={field.name}
                        label={field.label}
                        type={field.type}
                        value={formData[field.name]}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        error={formErrors[field.name]}
                    />
                );
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

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-text-primary">{config.label}</h2>
                        <p className="text-text-secondary mt-1">Gestión de {config.label}</p>
                    </div>
                    <Button variant="primary" onClick={() => handleOpenForm()} className="flex items-center gap-2">
                        <FaPlus /> Nuevo
                    </Button>
                </div>

                <Card>
                    <div className="p-4 border-b border-border">
                        <Input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    {config.schema.slice(0, 5).map(field => ( // Show first 5 fields in table
                                        <th key={field.name} className="text-left py-3 px-4 text-text-secondary font-medium">
                                            {field.label}
                                        </th>
                                    ))}
                                    <th className="text-right py-3 px-4 text-text-secondary font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getPaginatedRecords().map((record) => (
                                    <tr key={record.id} className="border-b border-border hover:bg-background transition-colors cursor-pointer" onClick={() => handleOpenForm(record)}>
                                        {config.schema.slice(0, 5).map(field => (
                                            <td key={field.name} className="py-3 px-4 text-text-primary">
                                                {record[field.name]}
                                            </td>
                                        ))}
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenForm(record); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                                                    <FaEdit />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); setRecordToDelete(record); setShowDeleteModal(true); }} className="p-2 text-danger hover:bg-danger/10 rounded-lg">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Form Modal */}
            <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)} title={editingRecord ? 'Editar' : 'Nuevo'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {config.schema.map(field => renderFieldInput(field))}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => setShowFormModal(false)}>Cancelar</Button>
                        <Button type="submit" variant="primary" isLoading={saving}>Guardar</Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Eliminar Registro"
                message={`¿Estás seguro de que deseas eliminar este registro?`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                isLoading={deleting}
            />

            <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Éxito" message={successMessage} />
            <AlertModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title="Error" message={errorMessage} type="error" />
        </MainLayout>
    );
};
