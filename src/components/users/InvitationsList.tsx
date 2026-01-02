import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { ConfirmModal } from '../ui/ConfirmModal';
import { firebaseService } from '../../services/firebaseService';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { copyToClipboard, generateInvitationLink, formatExpirationDate, isInvitationExpired } from '../../utils/invitationUtils';
import type { Invitation, InvitationStatus } from '../../types/invitation';
import { FaCopy, FaTrash, FaCheck, FaEnvelope, FaUserTag, FaClock, FaCheckCircle, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

interface InvitationsListProps {
    onUpdate: () => void;
    refreshTrigger?: number;
}

export const InvitationsList: React.FC<InvitationsListProps> = ({ onUpdate, refreshTrigger }) => {
    const { currentUser } = useAuth();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [invitationToDelete, setInvitationToDelete] = useState<Invitation | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para ordenamiento y paginación
    const [sortField, setSortField] = useState<'name' | 'email' | 'role' | 'expires' | 'status'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadInvitations();
    }, [currentUser, refreshTrigger]); // Agregar refreshTrigger como dependencia

    const loadInvitations = async () => {
        if (!currentUser) return;

        try {
            const data = await firebaseService.getActiveInvitations(currentUser.uid);

            // Actualizar estado de invitaciones expiradas
            const updatedInvitations = data.map((inv: any) => {
                const expiresAt = inv.expiresAt.toDate();
                if (inv.status === 'pending' && isInvitationExpired(expiresAt)) {
                    firebaseService.updateInvitationStatus(inv.id, 'expired');
                    return { ...inv, status: 'expired' };
                }
                return inv;
            });

            setInvitations(updatedInvitations);
        } catch (error) {
            console.error('Error loading invitations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Exponer función de recarga para que el padre pueda llamarla
    useEffect(() => {
        if (!currentUser) return;

        // Suscripción en tiempo real para actualizaciones automáticas
        const unsubscribe = firebaseService.subscribe<Invitation>(
            'invitations',
            (data) => {
                const userInvitations = data.filter(inv => inv.createdBy === currentUser.uid);

                const updatedInvitations = userInvitations.map((inv: any) => {
                    const expiresAt = inv.expiresAt.toDate();
                    if (inv.status === 'pending' && isInvitationExpired(expiresAt)) {
                        firebaseService.updateInvitationStatus(inv.id, 'expired');
                        return { ...inv, status: 'expired' };
                    }
                    return inv;
                });

                setInvitations(updatedInvitations);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    const handleCopyLink = async (token: string, id: string) => {
        const link = generateInvitationLink(token);
        const success = await copyToClipboard(link);
        if (success) {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    const handleDeleteClick = (invitation: Invitation) => {
        setInvitationToDelete(invitation);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!invitationToDelete) return;

        setDeleting(true);
        try {
            await firebaseService.delete('invitations', invitationToDelete.id!);

            // Crear notificación de invitación revocada
            await notificationService.createNotification(
                currentUser!.uid,
                'invitation_revoked',
                'Invitación revocada',
                `La invitación para ${invitationToDelete.email} ha sido revocada.`,
                invitationToDelete.id!
            );

            await loadInvitations();
            onUpdate();
            setShowDeleteModal(false);
            setInvitationToDelete(null);
        } catch (error) {
            console.error('Error deleting invitation:', error);
        } finally {
            setDeleting(false);
        }
    };

    // Función para manejar ordenamiento
    const handleSort = (field: 'name' | 'email' | 'role' | 'expires' | 'status') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const getSortIcon = (field: 'name' | 'email' | 'role' | 'expires' | 'status') => {
        if (sortField !== field) return <FaSort className="opacity-30" />;
        return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    const getStatusBadge = (status: InvitationStatus) => {
        const styles = {
            pending: 'bg-warning/10 text-warning',
            accepted: 'bg-success/10 text-success',
            expired: 'bg-text-secondary/10 text-text-secondary',
            revoked: 'bg-danger/10 text-danger',
        };
        const labels = {
            pending: 'Pendiente',
            accepted: 'Aceptada',
            expired: 'Expirada',
            revoked: 'Revocada',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getRoleBadge = (role: string) => {
        const styles = {
            admin: 'bg-danger/10 text-danger',
            psychologist: 'bg-primary/10 text-primary',
            receptionist: 'bg-info/10 text-info',
            viewer: 'bg-text-secondary/10 text-text-secondary',
        };
        const labels = {
            admin: 'Administrador',
            psychologist: 'Psicólogo',
            receptionist: 'Recepcionista',
            viewer: 'Visualizador',
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${styles[role as keyof typeof styles]}`}>
                {labels[role as keyof typeof labels]}
            </span>
        );
    };

    // Filtrar y ordenar invitaciones
    const getFilteredAndSortedInvitations = () => {
        let filtered = invitations;

        // Aplicar búsqueda
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(inv => {
                const statusLabels = {
                    pending: 'pendiente',
                    accepted: 'aceptada',
                    expired: 'expirada',
                    revoked: 'revocada',
                };
                const roleLabels = {
                    admin: 'administrador',
                    psychologist: 'psicólogo psicologo',
                    receptionist: 'recepcionista',
                    viewer: 'visualizador',
                };
                const statusText = statusLabels[inv.status];
                const roleText = roleLabels[inv.role as keyof typeof roleLabels];
                const expiresText = formatExpirationDate(inv.expiresAt.toDate()).toLowerCase();

                return inv.displayName?.toLowerCase().includes(search) ||
                    inv.email?.toLowerCase().includes(search) ||
                    roleText?.includes(search) ||
                    expiresText.includes(search) ||
                    statusText.includes(search);
            });
        }

        // Aplicar ordenamiento
        filtered = [...filtered].sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'name':
                    comparison = (a.displayName || '').localeCompare(b.displayName || '');
                    break;
                case 'email':
                    comparison = (a.email || '').localeCompare(b.email || '');
                    break;
                case 'role':
                    comparison = (a.role || '').localeCompare(b.role || '');
                    break;
                case 'expires':
                    comparison = a.expiresAt.toDate().getTime() - b.expiresAt.toDate().getTime();
                    break;
                case 'status':
                    comparison = (a.status || '').localeCompare(b.status || '');
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return filtered;
    };

    // Obtener invitaciones paginadas
    const getPaginatedInvitations = () => {
        const filtered = getFilteredAndSortedInvitations();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filtered.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(getFilteredAndSortedInvitations().length / itemsPerPage);

    if (loading) {
        return (
            <Card>
                <div className="p-8 text-center text-text-secondary">
                    Cargando invitaciones...
                </div>
            </Card>
        );
    }

    if (invitations.length === 0) {
        return (
            <Card>
                <div className="p-8 text-center text-text-secondary">
                    No hay invitaciones creadas
                </div>
            </Card>
        );
    }

    // Calcular estadísticas
    const totalInvitations = invitations.length;
    const pendingInvitations = invitations.filter(i => i.status === 'pending').length;
    const acceptedInvitations = invitations.filter(i => i.status === 'accepted').length;
    const expiredInvitations = invitations.filter(i => i.status === 'expired').length;

    return (
        <>
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <FaEnvelope className="text-2xl text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary">Total Invitaciones</p>
                            <p className="text-2xl font-bold text-text-primary">{totalInvitations}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-warning/10 rounded-lg">
                            <FaClock className="text-2xl text-warning" />
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary">Pendientes</p>
                            <p className="text-2xl font-bold text-text-primary">{pendingInvitations}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-success/10 rounded-lg">
                            <FaCheckCircle className="text-2xl text-success" />
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary">Aceptadas</p>
                            <p className="text-2xl font-bold text-text-primary">{acceptedInvitations}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-text-secondary/10 rounded-lg">
                            <FaUserTag className="text-2xl text-text-secondary" />
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary">Expiradas</p>
                            <p className="text-2xl font-bold text-text-primary">{expiredInvitations}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabla de Invitaciones */}
            <Card>
                <div className="p-4 border-b border-border">
                    <Input
                        type="text"
                        placeholder="Buscar por nombre, email, rol, fecha de expiración o estado..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {getPaginatedInvitations().length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-text-secondary">
                            {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay invitaciones con el filtro seleccionado'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-background">
                                <tr>
                                    <th
                                        onClick={() => handleSort('name')}
                                        className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            Nombre
                                            {getSortIcon('name')}
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('email')}
                                        className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            Email
                                            {getSortIcon('email')}
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('role')}
                                        className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            Rol
                                            {getSortIcon('role')}
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('expires')}
                                        className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            Expira
                                            {getSortIcon('expires')}
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
                                {getPaginatedInvitations().map((invitation) => (
                                    <tr key={invitation.id} className="hover:bg-background transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-text-primary">
                                                {invitation.displayName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-text-secondary">
                                                {invitation.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getRoleBadge(invitation.role)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-text-secondary">
                                                {formatExpirationDate(invitation.expiresAt.toDate())}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(invitation.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {invitation.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCopyLink(invitation.token, invitation.id!)}
                                                        className={`p-2 rounded-lg transition-colors ${copiedId === invitation.id
                                                            ? 'text-success bg-success/10'
                                                            : 'text-primary hover:bg-primary/10'
                                                            }`}
                                                        title="Copiar link"
                                                    >
                                                        {copiedId === invitation.id ? <FaCheck /> : <FaCopy />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteClick(invitation)}
                                                    className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
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

                {/* Paginador */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border flex items-center justify-between">
                        <div className="text-sm text-text-secondary">
                            Página {currentPage} de {totalPages} ({getFilteredAndSortedInvitations().length} invitaciones)
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

            {/* Modal de Confirmación de Eliminación */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setInvitationToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Invitación"
                message={`¿Estás seguro de que deseas eliminar la invitación para ${invitationToDelete?.displayName}? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                isLoading={deleting}
            />
        </>
    );
};
