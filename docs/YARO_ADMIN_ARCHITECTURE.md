# YaroAdmin — Platform Command Center Architecture

## 1. System Identity & Mission

`YaroAdmin` serves as the **Platform Command Center** within the Yaro Platform Operating System. Its primary responsibility is the governance, surveillance, financial integrity, identity lifecycle, and security monitoring across the entire Yaro live audio, video, and social ecosystem.

---

## 2. Multi-Tier Architecture

```
+-----------------------------------------------------------------------+
|                         PRESENTATION LAYER                            |
|  - Obsidian/Slate Enterprise Theme (#070a13 / #0d1222)                |
|  - Global Command Palette (Ctrl + K)                                  |
|  - Reusable Data Systems: DataTable, FilterBar, MetricCard, Dialog   |
+-----------------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------+
|                         RBAC & SECURITY GUARD                         |
|  - PermissionGate wrapper enforcing UX action gates                   |
|  - ConfirmDialog with mandatory justification for privileged actions  |
|  - Dual-Auth Token Storage (LocalStorage Bearer JWT)                  |
+-----------------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------+
|                         SERVICE & HOOK LAYER                          |
|  - Typed service clients (e.g. apiClient, walletService, liveService) |
|  - Socket.io event listener hook (useModerationSocket)               |
|  - Real-time fallback abstractions (graceful gap rendering)          |
+-----------------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------+
|                         BACKEND API GATEWAY                           |
|  - Express / Node.js Engine (Port 3101 - api.yaroapp.in)              |
|  - MongoDB Atomic Collections & Multi-Document Transactions           |
|  - Redis Cache & WebSocket Server                                     |
+-----------------------------------------------------------------------+
```

---

## 3. Complete Information Architecture

### 3.1 Executive Command
- **`/dashboard`**: Real-time KPI telemetry (Live users, active voice rooms, concurrent 1v1 calls, gross revenue, host earnings). Configurable timeframes: Today, Yesterday, 7 Days, 30 Days, 90 Days, Custom Range.
- **`/owner`**: Executive owner console with platform master toggles, top-level revenue shares, and high-level platform status.
- **`/health`**: Distributed telemetry monitor (Node.js API, MongoDB cluster, Redis cache, Agora RTC ping, Firebase FCM, Razorpay/Stripe webhooks).

### 3.2 User Intelligence & 360° Profile
- **`/users`**: Dense DataTable directory of registered members with role filters, status badges, and search.
- **`/users/[id]`**: Complete 360° user profile featuring:
  - Identity & KYC Status
  - Multi-Currency Wallet (Coins, Diamonds, Beans)
  - Call & Room Participation History
  - Gifting Ledger (Sent & Received)
  - Connected Devices & Active Login Sessions
  - Moderation Timeline, Reports & Appeals
  - Action Controls: Block, Unblock, Suspend, Verify, Force Logout, Revoke Sessions.

### 3.3 Host Operations
- **`/hosts`**: Verified streamer and audio broadcaster directory.
- **`/hosts/request`**: Host onboarding queue reviewing live selfies, voice auditions, and agency alignments.
- **`/host-management`**: Broadcaster hourly quotas, earnings tiers, and performance rankings.
- **`/host-levels`**: Level progression thresholds and rewards.

### 3.4 Agency & Seller Syndicate
- **`/agencies`**: Agency organization hierarchy, host rosters, and commission override ledgers.
- **`/agencies/request`**: Accreditation desk for newly applying agencies.
- **`/seller`**: Authorized coin seller management desk.
- **`/seller/recharge`**: Seller stock allocation and wholesale diamond recharge logs.
- **`/seller/ledger`**: Retail profit splits and transaction histories.

### 3.5 Finance Command Center
- **`/finance/command`**: Mission-critical ledger interface, real-time reconciliation state, payment gateway reconciliation status, and audited wallet adjustment drawer.
- **`/finance/ledger`**: Complete immutable ledger of coin purchases, call deductions, gift transfers, diamond conversions, and payouts.
- **`/withdrawals`**: Creator cashout request approvals with dual-verification AML compliance.
- **`/recharges/user`**: User direct recharge logs and diamond credit tracking.

### 3.6 Live Operations
- **`/live/rooms`**: Surveillance of active voice clubs, room speaker stages, audience counts, gifting activity, and emergency room termination.
- **`/live/calls`**: Real-time monitor of 1-on-1 voice and video calls with Agora RTC telemetry (bitrate, packet loss, channel IDs).

### 3.7 Trust, Safety & Security
- **`/moderation` & `/moderation/violations`**: Real-time violation triage queue fed by mobile reports and AI text filters.
- **`/reports`**: User-submitted abuse claims with evidence attachments.
- **`/bans/device`**: Hardware-level bans targeting MAC, Android ID, and IMEI hashes.
- **`/bans/id`**: Account-level permanent suspensions.
- **`/security/audit-center`**: Immutable, append-only audit trail logging Actor, Role, Action, Target, IP, Before/After diffs, and cryptographic hash verification.
- **`/security/permissions`**: Fine-grained RBAC permission matrix builder.
- **`/security/templates`**: Standardized role templates for quick onboarding.

---

## 4. Safety & Compliance Mandates

1. **Zero Route Removal**: All 125 original routes must resolve cleanly with backward compatibility.
2. **Audited Destructive Operations**: Any ban, account deletion, or wallet adjustment requires a confirmed reason passed to `/api/ems/audit-logs`.
3. **No Fake Metrics**: If Agora live packet loss or DB ping is not accessible, UI displays `"Metric unavailable"`.
