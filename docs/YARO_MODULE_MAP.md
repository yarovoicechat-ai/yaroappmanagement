# Yaro Platform OS — Canonical Module & Route Map

This document catalogs every functional module and route across the **Yaro Platform Operating System**:
- **`YaroAdmin`**: 129 Routes Generated (125 original + 4 new enterprise modules)
- **`YaroAppManagement`**: 49 Routes Generated (47 original + 2 new enterprise modules)

Total platform routes: **178 Routes** — 100% preserved with zero breaking changes.

---

## 1. YaroAdmin (Platform Command Center)

| Category / Domain | Route Path | Component Name / Page | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Core Executive** | `/dashboard` | Executive Dashboard | `PRESERVED + ENHANCED` | Real-time platform KPI metrics and revenue trends. |
| **Core Executive** | `/owner` | Owner Console | `PRESERVED + ENHANCED` | Master revenue shares, platform switches, executive alerts. |
| **Core Executive** | `/health` | System Health Monitor | `PRESERVED + ENHANCED` | Distributed service latency (DB, Redis, Agora, FCM). |
| **User Intelligence** | `/users` | User Directory | `PRESERVED + ENHANCED` | Searchable directory with filtering and quick actions. |
| **User Intelligence** | `/users/add` | User Onboarding | `PRESERVED` | Manual user provisioning desk. |
| **User Intelligence** | `/users/[id]` | 360° User Profile | `PRESERVED + ENHANCED` | Complete user dossier (wallet, rooms, calls, reports, sessions). |
| **Hierarchy** | `/operators` | Operator Directory | `PRESERVED` | Operational staff list. |
| **Hierarchy** | `/operators/create`| Operator Provisioning | `PRESERVED` | Create staff login with specific roles. |
| **Hierarchy** | `/operators/request`| Operator Approvals | `PRESERVED` | Pending operator recruitment queue. |
| **Hierarchy** | `/super-admins` | Super Admin Directory | `PRESERVED` | Root administrative roster. |
| **Hierarchy** | `/admins` | Admin Directory | `PRESERVED` | Platform administrator directory. |
| **Hierarchy** | `/agencies` | Agency Network | `PRESERVED + ENHANCED` | Agency syndicate listings and commission overviews. |
| **Hierarchy** | `/agencies/request`| Agency Verification | `PRESERVED` | Accreditation desk for business entities. |
| **Hierarchy** | `/hosts` | Host Directory | `PRESERVED + ENHANCED` | Broadcaster and streamer management. |
| **Hierarchy** | `/hosts/request` | Host Onboarding Queue | `PRESERVED` | Host verification and voice sample review. |
| **Hierarchy** | `/host-management`| Broadcaster Metrics | `PRESERVED` | Hourly broadcasting quotas and earnings tiers. |
| **Hierarchy** | `/host-levels` | Host Level System | `PRESERVED` | Broadcaster level thresholds and privileges. |
| **Finance** | `/finance/command` | **Finance Command Center** | `NEW (ENTERPRISE)` | Mission-critical ledger, reconciliation, audited wallet adjustments. |
| **Finance** | `/finance/ledger` | Financial Ledger | `PRESERVED` | Complete transaction history across all currencies. |
| **Finance** | `/withdrawals` | Withdrawal Approvals | `PRESERVED + ENHANCED` | Creator bank/UPI payout requests with AML checks. |
| **Finance** | `/recharges/user` | User Recharges | `PRESERVED` | Direct diamond top-ups. |
| **Finance** | `/recharges/seller`| Seller Recharges | `PRESERVED` | Wholesale diamond allocations to authorized sellers. |
| **Finance** | `/recharges/history`| Recharge History | `PRESERVED` | Historical gateway purchase transactions. |
| **Finance / Seller** | `/seller` | Seller Portal | `PRESERVED` | Authorized coin reseller management. |
| **Finance / Seller** | `/seller/recharge` | Seller User Recharge | `PRESERVED` | Direct user recharge from seller stock. |
| **Finance / Seller** | `/seller/stock` | Seller Stock Buying | `PRESERVED` | Wholesale inventory acquisition. |
| **Finance / Seller** | `/seller/ledger` | Seller Profit Ledger | `PRESERVED` | Reseller margins and earnings history. |
| **Live Operations** | `/live/rooms` | **Live Club & Voice Rooms** | `NEW (ENTERPRISE)` | Group stage monitoring, audience counts, emergency shutoff. |
| **Live Operations** | `/live/calls` | **Live Voice & Video Calls**| `NEW (ENTERPRISE)` | 1-on-1 private call monitoring with Agora RTC telemetry. |
| **Live Operations** | `/rooms` | Room Management | `PRESERVED` | Voice room configuration and listing. |
| **Live Operations** | `/calls` | Call History | `PRESERVED` | Historical call detail records (CDR). |
| **Trust & Safety** | `/moderation` | Moderation Overview | `PRESERVED` | Trust and safety incident dashboard. |
| **Trust & Safety** | `/moderation/violations`| Violation Queue | `PRESERVED + ENHANCED` | Live incident triage with real-time WebSocket sync. |
| **Trust & Safety** | `/reports` | User Reports Desk | `PRESERVED` | Complaints and evidence triage. |
| **Trust & Safety** | `/bans/device` | Hardware Device Bans | `PRESERVED + ENHANCED` | Ban device ID, IMEI hash, and MAC address. |
| **Trust & Safety** | `/bans/id` | ID & Account Bans | `PRESERVED + ENHANCED` | Ban user account with justification log. |
| **Security & IAM** | `/security/audit-center`| **Immutable Audit Center** | `NEW (ENTERPRISE)` | Append-only ledger with actor provenance and diff inspection. |
| **Security & IAM** | `/security` | Security Center | `PRESERVED` | Security policy and session management. |
| **Security & IAM** | `/security/logs` | Security Audit Logs | `PRESERVED` | Activity and password reset logs. |
| **Security & IAM** | `/security/permissions`| Permission Builder | `PRESERVED` | Fine-grained RBAC permission matrix. |
| **Security & IAM** | `/security/templates`| Role Templates | `PRESERVED` | Standard role definition templates. |
| **Security & IAM** | `/security/compare` | Compare Users | `PRESERVED` | Compare permissions between operators. |
| **Verification** | `/verification/face`| Face Verification | `PRESERVED` | Automated & manual facial match review. |
| **Verification** | `/verification/kyc` | KYC Verification | `PRESERVED` | Government identity verification desk. |
| **Verification** | `/verification/reports`| Verification Reports | `PRESERVED` | Rejection and pass rate analytics. |
| **Support** | `/help-support` | Customer Support Desk | `PRESERVED + ENHANCED` | Support ticket triage, assignments, and resolution. |
| **Developer** | `/logs` | System Logs | `PRESERVED` | Server error and application logs. |
| **Developer** | `/api-center` | API Center | `PRESERVED` | Endpoint documentation and integration keys. |
| **Settings** | `/settings` | System Settings | `PRESERVED` | Core platform operational parameters. |

