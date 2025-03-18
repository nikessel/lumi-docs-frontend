import { notification } from "antd";

export interface AppNotification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    timestamp: Date;
    read: boolean;
}

type NotificationCallback = (notifications: AppNotification[]) => void;

class NotificationService {
    private static api: any;
    private static subscribers: NotificationCallback[] = [];
    private static lastNotificationTime: Date | null = null;
    private static notifications: AppNotification[] = [];

    private constructor() { }

    public static init(api: any) {
        this.api = api;
    }

    public static subscribe(callback: NotificationCallback) {
        this.subscribers.push(callback);
        callback([...this.notifications]);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    private static notifySubscribers() {
        this.subscribers.forEach(callback => callback([...this.notifications]));
    }

    private static canShowNotification(): boolean {
        if (!this.lastNotificationTime) return true;
        const now = new Date();
        return (now.getTime() - this.lastNotificationTime.getTime()) / 1000 >= 60;
    }

    private static addNotification(type: 'error' | 'success' | 'info', message: string) {
        const notificationItem: AppNotification = {
            id: Date.now().toString(),
            message,
            type,
            timestamp: new Date(),
            read: false,
        };

        this.notifications.unshift(notificationItem);
        this.notifySubscribers();

        if (this.canShowNotification() && this.api) {
            this.lastNotificationTime = new Date();
            this.api[type]({ message: type.toUpperCase(), description: message });
        }
    }

    public static showError(message: string) {
        this.addNotification('error', message);
    }

    public static showSuccess(message: string) {
        this.addNotification('success', message);
    }

    public static showInfo(message: string) {
        this.addNotification('info', message);
    }

    public static markAllAsRead() {
        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
        this.notifySubscribers();
    }

    public static clearAll() {
        this.notifications = [];
        this.notifySubscribers();
    }
}

export default NotificationService;
