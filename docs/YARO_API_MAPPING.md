# Yaro Platform OS — Canonical API Mapping Matrix

This document provides a comprehensive mapping between frontend UI modules in the **Yaro Platform Operating System** (`YaroAdmin` and `YaroAppManagement`) and backend API endpoints on `YaroServer` (Port 3101, `api.yaroapp.in` / `api.meethi.live`).

---

## 1. YaroAdmin API Mappings

| Domain / Feature | UI Module Route | Backend API Endpoint | HTTP Method | Request / Query Schema | Response Data Schema |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Authentication** | `/login` | `/api/admin/auth/login` | `POST` | `{ email, password, role }` | `{ token, admin: { id, name, email, role, permissions } }` |
| **Executive Telemetry** | `/dashboard` | `/api/admin/dashboard/stats` | `GET` | `?range=today\|7d\|30d` | `{ activeUsers, liveRooms, activeCalls, revenue, hostEarnings }` |
| **User Directory** | `/users` | `/api/admin/users` | `GET` | `?page=1&limit=20&search=...` | `{ users: User[], total, page, totalPages }` |
| **User 360° Profile** | `/users/[id]` | `/api/admin/users/:id` | `GET` | `id: string (ObjectId)` | `{ user: User, wallet: Wallet, stats, kyc, devices }` |
| **User Moderation** | `/users/[id]` | `/api/admin/users/:id/block` | `POST` | `{ reason: string, duration?: number }` | `{ success: true, status: 'blocked' }` |
| **Host Directory** | `/hosts` | `/api/admin/hosts` | `GET` | `?page=1&status=active` | `{ hosts: Host[], total }` |
| **Host Onboarding** | `/hosts/request` | `/api/admin/hosts/requests` | `GET` | `?status=pending` | `{ requests: HostApplication[] }` |
| **Host Approval** | `/hosts/request` | `/api/admin/hosts/:id/approve`| `POST` | `{ agencyId?: string }` | `{ success: true, host: Host }` |
| **Agency Roster** | `/agencies` | `/api/admin/agencies` | `GET` | `?page=1&limit=20` | `{ agencies: Agency[], total }` |
| **Seller Desk** | `/seller` | `/api/admin/sellers` | `GET` | `?page=1` | `{ sellers: Seller[], total }` |
| **Finance Command** | `/finance/command`| `/api/admin/finance/overview` | `GET` | `?timeframe=30d` | `{ grossRevenue, totalDisbursed, sellerStockValue }` |
| **Wallet Adjustments** | `/finance/command`| `/api/admin/wallet/adjust` | `POST` | `{ userId, currency, amount, type, reason }` | `{ success: true, newBalance, auditId }` |
| **Withdrawal List** | `/withdrawals` | `/api/admin/withdrawals` | `GET` | `?status=pending` | `{ withdrawals: WithdrawalRequest[] }` |
| **Withdrawal Payout** | `/withdrawals` | `/api/admin/withdrawals/:id/approve` | `POST` | `{ referenceNumber, transactionSlip }` | `{ success: true, status: 'processed' }` |
| **Recharge Logs** | `/recharges/history`| `/api/admin/recharges` | `GET` | `?page=1` | `{ recharges: RechargeRecord[] }` |
| **Active Live Rooms** | `/live/rooms` | `/api/admin/rooms/active` | `GET` | `?type=voice_club` | `{ rooms: ActiveRoom[] }` |
| **Emergency Room Kill**| `/live/rooms` | `/api/admin/rooms/:id/close` | `POST` | `{ reason: string }` | `{ success: true, message: 'Room terminated' }` |
| **Live Call Monitor** | `/live/calls` | `/api/admin/calls/active` | `GET` | `None` | `{ calls: ActiveCall[] }` |
| **Call Termination** | `/live/calls` | `/api/admin/calls/:id/terminate`| `POST` | `{ reason: string }` | `{ success: true, message: 'Call dropped' }` |
| **Violation Triage** | `/moderation/violations`| `/api/admin/moderation/violations` | `GET` | `?severity=high` | `{ violations: ViolationEvent[] }` |
| **Hardware Device Ban**| `/bans/device` | `/api/admin/bans/device` | `POST` | `{ deviceId, reason, ipAddress }` | `{ success: true, bannedAt: Date }` |
| **Immutable Audit** | `/security/audit-center`| `/api/ems/audit-logs` | `GET` | `?page=1&limit=50` | `{ logs: AuditLogRecord[] }` |
| **System Diagnostics** | `/health` | `/api/admin/health` | `GET` | `None` | `{ mongo: 'UP', redis: 'UP', agora: 'UP', uptime }` |

---

## 2. YaroAppManagement API Mappings

| Domain / Feature | UI Module Route | Backend API Endpoint | HTTP Method | Request / Query Schema | Response Data Schema |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **App Releases (APK)** | `/app-releases` | `/api/admin/app-releases` | `GET` | `?platform=android` | `{ releases: AppRelease[] }` |
| **Release Upload** | `/app-releases` | `/api/admin/app-releases/upload` | `POST` (Multipart) | `FormData: { file, versionName, versionCode, notes }` | `{ release: AppRelease, sha256Checksum }` |
| **Feature Flags** | `/feature-flags` | `/api/admin/feature-flags` | `GET` | `None` | `*GAP-01: Routes pending; Mongoose model ready` |
| **Emergency Kill Switch**| `/feature-flags` | `/api/admin/feature-flags/:key/kill-switch` | `POST` | `{ reason: string }` | `*GAP-01: Routes pending` |
| **Virtual Gifts Catalog**| `/gifts` | `/api/admin/gifts` | `GET` | `?page=1` | `{ gifts: GiftItem[] }` |
| **Create Virtual Gift** | `/gifts` | `/api/admin/gifts` | `POST` | `{ name, coinPrice, diamondYield, category, svgaUrl }` | `{ gift: GiftItem }` |
| **Avatar Frames** | `/frames` | `/api/admin/frames` | `GET` | `None` | `{ frames: FrameItem[] }` |
| **VIP Tier Packages** | `/vip` | `/api/admin/vip-plans` | `GET` | `None` | `{ plans: VipPlan[] }` |
| **Content CMS Pages** | `/cms` | `/api/admin/cms` | `GET` | `?slug=terms\|privacy` | `{ page: CmsDocument }` |
| **Promotional Banners**| `/banners` | `/api/admin/banners` | `GET` | `?active=true` | `{ banners: BannerItem[] }` |
| **Notification Hub** | `/notifications/campaigns`| `/api/admin/campaigns` | `GET` | `None` | `*GAP-02: Routes pending` |
| **System Push Alert** | `/messages/system` | `/api/admin/notifications/system` | `POST` | `{ title, content, targetGroup }` | `{ success: true, recipientsCount }` |
| **App Settings** | `/settings` | `/api/admin/settings` | `GET` / `PUT` | `{ minVersion, forceUpdate, maintenanceMode }` | `{ settings: AppSettings }` |
