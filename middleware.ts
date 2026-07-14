import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

    const token = request.cookies.get('admin_token');

    if (!token) {
        return NextResponse.redirect(new URL('/login', getPublicOrigin(request)));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
};
