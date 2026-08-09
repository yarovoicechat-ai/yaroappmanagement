import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const APP_MANAGEMENT_ROUTES = new Set([
    '/', '/settings', '/logs', '/cms', '/bios', '/banners', '/ads',
    '/referrals', '/vip', '/levels', '/gifts', '/frames', '/avatars',
    '/moderation', '/events', '/messages/system', '/messages/activity', '/logout',
    '/add-new', '/admins', '/agencies', '/avatar-requests', '/bans', '/calls',
    '/deletions', '/help-support', '/host-management', '/hosts', '/kyc',
    '/profile', '/recharges', '/reports', '/rooms', '/security', '/sellers',
    '/tasks', '/users', '/verification', '/withdrawals',
]);

function getPublicOrigin(request: NextRequest): string {
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');

    if (forwardedHost) {
        return `${forwardedProto}://${forwardedHost}`;
    }

    return request.url;
}

export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname === '/login') {
        return NextResponse.next();
    }

    if (!APP_MANAGEMENT_ROUTES.has(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/', getPublicOrigin(request)));
    }

    const token = request.cookies.get('admin_token');

    if (!token) {
        return NextResponse.redirect(new URL('/login', getPublicOrigin(request)));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
};
