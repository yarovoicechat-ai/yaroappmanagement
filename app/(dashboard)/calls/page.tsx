'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallsPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/rooms');
    }, [router]);

    return (
        <div className="flex h-96 items-center justify-center text-zinc-400">
            Redirecting to Rooms...
        </div>
    );
}
