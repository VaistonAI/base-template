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
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaDoorOpen, FaCheckCircle, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import type { Office } from '../../types/office';

export const OfficeList: React.FC = () => {
    const { currentUser } = useAuth();
    const [offices, setOffices] = useState<Office[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<'name' | 'address' | 'capacity' | 'status'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [editingOffice, setEditingOffice] = useState<Office | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        capacity: '',
        equipment: '',
        notes: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [officeToDelete, setOfficeToDelete] = useState<Office | null>(null);

    useEffect(() => {
        loadOffices();
    }, []);

    const loadOffices = async () => {
        try {
            const data = await firebaseService.getAll<Office>('offices');
            setOffices(data);
        } catch (error) {
            console.error('Error loading offices:', error);
            setErrorMessage('Error al cargar consultorios');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: 'name' | 'address' | 'capacity' | 'status') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const getSortIcon = (field: 'name' | 'address' | 'capacity' | 'status') => {
        if (sortField !== field) return <FaSort className="opacity-30" />;
        return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    const getFilteredAndSortedOffices = () => {
        let filtered = offices;
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(office => {
                const statusText = office.isActive ? 'activo' : 'inactivo';
                return office.name?.toLowerCase().includes(search) ||
                    office.address?.toLowerCase().includes(search) ||
                    office.capacity?.toString().includes(search) ||
                    statusText.includes(search) ||
                    office.equipment?.join(', ').toLowerCase().includes(search);
            });
        }
        filtered = [...filtered].sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'name':
                    comparison = (a.name || '').localeCompare(b.name || '');
                    break;
                case 'address':
                    comparison = (a.address || '').localeCompare(b.address || '');
                    break;
                case 'capacity':
                    comparison = (a.capacity || 0) - (b.capacity || 0);
                    break;
                case 'status':
                    comparison = (a.isActive === b.isActive) ? 0 : a.isActive ? -1 : 1;
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
        return filtered;
    };

    const getPaginatedOffices = () => {
        const filtered = getFilteredAndSortedOffices();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filtered.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(getFilteredAndSortedOffices().length / itemsPerPage);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = 'El campo Nombre es obligatorio';
        if (!formData.address.trim()) errors.address = 'El campo Dirección es obligatorio';
        if (!formData.capacity.trim()) {
            errors.capacity = 'El campo Capacidad es obligatorio';
        } else if (isNaN(Number(formData.capacity)) || Number(formData.capacity) < 1) {
            errors.capacity = 'La capacidad debe ser un número mayor a 0';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenForm = (office?: Office) => {
        if (office) {
            setEditingOffice(office);
            setFormData({
                name: office.name,
                address: office.address,
                capacity: office.capacity.toString(),
                equipment: office.equipment.join(', '),
                notes: office.notes,
            });
        } else {
            setEditingOffice(null);
            setFormData({ name: '', address: '', capacity: '', equipment: '', notes: '' });
        }
        setFormErrors({});
        setShowFormModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSaving(true);
        try {
            const officeData = {
                name: formData.name.trim(),
                address: formData.address.trim(),
                capacity: Number(formData.capacity),
                equipment: formData.equipment.split(',').map(e => e.trim()).filter(e => e),
                schedule: {
                    monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
                    tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
                    wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
                    thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
                    friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
                    saturday: { isOpen: false, openTime: '09:00', closeTime: '14:00' },
                    sunday: { isOpen: false, openTime: '09:00', closeTime: '14:00' },
                },
                isActive: true,
                notes: formData.notes.trim(),
                createdBy: currentUser!.uid,
            };
            
            if (editingOffice) {
                await firebaseService.update('offices', editingOffice.id, officeData);
                setSuccessMessage('Consultorio actualizado correctamente');
                
                // Crear notificación de actualización
                await notificationService.createNotification(
                    currentUser!.uid,
                    'office_updated',
                    'Consultorio actualizado',
                    `El consultorio "${formData.name}" ha sido actualizado exitosamente.`,
                    editingOffice.id
                );
            } else {
                const newOfficeId = await firebaseService.create('offices', officeData);
                setSuccessMessage('Consultorio creado correctamente');
                
                // Crear notificación de creación
                await notificationService.createNotification(
                    currentUser!.uid,
                    'office_created',
                    'Nuevo consultorio registrado',
                    `El consultorio "${formData.name}" ha sido registrado exitosamente.`,
                    newOfficeId
                );
            }
            
            setShowFormModal(false);
            setShowSuccessModal(true);
            await loadOffices();
        } catch (error) {
            console.error('Error saving office:', error);
            setErrorMessage('Error al guardar consultorio');
            setShowErrorModal(true);
        } finally {
            setSaving(false);
        }
    };

            const handleDelete = async () => {
                if (!officeToDelete) return;
                setDeleting(true);
                try {
                    const officeName = officeToDelete.name;

                    await firebaseService.delete('offices', officeToDelete.id);

                    // Crear notificación de eliminación
                    await notificationService.createNotification(
                        currentUser!.uid,
                        'office_deleted',
                        'Consultorio eliminado',
                        `El consultorio "${officeName}" ha sido eliminado del sistema.`,
                        officeToDelete.id
                    );

                    setSuccessMessage('Consultorio eliminado correctamente');
                    setShowDeleteModal(false);
                    setShowSuccessModal(true);
                    await loadOffices();
                } catch (error) {
                    console.error('Error deleting office:', error);
                    setErrorMessage('Error al eliminar consultorio');
                    setShowErrorModal(true);
                } finally {
                    setDeleting(false);
                    setOfficeToDelete(null);
                }
            };

            const getStatusBadge = (isActive: boolean) => {
                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {isActive ? 'Activo' : 'Inactivo'}
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

            const totalOffices = offices.length;
            const activeOffices = offices.filter(o => o.isActive).length;
            const totalCapacity = offices.reduce((sum, o) => sum + o.capacity, 0);

            return (
                <MainLayout>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-text-primary">Consultorios</h2>
                                <p className="text-text-secondary mt-1">Gestiona tus consultorios y espacios</p>
                            </div>
                            <Button variant="primary" onClick={() => handleOpenForm()} className="flex items-center gap-2">
                                <FaPlus /> Nuevo Consultorio
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-text-secondary text-sm mb-1">Total Consultorios</p>
                                        <p className="text-2xl font-bold text-primary">{totalOffices}</p>
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <FaDoorOpen className="text-3xl text-primary" />
                                    </div>
                                </div>
                            </Card>
                            <Card>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-text-secondary text-sm mb-1">Consultorios Activos</p>
                                        <p className="text-2xl font-bold text-success">{activeOffices}</p>
                                    </div>
                                    <div className="p-3 bg-success/10 rounded-lg">
                                        <FaCheckCircle className="text-3xl text-success" />
                                    </div>
                                </div>
                            </Card>
                            <Card>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-text-secondary text-sm mb-1">Capacidad Total</p>
                                        <p className="text-2xl font-bold text-warning">{totalCapacity}</p>
                                    </div>
                                    <div className="p-3 bg-warning/10 rounded-lg">
                                        <FaDoorOpen className="text-3xl text-warning" />
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <Card>
                            <div className="p-4 border-b border-border">
                                <Input type="text" placeholder="Buscar por nombre, dirección, capacidad o estado..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                            </div>
                            {getPaginatedOffices().length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-text-secondary">{searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay consultorios registrados'}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-background">
                                            <tr>
                                                <th onClick={() => handleSort('name')} className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center gap-2">Nombre {getSortIcon('name')}</div>
                                                </th>
                                                <th onClick={() => handleSort('address')} className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center gap-2">Dirección {getSortIcon('address')}</div>
                                                </th>
                                                <th onClick={() => handleSort('capacity')} className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center gap-2">Capacidad {getSortIcon('capacity')}</div>
                                                </th>
                                                <th onClick={() => handleSort('status')} className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center gap-2">Estado {getSortIcon('status')}</div>
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-border">
                                            {getPaginatedOffices().map((office) => (
                                                <tr key={office.id} onClick={() => handleOpenForm(office)} className="hover:bg-background transition-colors cursor-pointer">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-text-primary">{office.name}</div>
                                                        {office.equipment.length > 0 && (<div className="text-sm text-text-secondary">{office.equipment.slice(0, 2).join(', ')}{office.equipment.length > 2 && '...'}</div>)}
                                                    </td>
                                                    <td className="px-6 py-4"><div className="text-sm text-text-secondary">{office.address}</div></td>
                                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-text-primary">{office.capacity}</div></td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(office.isActive)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={(e) => { e.stopPropagation(); handleOpenForm(office); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer" title="Editar"><FaEdit /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); setOfficeToDelete(office); setShowDeleteModal(true); }} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer" title="Eliminar"><FaTrash /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {totalPages > 1 && (
                                <div className="p-4 border-t border-border flex items-center justify-between">
                                    <div className="text-sm text-text-secondary">Página {currentPage} de {totalPages} ({getFilteredAndSortedOffices().length} consultorios)</div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 rounded-lg border border-border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white hover:border-primary">Primera</button>
                                        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-lg border border-border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white hover:border-primary">Anterior</button>
                                        <div className="flex gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1).map((page, index, array) => (
                                                <React.Fragment key={page}>
                                                    {index > 0 && array[index - 1] !== page - 1 && (<span className="px-2 py-1 text-text-secondary">...</span>)}
                                                    <button onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-primary text-white border-primary' : 'border border-border hover:bg-primary hover:text-white hover:border-primary'}`}>{page}</button>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-lg border border-border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white hover:border-primary">Siguiente</button>
                                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-lg border border-border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white hover:border-primary">Última</button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                    <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)} title={editingOffice ? 'Editar Consultorio' : 'Nuevo Consultorio'}>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input label="Nombre del Consultorio" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={formErrors.name} required maxLength={100} />
                            <Input label="Dirección" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} error={formErrors.address} required maxLength={200} />
                            <Input label="Capacidad" type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} error={formErrors.capacity} required min="1" showCharCount={false} />
                            <Input label="Equipamiento (separado por comas)" value={formData.equipment} onChange={(e) => setFormData({ ...formData, equipment: e.target.value })} placeholder="Ej: Diván, Escritorio, Sillas" maxLength={200} />
                            <TextArea label="Notas" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} maxLength={500} rows={3} />
                            <div className="flex gap-3 justify-end pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowFormModal(false)}>Cancelar</Button>
                                <Button type="submit" variant="primary" isLoading={saving}>{editingOffice ? 'Actualizar' : 'Crear'} Consultorio</Button>
                            </div>
                        </form>
                    </Modal>
                    <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setOfficeToDelete(null); }} onConfirm={handleDelete} title="Eliminar Consultorio" message={`¿Estás seguro de que deseas eliminar el consultorio "${officeToDelete?.name}"? Esta acción no se puede deshacer.`} confirmText="Eliminar" isLoading={deleting} />
                    <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="¡Operación exitosa!" message={successMessage} />
                    <AlertModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title="Error" message={errorMessage} />
                </MainLayout>
            );
        };
