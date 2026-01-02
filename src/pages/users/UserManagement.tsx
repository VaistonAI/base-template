import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { AlertModal } from '../../components/ui/AlertModal';
import { InvitationModal } from '../../components/users/InvitationModal';
import { InvitationsList } from '../../components/users/InvitationsList';
import { firebaseService } from '../../services/firebaseService';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { FaEdit, FaTrash, FaUserShield, FaUsers, FaUserCheck, FaUserTimes, FaUserMd, FaSort, FaSortUp, FaSortDown, FaUserPlus, FaInfoCircle } from 'react-icons/fa';
import type { User, UserRole } from '../../types/user';
import { getPermissionsByRole } from '../../types/user';
import { Timestamp } from 'firebase/firestore';

export const UserManagement: React.FC = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Estado para tabs
    const [activeTab, setActiveTab] = useState<'users' | 'invitations'>('users');

    // Estado para forzar recarga de invitaciones
    const [refreshInvitations, setRefreshInvitations] = useState(0);

    // Estados para ordenamiento y paginación
    const [sortField, setSortField] = useState<'name' | 'email' | 'role' | 'status'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [showInvitationModal, setShowInvitationModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        role: 'psychologist' as UserRole,
        isActive: true,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await firebaseService.getAll<User>('users');
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
            setErrorMessage('Error al cargar usuarios');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar ordenamiento
    const handleSort = (field: 'name' | 'email' | 'role' | 'status') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const getSortIcon = (field: 'name' | 'email' | 'role' | 'status') => {
        if (sortField !== field) return <FaSort className="opacity-30" />;
        return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    // Filtrar y ordenar usuarios
    const getFilteredAndSortedUsers = () => {
        let filtered = users;

        // Aplicar búsqueda
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(user => {
                const statusText = user.isActive ? 'activo' : 'inactivo';
                return user.displayName?.toLowerCase().includes(search) ||
                    user.email?.toLowerCase().includes(search) ||
                    user.role?.toLowerCase().includes(search) ||
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
                case 'status':
                    comparison = (a.isActive === b.isActive) ? 0 : a.isActive ? -1 : 1;
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return filtered;
    };

    // Obtener usuarios paginados
    const getPaginatedUsers = () => {
        const filtered = getFilteredAndSortedUsers();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filtered.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(getFilteredAndSortedUsers().length / itemsPerPage);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.displayName.trim()) errors.displayName = 'El campo Nombre es obligatorio';
        if (!formData.email.trim()) {
            errors.email = 'El campo Email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Email inválido';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenEditForm = (user: User) => {
        setEditingUser(user);
        setFormData({
            displayName: user.displayName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        });
        setFormErrors({});
        setShowEditModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !editingUser) return;

        setSaving(true);
        try {
            const permissions = getPermissionsByRole(formData.role);

            const userData = {
                displayName: formData.displayName.trim(),
                email: formData.email.trim(),
                role: formData.role,
                permissions,
                isActive: formData.isActive,
                updatedAt: Timestamp.now(),
            };

            await firebaseService.update('users', editingUser.uid, userData);

            // Crear notificación de actualización
            await notificationService.createNotification(
                currentUser!.uid,
                'user_updated',
                'Usuario actualizado',
                `El usuario ${userData.displayName} ha sido actualizado exitosamente.`,
                editingUser.uid
            );

            setSuccessMessage('Usuario actualizado correctamente');
            setShowEditModal(false);
            setShowSuccessModal(true);
            await loadUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            setErrorMessage('Error al guardar usuario');
            setShowErrorModal(true);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        if (userToDelete.uid === currentUser?.uid) {
            setErrorMessage('No puedes eliminar tu propio usuario');
            setShowErrorModal(true);
            setShowDeleteModal(false);
            return;
        }

        setDeleting(true);
        try {
            await firebaseService.delete('users', userToDelete.uid);

            // Crear notificación de eliminación
            await notificationService.createNotification(
                currentUser!.uid,
                'user_deleted',
                'Usuario eliminado',
                `El usuario ${userToDelete.displayName} ha sido eliminado del sistema.`,
                userToDelete.uid
            );

            setSuccessMessage('Usuario eliminado correctamente');
            setShowDeleteModal(false);
            setShowSuccessModal(true);
            await loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            setErrorMessage('Error al eliminar usuario');
            setShowErrorModal(true);
        } finally {
            setDeleting(false);
            setUserToDelete(null);
        }
    };

    const getRoleBadge = (role: UserRole) => {
        const styles = {
            admin: 'bg-danger/10 text-danger',
            psychologist: 'bg-primary/10 text-primary',
            receptionist: 'bg-info/10 text-info',
        };
        const labels = {
            admin: 'Administrador',
            psychologist: 'Psicólogo',
            receptionist: 'Recepcionista',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
                {labels[role]}
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

    // Check if current user has permission
    if (!currentUser?.permissions.canManageUsers) {
        return (
            <MainLayout>
                <Card>
                    <div className="text-center py-12">
                        <FaUserShield className="text-6xl text-text-secondary opacity-20 mx-auto mb-4" />
                        <p className="text-text-secondary">
                            No tienes permisos para gestionar usuarios
                        </p>
                    </div>
                </Card>
            </MainLayout>
        );
    }

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const inactiveUsers = users.filter(u => !u.isActive).length;
    const psychologists = users.filter(u => u.role === 'psychologist').length;

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-text-primary">Gestión de Usuarios</h2>
                        <p className="text-text-secondary mt-1">
                            Administra usuarios y permisos del sistema
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowPermissionsModal(true)}
                            className="flex items-center gap-2"
                        >
                            <FaInfoCircle /> Permisos por Rol
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setShowInvitationModal(true)}
                            className="flex items-center gap-2"
                        >
                            <FaUserPlus /> Invitar Usuario
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-border">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'users'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <FaUsers />
                                Usuarios ({totalUsers})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('invitations')}
                            className={`px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'invitations'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <FaUserPlus />
                                Invitaciones
                            </div>
                        </button>
                    </div>
                </div>

                {/* Contenido según tab activo */}
                {activeTab === 'users' ? (
                    <>
                        {/* Estadísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <FaUsers className="text-2xl text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">Total Usuarios</p>
                                        <p className="text-2xl font-bold text-text-primary">{totalUsers}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-success/10 rounded-lg">
                                        <FaUserCheck className="text-2xl text-success" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">Activos</p>
                                        <p className="text-2xl font-bold text-text-primary">{activeUsers}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-danger/10 rounded-lg">
                                        <FaUserTimes className="text-2xl text-danger" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">Inactivos</p>
                                        <p className="text-2xl font-bold text-text-primary">{inactiveUsers}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-info/10 rounded-lg">
                                        <FaUserMd className="text-2xl text-info" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">Psicólogos</p>
                                        <p className="text-2xl font-bold text-text-primary">{psychologists}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Tabla de Usuarios */}
                        <Card>
                            <div className="p-4 border-b border-border">
                                <Input
                                    type="text"
                                    placeholder="Buscar por nombre, email, rol o estado..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>

                            {getPaginatedUsers().length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-text-secondary">
                                        {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay usuarios registrados'}
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
                                            {getPaginatedUsers().map((user) => (
                                                <tr key={user.uid} className="hover:bg-background transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-text-primary">
                                                            {user.displayName}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-text-secondary">
                                                            {user.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getRoleBadge(user.role)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                                                            }`}>
                                                            {user.isActive ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleOpenEditForm(user)}
                                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                                title="Editar"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            {user.uid !== currentUser?.uid && (
                                                                <button
                                                                    onClick={() => {
                                                                        setUserToDelete(user);
                                                                        setShowDeleteModal(true);
                                                                    }}
                                                                    className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                                                    title="Eliminar"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            )}
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
                                        Página {currentPage} de {totalPages} ({getFilteredAndSortedUsers().length} usuarios)
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
                    </>
                ) : (
                    /* Tab de Invitaciones */
                    <InvitationsList onUpdate={loadUsers} refreshTrigger={refreshInvitations} />
                )}
            </div>

            {/* Modal de Invitación */}
            <InvitationModal
                isOpen={showInvitationModal}
                onClose={() => setShowInvitationModal(false)}
                onSuccess={() => {
                    setSuccessMessage('Invitación creada exitosamente');
                    setShowSuccessModal(true);
                    loadUsers();
                    setRefreshInvitations(prev => prev + 1); // Forzar recarga de invitaciones
                }}
                existingUsers={users.map(u => ({ email: u.email, displayName: u.displayName }))}
            />

            {/* Modal de Edición de Usuario */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Editar Usuario"
            >
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
                        disabled
                    />

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Rol <span className="text-danger">*</span>
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                            <option value="admin">Administrador</option>
                            <option value="psychologist">Psicólogo</option>
                            <option value="receptionist">Recepcionista</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                        />
                        <label htmlFor="isActive" className="text-sm text-text-primary">
                            Usuario activo
                        </label>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowEditModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={saving}
                        >
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal de Confirmación de Eliminación */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Eliminar Usuario"
                message={`¿Estás seguro de que deseas eliminar al usuario ${userToDelete?.displayName}? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                isLoading={deleting}
            />

            {/* Modal de Permisos por Rol */}
            <Modal
                isOpen={showPermissionsModal}
                onClose={() => setShowPermissionsModal(false)}
                title="Permisos por Rol"
                size="lg"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-background rounded-lg">
                        <h4 className="font-medium text-danger mb-2">👑 Administrador</h4>
                        <p className="text-sm text-text-secondary">
                            Acceso completo a todas las funcionalidades del sistema
                        </p>
                    </div>
                    <div className="p-4 bg-background rounded-lg">
                        <h4 className="font-medium text-primary mb-2">🧠 Psicólogo</h4>
                        <p className="text-sm text-text-secondary">
                            Gestión de pacientes, citas, sesiones y facturación
                        </p>
                    </div>
                    <div className="p-4 bg-background rounded-lg">
                        <h4 className="font-medium text-info mb-2">📋 Recepcionista</h4>
                        <p className="text-sm text-text-secondary">
                            Gestión de citas y consulta de información básica
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Éxito"
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
