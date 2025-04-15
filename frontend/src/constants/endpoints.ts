const endpoints = {
    users: "/users",
    searchUsers: "/users/search",
    login: "/api/auth/sign_in",
    signup: "/api/auth/sign_up",
    logout: "/auth/logout",
    fortytwo: "/api/auth/42",
    notifications: "/users/notifications/",
    unreadNotifications: "/users/notifications/unread/",
    markNotificationRead: "/users/notifications/mark-read/",
    markAllNotificationsRead: "/users/notifications/mark-all-read/",
    deleteNotification: "/users/notifications/delete/",
};

export default endpoints;
