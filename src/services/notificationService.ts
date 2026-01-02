import { firebaseService } from './firebaseService';
import { Timestamp } from 'firebase/firestore';
import type { Notification, NotificationType } from '../types/notification';

export const notificationService = {
    // Crear una notificación
    async createNotification(
        userId: string,
        type: NotificationType,
        title: string,
        message: string,
        relatedId?: string
    ): Promise<void> {
        const notification: Notification = {
            type,
            title,
            message,
            read: false,
            createdAt: Timestamp.now(),
            userId,
            relatedId,
        };

        console.log('📬 Creating notification:', notification);
        const result = await firebaseService.create('notifications', notification);
        console.log('✅ Notification created with ID:', result);
    },

    // Marcar notificación como leída
    async markAsRead(notificationId: string): Promise<void> {
        await firebaseService.update('notifications', notificationId, {
            read: true,
        });
    },

    // Marcar todas las notificaciones como leídas para un usuario
    async markAllAsRead(userId: string): Promise<void> {
        const notifications = await firebaseService.getAll<Notification>('notifications');
        const userNotifications = notifications.filter(
            n => n.userId === userId && !n.read
        );

        const updatePromises = userNotifications.map(n =>
            firebaseService.update('notifications', n.id!, { read: true })
        );

        await Promise.all(updatePromises);
    },

    // Obtener notificaciones no leídas de un usuario
    async getUnreadCount(userId: string): Promise<number> {
        const notifications = await firebaseService.getAll<Notification>('notifications');
        return notifications.filter(n => n.userId === userId && !n.read).length;
    },

    // Suscribirse a notificaciones de un usuario en tiempo real
    subscribeToUserNotifications(
        userId: string,
        callback: (notifications: Notification[]) => void
    ): () => void {
        console.log('📡 Subscribing to notifications for user:', userId);
        return firebaseService.subscribe<Notification>('notifications', (allNotifications) => {
            console.log('📡 All notifications from Firebase:', allNotifications);
            const userNotifications = allNotifications
                .filter(n => n.userId === userId)
                .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
            console.log('📡 Filtered user notifications:', userNotifications);
            callback(userNotifications);
        });
    },
};
