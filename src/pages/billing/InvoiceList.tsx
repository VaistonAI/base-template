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
import { FaPlus, FaEdit, FaTrash, FaFileInvoiceDollar, FaDollarSign, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { Timestamp, orderBy } from 'firebase/firestore';
import type { Invoice, InvoiceStatus, InvoiceItem, Payment, PaymentMethod } from '../../types/invoice';
import type { Patient } from '../../types/patient';

export const InvoiceList: React.FC = () => {
    const { currentUser } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    const [loading, setLoading] = useState(true);

    // Estados para búsqueda, ordenamiento y paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<'number' | 'patient' | 'date' | 'total' | 'status'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [invoiceForPayment, setInvoiceForPayment] = useState<Invoice | null>(null);
    const [formData, setFormData] = useState({
        patientId: '',
        patientName: '',
        description: '',
        amount: '',
        tax: '16',
        issueDate: '',
        dueDate: '',
        notes: '',
    });
    const [paymentData, setPaymentData] = useState({
        amount: '',
        method: 'cash' as PaymentMethod,
        notes: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const invoicesData = await firebaseService.getAll<Invoice>('invoices', orderBy('issueDate', 'desc'));
            setInvoices(invoicesData);
        } catch (error) {
            console.error('Error loading data:', error);
            setErrorMessage('Error al cargar datos');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar ordenamiento
    const handleSort = (field: 'number' | 'patient' | 'date' | 'total' | 'status') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
        setCurrentPage(1);
    };

    const getSortIcon = (field: 'number' | 'patient' | 'date' | 'total' | 'status') => {
        if (sortField !== field) return <FaSort className="opacity-30" />;
        return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    // Filtrar y ordenar facturas
    const getFilteredAndSortedInvoices = () => {
        let filtered = invoices;

        // Aplicar búsqueda
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(inv =>
                inv.invoiceNumber?.toLowerCase().includes(search) ||
                inv.patientName?.toLowerCase().includes(search) ||
                inv.status?.toLowerCase().includes(search) ||
                inv.total?.toString().includes(search) ||
                inv.issueDate?.toDate().toLocaleDateString('es-MX').includes(search)
            );
        }

        // Aplicar ordenamiento
        filtered = [...filtered].sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'number':
                    comparison = (a.invoiceNumber || '').localeCompare(b.invoiceNumber || '');
                    break;
                case 'patient':
                    comparison = (a.patientName || '').localeCompare(b.patientName || '');
                    break;
                case 'date':
                    comparison = a.issueDate.toMillis() - b.issueDate.toMillis();
                    break;
                case 'total':
                    comparison = (a.total || 0) - (b.total || 0);
                    break;
                case 'status':
                    comparison = (a.status || '').localeCompare(b.status || '');
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return filtered;
    };

    // Obtener facturas paginadas
    const getPaginatedInvoices = () => {
        const filtered = getFilteredAndSortedInvoices();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filtered.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(getFilteredAndSortedInvoices().length / itemsPerPage);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};



        if (!formData.patientName.trim()) errors.patientName = 'El nombre del cliente es obligatorio';
        if (!formData.description.trim()) errors.description = 'El campo Descripción es obligatorio';
        if (!formData.amount || Number(formData.amount) < 0) {
            errors.amount = 'El monto debe ser mayor o igual a 0';
        }
        if (!formData.issueDate) errors.issueDate = 'El campo Fecha de Emisión es obligatorio';
        if (!formData.dueDate) errors.dueDate = 'El campo Fecha de Vencimiento es obligatorio';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenForm = (invoice?: Invoice) => {
        if (invoice) {
            setEditingInvoice(invoice);

            const description = invoice.notes || '';
            const amount = invoice.subtotal?.toString() || '0';

            setFormData({
                patientId: invoice.patientId || '',
                patientName: invoice.patientName || '',
                description,
                amount,
                tax: '16',
                issueDate: invoice.issueDate.toDate().toISOString().split('T')[0],
                dueDate: invoice.dueDate.toDate().toISOString().split('T')[0],
                notes: invoice.notes || '',
            });
        } else {
            setEditingInvoice(null);
            setFormData({
                patientId: '',
                patientName: '',
                description: '',
                amount: '',
                tax: '16',
                issueDate: '',
                dueDate: '',
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
            const amount = Number(formData.amount);
            const taxRate = Number(formData.tax) / 100;
            const subtotal = amount;
            const tax = subtotal * taxRate;
            const total = subtotal + tax;

            const item: InvoiceItem = {
                description: formData.description.trim(),
                quantity: 1,
                unitPrice: amount,
                total: amount,
            };

            // Generar número de factura secuencial si es nueva
            let invoiceNumber = editingInvoice?.invoiceNumber;
            if (!invoiceNumber) {
                const allInvoices = await firebaseService.getAll<Invoice>('invoices');
                const invoiceNumbers = allInvoices
                    .map(inv => {
                        const match = inv.invoiceNumber?.match(/^FAC-(\d+)$/);
                        return match ? parseInt(match[1]) : 0;
                    })
                    .filter(num => num > 0);
                const nextNumber = invoiceNumbers.length > 0 ? Math.max(...invoiceNumbers) + 1 : 1;
                invoiceNumber = `FAC-${nextNumber}`;
            }
            const invoiceData = {
                invoiceNumber,
                patientId: null,
                patientName: formData.patientName.trim(),
                items: [item],
                subtotal,
                tax,
                total,
                status: (editingInvoice?.status || 'pending') as InvoiceStatus,
                issueDate: Timestamp.fromDate(new Date(formData.issueDate)),
                dueDate: Timestamp.fromDate(new Date(formData.dueDate)),
                notes: formData.notes.trim(),
                createdBy: currentUser!.uid,
            };

            if (editingInvoice) {
                await firebaseService.update('invoices', editingInvoice.id, invoiceData);

                // Crear notificación de actualización
                await notificationService.createNotification(
                    currentUser!.uid,
                    'invoice_updated',
                    'Factura actualizada',
                    `La factura ${invoiceData.invoiceNumber} ha sido actualizada exitosamente.`,
                    editingInvoice.id
                );

                setSuccessMessage('Factura actualizada correctamente');
            } else {
                const newInvoiceId = await firebaseService.create('invoices', invoiceData);

                // Crear notificación de creación
                await notificationService.createNotification(
                    currentUser!.uid,
                    'invoice_created',
                    'Nueva factura registrada',
                    `La factura ${invoiceData.invoiceNumber} ha sido registrada exitosamente.`,
                    newInvoiceId
                );

                setSuccessMessage('Factura creada correctamente');
            }

            setShowFormModal(false);
            setShowSuccessModal(true);
            await loadData();
        } catch (error) {
            console.error('Error saving invoice:', error);
            setErrorMessage('Error al guardar factura');
            setShowErrorModal(true);
        } finally {
            setSaving(false);
        }
    };

    const handleOpenPayment = (invoice: Invoice) => {
        setInvoiceForPayment(invoice);
        setPaymentData({
            amount: invoice.total.toString(),
            method: 'cash',
            notes: '',
        });
        setShowPaymentModal(true);
    };

    const handlePayment = async () => {
        if (!invoiceForPayment) return;

        setSaving(true);
        try {
            const paymentRecord: Omit<Payment, 'id'> = {
                invoiceId: invoiceForPayment.id,
                amount: Number(paymentData.amount),
                method: paymentData.method,
                status: 'completed',
                notes: paymentData.notes.trim(),
                paymentDate: Timestamp.now(),
                createdAt: Timestamp.now(),
                createdBy: currentUser!.uid,
            };

            await firebaseService.create('payments', paymentRecord);
            await firebaseService.update('invoices', invoiceForPayment.id, {
                status: 'paid',
                paidDate: Timestamp.now(),
            });

            // Actualizar estado de la consulta vinculada si existe
            const consultations = await firebaseService.getAll<any>('consultations');
            const linkedConsultation = consultations.find(c => c.invoiceId === invoiceForPayment.id);
            if (linkedConsultation) {
                await firebaseService.update('consultations', linkedConsultation.id, {
                    paymentStatus: 'paid',
                    amount: Number(paymentData.amount),
                    paymentMethod: paymentData.method,
                    updatedAt: Timestamp.now(),
                });
            }

            // Crear notificación de pago
            await notificationService.createNotification(
                currentUser!.uid,
                'invoice_paid',
                'Factura pagada',
                `La factura ${invoiceForPayment.invoiceNumber} ha sido marcada como pagada.`,
                invoiceForPayment.id
            );

            setSuccessMessage('Pago registrado correctamente');
            setShowPaymentModal(false);
            setShowSuccessModal(true);
            await loadData();
        } catch (error) {
            console.error('Error registering payment:', error);
            setErrorMessage('Error al registrar pago');
            setShowErrorModal(true);
        } finally {
            setSaving(false);
            setInvoiceForPayment(null);
        }
    };

    const handleDelete = async () => {
        if (!invoiceToDelete) return;

        setDeleting(true);
        try {
            await firebaseService.delete('invoices', invoiceToDelete.id);

            // Crear notificación de eliminación
            await notificationService.createNotification(
                currentUser!.uid,
                'invoice_deleted',
                'Factura eliminada',
                `La factura ${invoiceToDelete.invoiceNumber} ha sido eliminada del sistema.`,
                invoiceToDelete.id
            );

            setSuccessMessage('Factura eliminada correctamente');
            setShowDeleteModal(false);
            setShowSuccessModal(true);
            await loadData();
        } catch (error) {
            console.error('Error deleting invoice:', error);
            setErrorMessage('Error al eliminar factura');
            setShowErrorModal(true);
        } finally {
            setDeleting(false);
            setInvoiceToDelete(null);
        }
    };

    const getStatusBadge = (status: InvoiceStatus) => {
        const styles = {
            pending: 'bg-warning/10 text-warning',
            paid: 'bg-success/10 text-success',
            overdue: 'bg-danger/10 text-danger',
            cancelled: 'bg-text-secondary/10 text-text-secondary',
        };
        const labels = {
            pending: 'Pendiente',
            paid: 'Pagada',
            overdue: 'Vencida',
            cancelled: 'Cancelada',
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

    const totalPending = invoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-text-primary">Facturación</h2>
                        <p className="text-text-secondary mt-1">Gestiona facturas y pagos</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2"
                    >
                        <FaPlus /> Nueva Factura
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm mb-1">Total Pendiente</p>
                                <p className="text-2xl font-bold text-warning">
                                    ${totalPending.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-warning/10 rounded-lg">
                                <FaFileInvoiceDollar className="text-3xl text-warning" />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm mb-1">Total Pagado</p>
                                <p className="text-2xl font-bold text-success">
                                    ${totalPaid.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-success/10 rounded-lg">
                                <FaDollarSign className="text-3xl text-success" />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm mb-1">Total Facturas</p>
                                <p className="text-2xl font-bold text-primary">
                                    {invoices.length}
                                </p>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <FaFileInvoiceDollar className="text-3xl text-primary" />
                            </div>
                        </div>
                    </Card>
                </div>

                <Card>
                    {/* Barra de búsqueda */}
                    <div className="p-4 border-b border-border">
                        <Input
                            type="text"
                            placeholder="Buscar por número, paciente, fecha, total o estado..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {getPaginatedInvoices().length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-text-secondary">
                                {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay facturas registradas'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-background">
                                    <tr>
                                        <th
                                            onClick={() => handleSort('number')}
                                            className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                Número
                                                {getSortIcon('number')}
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleSort('patient')}
                                            className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                Cliente
                                                {getSortIcon('patient')}
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleSort('date')}
                                            className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                Fecha
                                                {getSortIcon('date')}
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleSort('total')}
                                            className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                Total
                                                {getSortIcon('total')}
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
                                        <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-border">
                                    {getPaginatedInvoices().map((invoice) => (
                                        <tr
                                            key={invoice.id}
                                            onClick={() => handleOpenForm(invoice)}
                                            className="border-b border-border hover:bg-background transition-colors cursor-pointer"
                                        >
                                            <td className="py-3 px-4 font-medium text-text-primary">
                                                {invoice.invoiceNumber}
                                            </td>
                                            <td className="py-3 px-4 text-text-secondary">{invoice.patientName}</td>
                                            <td className="py-3 px-4 text-text-secondary">
                                                {invoice.issueDate.toDate().toLocaleDateString('es-MX')}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-text-primary">
                                                ${invoice.total.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4">{getStatusBadge(invoice.status)}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {invoice.status === 'pending' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenPayment(invoice);
                                                            }}
                                                            className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer"
                                                            title="Registrar Pago"
                                                        >
                                                            <FaDollarSign />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenForm(invoice);
                                                        }}
                                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                                        title="Editar"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setInvoiceToDelete(invoice);
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
                    )}

                    {/* Paginador Personalizado */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-border flex items-center justify-between">
                            <div className="text-sm text-text-secondary">
                                Página {currentPage} de {totalPages} ({getFilteredAndSortedInvoices().length} facturas)
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
            </div>

            <Modal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                title={editingInvoice ? 'Editar Factura' : 'Nueva Factura'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">

                    <Input
                        label="Nombre del Cliente"
                        value={formData.patientName}
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                        error={formErrors.patientName}
                        placeholder="Nombre del cliente o empresa"
                    />


                    <Input
                        label="Descripción del Servicio"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        error={formErrors.description}
                        maxLength={200}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Monto (sin IVA)"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            error={formErrors.amount}
                            min="0"
                            step="0.01"
                            showCharCount={false}
                        />
                        <Input
                            label="IVA (%)"
                            type="number"
                            value={formData.tax}
                            onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                            min="0"
                            max="100"
                            showCharCount={false}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Fecha de Emisión"
                            type="date"
                            value={formData.issueDate}
                            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                            error={formErrors.issueDate}
                            showCharCount={false}
                        />
                        <Input
                            label="Fecha de Vencimiento"
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            error={formErrors.dueDate}
                            showCharCount={false}
                        />
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
                            {editingInvoice ? 'Actualizar' : 'Crear'} Factura
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false);
                    setInvoiceForPayment(null);
                }}
                title="Registrar Pago"
            >
                <div className="space-y-4">
                    <Input
                        label="Monto"
                        type="number"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                        required
                        min="0"
                        step="0.01"
                        showCharCount={false}
                    />

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Método de Pago <span className="text-danger">*</span>
                        </label>
                        <select
                            value={paymentData.method}
                            onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value as PaymentMethod })}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                        >
                            <option value="cash">Efectivo</option>
                            <option value="card">Tarjeta</option>
                            <option value="transfer">Transferencia</option>
                            <option value="check">Cheque</option>
                        </select>
                    </div>

                    <TextArea
                        label="Notas"
                        value={paymentData.notes}
                        onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                        maxLength={500}
                        rows={3}
                    />

                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowPaymentModal(false);
                                setInvoiceForPayment(null);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="success"
                            onClick={handlePayment}
                            isLoading={saving}
                        >
                            Registrar Pago
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setInvoiceToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Eliminar Factura"
                message={`¿Estás seguro de que deseas eliminar la factura ${invoiceToDelete?.invoiceNumber}? Esta acción no se puede deshacer.`}
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
            />
        </MainLayout>
    );
};
