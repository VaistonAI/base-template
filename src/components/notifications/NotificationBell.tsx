import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';
import type { Notification } from '../../types/notification';
import { FaBell, FaCheckDouble, FaUser, FaEdit, FaTrash, FaBuilding, FaCalendarCheck, FaFileInvoiceDollar, FaMoneyBillWave, FaUserPlus, FaUserShield, FaEnvelope, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const NotificationBell: React.FC = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!currentUser) return;

        console.log('🔔 NotificationBell: Subscribing to notifications for user:', currentUser.uid);

        // Suscribirse a notificaciones en tiempo real
        const unsubscribe = notificationService.subscribeToUserNotifications(
            currentUser.uid,
            (userNotifications) => {
                console.log('🔔 NotificationBell: Received notifications:', userNotifications);
                // Filtrar solo las no leídas
                const unreadNotifications = userNotifications.filter(n => !n.read);
                setNotifications(unreadNotifications);
                setUnreadCount(unreadNotifications.length);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    // Cerrar panel al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMarkAsRead = async (notificationId: string) => {
        await notificationService.markAsRead(notificationId);
    };

    const handleMarkAllAsRead = async () => {
        if (!currentUser) return;
        await notificationService.markAllAsRead(currentUser.uid);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'patient_created':
                return <FaUser className="text-success" />;
            case 'patient_updated':
                return <FaEdit className="text-primary" />;
            case 'patient_deleted':
                return <FaTrash className="text-danger" />;
            case 'office_created':
                return <FaBuilding className="text-success" />;
            case 'office_updated':
                return <FaEdit className="text-primary" />;
            case 'office_deleted':
                return <FaTrash className="text-danger" />;
            case 'consultation_created':
                return <FaCalendarCheck className="text-success" />;
            case 'consultation_updated':
                return <FaEdit className="text-primary" />;
            case 'consultation_deleted':
                return <FaTrash className="text-danger" />;
            case 'invoice_created':
                return <FaFileInvoiceDollar className="text-success" />;
            case 'invoice_updated':
                return <FaEdit className="text-primary" />;
            case 'invoice_deleted':
                return <FaTrash className="text-danger" />;
            case 'invoice_paid':
                return <FaMoneyBillWave className="text-success" />;
            case 'user_created':
                return <FaUserPlus className="text-success" />;
            case 'user_updated':
                return <FaUserShield className="text-primary" />;
            case 'user_deleted':
                return <FaUserTimes className="text-danger" />;
            case 'invitation_created':
                return <FaEnvelope className="text-success" />;
            case 'invitation_accepted':
                return <FaUserCheck className="text-success" />;
            case 'invitation_revoked':
                return <FaUserTimes className="text-warning" />;
            default:
                return <FaBell className="text-text-secondary" />;
        }
    };

    const formatTime = (timestamp: any) => {
        try {
            const date = timestamp.toDate();
            return formatDistanceToNow(date, { addSuffix: true, locale: es });
        } catch {
            return '';
        }
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-text-secondary hover:text-primary transition-colors rounded-lg hover:bg-background"
            >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-danger text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-border z-50 max-h-[calc(100vh-120px)] sm:max-h-96 lg:max-h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between flex-shrink-0">
                        <h3 className="font-semibold text-text-primary text-sm lg:text-base">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs lg:text-xs text-primary hover:text-primary-dark flex items-center gap-1 transition-colors whitespace-nowrap"
                            >
                                <FaCheckDouble />
                                <span className="hidden lg:inline">Marcar todas como leídas</span>
                                <span className="lg:hidden">Marcar</span>
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-4 sm:p-6 lg:p-8 text-center text-text-secondary">
                                <FaBell className="text-3xl sm:text-4xl lg:text-4xl mx-auto mb-2 opacity-20" />
                                <p className="text-xs sm:text-sm lg:text-base">No tienes notificaciones pendientes</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleMarkAsRead(notification.id!)}
                                        className="p-2 sm:p-3 lg:p-4 cursor-pointer transition-colors bg-primary/5 hover:bg-primary/10"
                                    >
                                        <div className="flex gap-2 sm:gap-3 lg:gap-3">
                                            <div className="flex-shrink-0 mt-0.5 text-base sm:text-lg lg:text-xl">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-medium text-text-primary text-xs sm:text-sm lg:text-sm">
                                                        {notification.title}
                                                    </p>
                                                    <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-0.5"></span>
                                                </div>
                                                <p className="text-xs sm:text-sm lg:text-sm text-text-secondary mt-0.5">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs lg:text-xs text-text-secondary mt-1">
                                                    {formatTime(notification.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