---

## 2. YaroAppManagement (App Operations Center)

| Category / Domain | Route Path | Component Name / Page | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Core Operations** | `/` (Dashboard) | App Operations Console | `PRESERVED + ENHANCED` | Active app versions, remote config status, operational alerts. |
| **Core Operations** | `/feature-flags` | **Feature Flag Engine** | `NEW (ENTERPRISE)` | 0-100% canary rollout, segment targeting, kill switch. |
| **Core Operations** | `/app-releases` | Mobile Release Center | `PRESERVED + ENHANCED` | APK/AAB binary distribution with SHA-256 integrity hashing. |
| **Core Operations** | `/screen-security`| Client Security Rules | `PRESERVED` | Screenshot blocking and recording prevention. |
| **Core Operations** | `/settings` | App Remote Settings | `PRESERVED` | Force update thresholds and maintenance switches. |
| **Core Operations** | `/logs` | System Logs | `PRESERVED` | Mobile event and client telemetry logs. |
| **Economy Studio** | `/gifts` | Virtual Gift Studio | `PRESERVED + ENHANCED` | Gift creation, pricing, and SVGA asset management. |
| **Economy Studio** | `/frames` | Avatar Frames Studio | `PRESERVED + ENHANCED` | Profile frame rewards and status borders. |
| **Economy Studio** | `/avatars` | Avatars Studio | `PRESERVED` | Curated system avatars. |
| **Economy Studio** | `/vip` | VIP Program Studio | `PRESERVED + ENHANCED` | Tier pricing, entrance effects, and privileges. |
| **Economy Studio** | `/levels` | User Levels Studio | `PRESERVED + ENHANCED` | Wealth and charisma level thresholds. |
| **Content Studio** | `/cms` | CMS Content Editor | `PRESERVED` | Legal terms, privacy policy, and host guidelines. |
| **Content Studio** | `/banners` | Banner Scheduler | `PRESERVED + ENHANCED` | In-app promotional carousels and deep links. |
| **Content Studio** | `/ads` | In-App Ad Studio | `PRESERVED` | Ad network placements and reward frequencies. |
| **Content Studio** | `/events` | Event Management | `PRESERVED` | Gifting festivals and leaderboard events. |
| **Communications** | `/notifications/campaigns`| **Campaign Center** | `NEW (ENTERPRISE)` | Multi-channel FCM push, in-app alerts, socket broadcasts. |
| **Communications** | `/messages/system`| System Announcements | `PRESERVED` | Broadcast notices to mobile clients. |
| **Communications** | `/messages/activity`| Activity Alerts | `PRESERVED` | Reward and gamification notification alerts. |
| **Trust & Bans** | `/bans/device` | Device Ban Desk | `PRESERVED` | Hardware identifiers blacklisting. |
| **Trust & Bans** | `/bans/id` | ID Ban Desk | `PRESERVED` | Account blacklisting. |
| **Support** | `/help-support` | Customer Support Desk | `PRESERVED` | User ticketing and issue resolution. |
| **Moderation** | `/moderation` | Content Moderation | `PRESERVED` | Bio, username, and image approval desk. |
