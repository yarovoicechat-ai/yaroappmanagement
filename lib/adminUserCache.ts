// Persist only bounded identity fields, never documents or inline media.
export function cacheAdminUser(user: unknown): void {
    const source = user as Record<string, unknown>;
    const cached: Record<string, unknown> = {};
    for (const key of ['id', '_id', 'userId', 'name', 'email', 'role', 'mithiId', 'meethiId', 'employeeCode', 'specialCode', 'referralCode', 'phone', 'phoneNumber', 'whatsappNumber']) {
        const value = source[key];
        if (typeof value === 'number' || (typeof value === 'string' && value.length <= 1024)) cached[key] = value;
    }
    for (const key of ['image', 'profilePhoto', 'avatar']) {
        const value = source[key];
        if (typeof value === 'string' && value.length <= 2048 && !/^(data|blob):/i.test(value)) cached[key] = value;
    }
    try { localStorage.setItem('admin_user', JSON.stringify(cached)); }
    catch {
        // An optional cache must not make successful authentication fail.
        clearAdminUserCache();
    }
}

export function clearAdminUserCache(): void {
    // Release space held by legacy records before saving authentication tokens.
    try { localStorage.removeItem('admin_user'); } catch { /* Storage unavailable. */ }
}
