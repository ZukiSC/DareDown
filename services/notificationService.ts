let permission: NotificationPermission = 'default';

// Check for Notification API support and initial permission status
if ('Notification' in window) {
    permission = Notification.permission;
}

/**
 * Requests permission from the user to show notifications.
 * @returns The new permission status ('granted', 'denied', or 'default').
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if ('Notification' in window) {
        try {
            const result = await Notification.requestPermission();
            permission = result;
            return permission;
        } catch (error) {
            console.error("Error requesting notification permission:", error);
            return 'denied';
        }
    }
    // If the browser doesn't support notifications
    return 'denied';
};

/**
 * Shows a local notification if permission is granted and the tab is not active.
 * @param title The title of the notification.
 * @param options Standard Notification API options (e.g., body, icon).
 */
export const showLocalNotification = (title: string, options?: NotificationOptions) => {
    // Only show notification if permission is granted and the page is hidden
    if (permission === 'granted' && document.hidden) {
        new Notification(title, {
            ...options,
            icon: '/vite.svg', // A default icon for the app
            badge: '/vite.svg', // Icon for mobile notification tray
        });
    }
};