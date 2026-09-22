# Yaro Platform OS — Backend Gap Register

This document tracks all features within the **Yaro Platform Operating System** (`Yaro Platform Command Center` and `Yaro App Operations Center`) that require dedicated backend endpoints, database schema additions, or asynchronous workers. 

In accordance with Yaro Safety Rule #0, **no mock data is fabricated**. Where backend endpoints are missing, the UI gracefully renders a typed empty state and informs the operator: `"Backend integration required"`.

---

## Gap Matrix

| ID | Feature | Panel & Route | Frontend Status | Required API Endpoint | Required Model / Collection | Required Permission | Required Audit Event | Priority | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GAP-01** | **Feature Flag & Remote Config Engine** | `YaroAppManagement` `/feature-flags` | `IMPLEMENTED + BACKEND REQUIRED` | `GET /api/admin/feature-flags`<br>`POST /api/admin/feature-flags`<br>`PUT /api/admin/feature-flags/:key`<br>`POST /api/admin/feature-flags/:key/kill-switch` | Mongoose model `FeatureFlag` already defined in `YaroServer/src/models/featureFlag.model.ts`. Needs routes & controllers. | `MANAGE_SETTINGS` / `SUPER_ADMIN` | `CONFIG_CHANGE`, `KILL_SWITCH_TRIGGERED` | **P0 (Critical)** | Mobile app client SDK needs config polling endpoint (`/api/v1/config/flags`). |
| **GAP-02** | **Multi-Channel Campaign Center** | `YaroAppManagement` `/notifications/campaigns` | `IMPLEMENTED + BACKEND REQUIRED` | `GET /api/admin/campaigns`<br>`POST /api/admin/campaigns/dispatch`<br>`GET /api/admin/campaigns/:id/metrics` | `Campaign` model with fields `title`, `message`, `channel`, `targeting`, `metrics`, `status`. | `CREATE` / `EDIT` / `APPROVE` | `CAMPAIGN_BROADCAST_DISPATCH` | **P1 (High)** | Redis queue + BullMQ for batch FCM dispatch to prevent blocking event loop. |
| **GAP-03** | **Interactive Audience Segmentation Engine** | `YaroAdmin` `/users/segments`<br>`YaroAppManagement` `/notifications/campaigns` | `IMPLEMENTED + BACKEND REQUIRED` | `POST /api/admin/segments/preview-count`<br>`POST /api/admin/segments/export` | MongoDB aggregation pipeline over `User`, `Wallet`, `CallHistory`, and `RoomParticipant`. | `VIEW` / `EXPORT` | `SEGMENT_QUERY_RUN` | **P1 (High)** | Database index on `user.createdAt`, `user.lastActive`, `wallet.totalRecharged`. |
| **GAP-04** | **Agora RTC Telemetry Stream** | `YaroAdmin` `/live/calls`<br>`/live/rooms` | `IMPLEMENTED + BACKEND REQUIRED` (Basic active calls connected via `/api/admin/calls/active`) | `GET /api/admin/agora/channel-metrics/:channelName`<br>`POST /api/admin/calls/:id/kick` | Real-time Webhook receiver for Agora RTC Channel Events (`user_joined`, `user_left`, `quality_report`). | `VIEW` / `SUSPEND` | `CALL_FORCED_TERMINATION` | **P1 (High)** | Agora Console REST API Credentials & Webhook secret signature verification. |
| **GAP-05** | **Automated Financial Reconciliation Worker** | `YaroAdmin` `/finance/command`<br>`/finance/ledger` | `IMPLEMENTED + BACKEND REQUIRED` (Manual ledger adjustments connected via `/api/admin/wallet/adjust`) | `GET /api/admin/finance/reconciliation-status`<br>`POST /api/admin/finance/run-reconciliation` | Cron worker computing daily balance invariant: `UserOpeningCoins + RechargedCoins - SpentCoins == UserClosingCoins`. | `MANAGE_FINANCE` / `APPROVE` | `FINANCIAL_RECONCILIATION_RUN` | **P0 (Critical)** | Atomic MongoDB multi-document transactions enabled via replica set. |
| **GAP-06** | **Hardware Device Ban Enforcement** | `YaroAdmin` `/bans/device`<br>`YaroAppManagement` `/bans/device` | `IMPLEMENTED + API CONNECTED` (basic ban); Telemetry integration required | `POST /api/admin/bans/device`<br>`GET /api/admin/bans/device/telemetry` | `DeviceBan` collection storing `deviceId`, `androidId`, `imeiHash`, `ipAddress`, `reason`. | `BLOCK` / `SUPER_ADMIN` | `DEVICE_BAN_ENFORCED` | **P2 (Medium)** | App native code device fingerprinting module. |
| **GAP-07** | **In-App Gift Audio-Visual Asset Previews** | `YaroAppManagement` `/gifts` | `IMPLEMENTED + API CONNECTED` (metadata); Live SVGA/Lottie previewer required | `GET /api/admin/gifts/:id/preview-manifest` | S3 / Cloudinary asset CDN hosting `.svga`, `.pag`, and `.lottie` animation files. | `VIEW` | None | **P2 (Medium)** | Web SVGA Player or Lottie-web canvas integration. |

---

## Implementation Sequence for Backend Engineering

1. **Deploy Feature Flag Express Routes:**
   - Mount `/api/admin/feature-flags` on `YaroServer/src/routes/admin/featureFlag.routes.ts`.
   - Wire CRUD controllers to existing `FeatureFlag` model (`src/models/featureFlag.model.ts`).
2. **Deploy Campaign Worker Queue:**
   - Initialize Redis queue worker in `YaroServer` to ingest batches of FCM push notifications with exponential backoff and delivery logging.
3. **Mount Financial Balance Invariant Audit:**
   - Create nightly cron job checking reconciliation between payment gateway capture events (`Razorpay` / `In-App Purchases`) and MongoDB `Wallet` ledger balances.
