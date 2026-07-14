// TypeScript interfaces for API models

export interface User {
    _id: string;
    userId: number;
    meethiId?: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    gender: 'male' | 'female' | 'other';
    bio?: string;
    hobbies?: string[];
    emailVerified: boolean;
    phoneVerified: boolean;
    role: 'owner' | 'superAdmin' | 'admin' | 'coinSeller' | 'host' | 'user';
    authType: 'phone' | 'google' | 'email';
    coins: number;
    image?: string;
    isDeleted: boolean;
    isOnline: boolean;
    isBlocked: boolean;
    lastOnline?: Date;
    language?: string[];
    frameId?: string;
    userName?: string;
    isUserName: boolean;
    isActive: boolean;
    isBusy: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Host {
    _id: string;
    hostId: number;
    meethiId: string;
    fullName: string;
    mobileNumber: string;
    emailId: string;
    introAudio?: string;
    idProof?: string;
    addressProof?: string;
    profilePhoto?: string;
    termsAccepted: boolean;
    isDeleted: boolean;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Call {
    _id: string;
    userId: string;
    hostId: string;
    type: 'VOICE_CALL' | 'VIDEO_CALL';
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    coinsSpent: number;
    hostEarning: number;
    channelName?: string;
    callStart?: Date;
    callEnd?: Date;
    duration?: number;
    createdAt: Date;
}

export interface Report {
    _id: string;
    reportId: string;
    reporterId: User;
    reportedUserId: User;
    reportedType: 'user' | 'host' | 'content';
    reason: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
    resolvedBy?: User;
    resolvedAt?: Date;
    actionTaken?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CoinPrice {
    _id: string;
    coins: number;
    price: number;
    currency: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Frame {
    _id: string;
    name: string;
    level: number;
    image: string;
    createdAt: Date;
}

export interface Avatar {
    _id: string;
    gender: 'male' | 'female';
    image: string;
    createdAt: Date;
}

export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalHosts: number;
    activeHosts: number;
    stats: {
        callsToday: number;
        minutesToday: number;
        coinsSpentToday: number;
        revenueToday: number;
        hostEarningsToday: number;
    };
    reportsPending: number;
}

export interface ChartData {
    date: string;
    revenue?: number;
    earnings?: number;
    calls?: number;
    duration?: number;
}

export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: Pagination;
}

export interface Withdrawal {
    _id: string;
    userId: number;
    amount: number;
    coinsDeducted: number;
    method: 'bank' | 'upi';
    details: {
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
        accountHolderName?: string;
        upiId?: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    transactionId?: string;
    createdAt: Date;
    user?: User; // Populated by controller
}
