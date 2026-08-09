// Centralized API endpoint definitions for app admin panel

export const API_ENDPOINTS = {
    // Admin Authentication
    ADMIN: {
        LOGIN: '/api/admin/login',
        LOGOUT: '/api/admin/logout',
        PROFILE: '/api/admin/profile',
        UPDATE_PROFILE: '/api/admin/profile',
        SETTINGS: '/api/admin/settings',
        UPDATE_SETTINGS: '/api/admin/settings',

        // SuperAdmin: Manage Admins
        CREATE_ADMIN: '/api/admin/create-admin',
        LIST_ADMINS: '/api/admin/list-admins',
        BLOCK_ADMIN: (id: string) => `/api/admin/block-admin/${id}`,
    },

    // Dashboard Analytics
    DASHBOARD: {
        STATS: '/api/admin/dashboard/stats',
        REVENUE_CHART: '/api/admin/dashboard/revenue-chart',
        EARNINGS_CHART: '/api/admin/dashboard/earnings-chart',
        CALL_TRENDS: '/api/admin/dashboard/call-trends',
        COIN_DISTRIBUTION: '/api/admin/dashboard/coin-distribution',
    },

    // User Management
    USERS: {
        LIST: '/api/user',
        GET: (id: string) => `/api/user/${id}`,
        UPDATE: (id: string) => `/api/user/${id}`,
        DELETE: (id: string) => `/api/user/${id}`,
        BLOCK: (id: string) => `/api/user/block/${id}`,
        UNBLOCK: (id: string) => `/api/user/unblock/${id}`,
        UPLOAD_IMAGE: (id: string) => `/api/user/upload/${id}`,
    },

    // Host Management
    HOSTS: {
        LIST: '/api/admin/hosts/list',
        APPLICATIONS: '/api/admin/hosts/applications',
        GET: (id: string) => `/api/host/${id}`,
        APPROVE: (id: string) => `/api/admin/hosts/approve/${id}`,
        BLOCK: (id: string) => `/api/admin/hosts/block/${id}`,
        SEND_FORM: (id: string) => `/api/host/send-form/${id}`,
    },

    // Call Management
    CALLS: {
        HISTORY: '/api/admin/calls/history',
        RANKING: '/api/call/ranking',
        LEVELS: '/api/call/level',
    },

    // Reports/Moderation
    REPORTS: {
        LIST: '/api/admin/reports',
        GET: (id: string) => `/api/admin/reports/${id}`,
        RESOLVE: (id: string) => `/api/admin/reports/${id}/resolve`,
        DISMISS: (id: string) => `/api/admin/reports/${id}/dismiss`,
    },

    // Coin Pricing
    COINS: {
        LIST: '/api/coinsPrice',
        GET: (id: string) => `/api/coinsPrice/${id}`,
        CREATE: '/api/coinsPrice',
        UPDATE: (id: string) => `/api/coinsPrice/${id}`,
        DELETE: (id: string) => `/api/coinsPrice/${id}`,
    },

    // Frames/Levels
    FRAMES: {
        LIST: '/api/frames',
        CREATE: '/api/frames',
        DELETE: (id: string) => `/api/frames/${id}`,
    },

    // Avatars
    AVATARS: {
        LIST: (gender: string) => `/api/avatar/${gender}`,
        CREATE: '/api/avatar',
        DELETE: (id: string) => `/api/avatar/${id}`,
    },

    // Chat
    CHAT: {
        CONVERSATIONS: '/api/chat/conversations',
        MESSAGES: '/api/chat/messages',
    },

    // Withdrawals
    WITHDRAWALS: {
        PENDING: '/api/admin/withdrawals/pending',
        PROCESS: '/api/admin/withdrawals/process',
    },

    // Gifts
    GIFTS: {
        LIST: '/api/gift/admin-all',
        CREATE: '/api/gift/create',
        TOGGLE: (id: string) => `/api/gift/${id}/toggle`,
        DELETE: (id: string) => `/api/gift/${id}`,
    },

    // Banners
    BANNERS: {
        LIST: '/api/admin/banners',
        CREATE: '/api/admin/banners',
        GET: (id: string) => `/api/admin/banners/${id}`,
        UPDATE: (id: string) => `/api/admin/banners/${id}`,
        DELETE: (id: string) => `/api/admin/banners/${id}`,
        TOGGLE: (id: string) => `/api/admin/banners/${id}/toggle`,
    },

    // Levels Management
    LEVELS_MGMT: {
        LIST: '/api/admin/levels',
        CREATE: '/api/admin/levels',
        UPDATE: (id: string) => `/api/admin/levels/${id}`,
        DELETE: (id: string) => `/api/admin/levels/${id}`,
    },

    // Reports Management
    REPORTS: {
        LIST: '/api/admin/reports',
        GET: (id: string) => `/api/admin/reports/${id}`,
        RESOLVE: (id: string) => `/api/admin/reports/${id}/resolve`,
        DISMISS: (id: string) => `/api/admin/reports/${id}/dismiss`,
    },

    // Help & Support Tickets
    HELP: {
        LIST: '/api/admin/help',
        RESOLVE: '/api/admin/help/resolve',
        REPLY: (id: string) => `/api/admin/help/${id}/reply`,
    },
} as const;

