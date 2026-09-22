# Yaro Platform OS — Enterprise RBAC & IAM Matrix

## 1. Principles of Platform Access Governance

1. **Defense-in-Depth**: Frontend RBAC via `<PermissionGate>` and conditional UI states is strictly an operational and UX safeguard. The backend API Gateway (`YaroServer`) remains the authoritative security perimeter; all incoming HTTP and WebSocket requests are authenticated via JWT claims and validated against role/permission middleware.
2. **Principle of Least Privilege**: Operators and automated agents are granted solely the permissions strictly required to perform their discrete duties.
3. **Mandatory Audit Justification**: Destructive, security, or financial mutations (`DELETE`, `BLOCK`, `SUSPEND`, `REFUND`, `ADJUST_WALLET`) require a mandatory operational justification logged to the immutable audit ledger.

---

## 2. Canonical Roles Hierarchy

```
[Level 1: Platform Owner / Founder]
       |
[Level 2: Super Admin]
       |
+------+------+------+------+------+------+
|             |             |             |
[Admin]   [Finance]     [Security]   [Release]
|             |             |             |
[Operator] [Moderator]  [Content]   [Marketing]
|             |
[CS Support] [Analyst]
```

### Role Taxonomy
1. **Owner / Super Admin**: Unrestricted command across both panels, database governance, and master encryption/API key management.
2. **Admin**: Operational platform manager overseeing users, hosts, agencies, sellers, and system configs.
3. **Finance Officer**: Guardian of platform balance sheets, creator payouts, seller wholesale ledgers, and reconciliation.
4. **Security Officer**: Surveillance over IP anomalies, multi-device abuse, login sessions, and immutable audit logs.
5. **Release Manager**: Governs Android APK/AAB build distribution pipelines and progressive feature flag canaries.
6. **Moderator (Trust & Safety)**: Real-time room surveillance, text filter violation triage, user bans, and appeal processing.
7. **Content & Marketing Manager**: Manages CMS policies, in-app banners, push campaigns, and digital economy assets (gifts, frames).
8. **Operator / Customer Support**: User onboarding assistance, face/KYC verification reviews, ticket resolution.
9. **Agency / Seller / Host**: External partner roles accessing designated sub-portals.

---

## 3. Atomic Permission Capabilities

| Permission Key | Scope Description | High Risk / Audited? |
| :--- | :--- | :--- |
| `VIEW` | Read-only inspection of tables, charts, user profiles, and logs. | No |
| `CREATE` | Generating new entities (new user, new gift, new banner, new operator). | Low |
| `EDIT` | Updating non-destructive metadata (bio, price, description, schedule). | Medium |
| `DELETE` | Soft-deleting or purging records from active indexes. | **YES (Audit Required)** |
| `APPROVE` | Authorizing pending requests (KYC, host audition, withdrawal payout). | **YES (Audit Required)** |
| `REJECT` | Declining pending applications with operator feedback. | Medium |
| `EXPORT` | Downloading sensitive CSV or JSON data extracts. | **YES (Audit Required)** |
| `BLOCK` | Permanently banning user IDs, devices, or IP ranges. | **YES (Audit Required)** |
| `SUSPEND` | Temporarily freezing user privileges or broadcaster streaming access. | **YES (Audit Required)** |
| `REFUND` | Reversing disputed payment gateway transactions. | **YES (Audit Required)** |
| `ADJUST_WALLET` | Crediting or debiting user/seller coin, diamond, or bean balances. | **CRITICAL (Audit Required)** |
| `MANAGE_SETTINGS` | Modifying server environment flags, maintenance mode, or API keys. | **CRITICAL (Audit Required)** |
| `MANAGE_RELEASE` | Publishing new APK/AAB versions or triggering client force-updates. | **CRITICAL (Audit Required)** |
| `MANAGE_FINANCE` | Approving banking payout batches and running nightly reconciliations. | **CRITICAL (Audit Required)** |

---

## 4. Role × Permission Access Matrix

| Role | VIEW | CREATE | EDIT | DELETE | APPROVE | REJECT | EXPORT | BLOCK | SUSPEND | REFUND | ADJUST_WALLET | MANAGE_SETTINGS | MANAGE_RELEASE | MANAGE_FINANCE |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Owner / Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| **Finance Officer** | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Security Officer** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ⚠️ | ❌ | ❌ |
| **Moderator (T&S)** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Release Manager** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ✅ | ❌ |
| **Content Manager** | ✅ | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Marketing Manager** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Customer Support** | ✅ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Operator** | ✅ | ❌ | ⚠️ | ❌ | ⚠️ | ⚠️ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ |

*(Legend: ✅ = Permitted; ⚠️ = Permitted with secondary confirmation & audit reason; ❌ = Prohibited)*

---

## 5. Module Access Boundary

| System Module | Permitted Roles | Route Gate Key |
| :--- | :--- | :--- |
| **Executive Console (`/owner`, `/dashboard`)** | Super Admin, Owner | `EXECUTIVE_ACCESS` |
| **Immutable Audit Center (`/security/audit-center`)** | Super Admin, Security Officer, Finance | `AUDIT_VIEW` |
| **Finance Command Center (`/finance/command`)** | Super Admin, Finance Officer | `FINANCE_MANAGE` |
| **Withdrawal Approvals (`/withdrawals`)** | Super Admin, Finance Officer | `WITHDRAWAL_APPROVE` |
| **Live Call & Room Ops (`/live/calls`, `/live/rooms`)** | Super Admin, Admin, Moderator | `LIVE_OPS_SURVEILLANCE` |
| **Moderation Violations (`/moderation/violations`)** | Super Admin, Admin, Moderator | `MODERATION_ACTION` |
| **Feature Flag Engine (`/feature-flags`)** | Super Admin, Release Manager, Admin | `SETTINGS_MANAGE` |
| **App Releases (`/app-releases`)** | Super Admin, Release Manager | `RELEASE_MANAGE` |
| **Content Studio (`/cms`, `/banners`, `/events`)** | Super Admin, Content Manager | `CONTENT_MANAGE` |
| **Economy Studio (`/gifts`, `/frames`, `/vip`)** | Super Admin, Content Manager, Finance | `ECONOMY_MANAGE` |
| **Notification Campaigns (`/notifications/campaigns`)**| Super Admin, Marketing, Admin | `CAMPAIGN_MANAGE` |
