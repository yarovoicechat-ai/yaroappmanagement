# YaroAppManagement — App Operations Center Architecture

## 1. System Identity & Mission

`YaroAppManagement` operates as the **App Operations Center** within the Yaro Platform Operating System. Its mission is to empower product managers, release engineers, growth specialists, and economy designers to control client runtime behavior, publish digital content, orchestrate push campaigns, and manage binary mobile releases without deploying code to backend production servers.

---

## 2. Architectural Layers

```
+-----------------------------------------------------------------------+
|                         APPLICATION CLIENTS                           |
|       Android Mobile (Kotlin)  |  iOS Mobile  |  Web Client           |
+-----------------------------------------------------------------------+
                                  ^
                                  | (Pulls Dynamic Config & Flags)
+-----------------------------------------------------------------------+
|                    APP OPERATIONS ENGINE LAYER                        |
|  - Feature Flag & Canary Rollout Engine (0% - 100% targeting)         |
|  - Emergency Remote Kill Switches                                     |
|  - Multi-Channel Notification Hub (FCM, In-App, System Broadcast)   |
|  - App Release Governance (APK/AAB upload, SHA-256 integrity hash)    |
|  - Virtual Asset & Economy Studio (Gifts, VIP, Levels, Frames)        |
+-----------------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------+
|                         SHARED ENTERPRISE UI                          |
|  - Reusable DataTable with sorting, filtering, density & export       |
|  - ConfirmDialog with mandatory justification checks                  |
|  - MetricCard high-density KPI telemetry panels                       |
|  - StatusBadge standardized visual states                             |
+-----------------------------------------------------------------------+
```

---

## 3. Information Architecture & Module Directory

### 3.1 App Operations & Core Console
- **`/` (Dashboard)**: High-level overview of active client versions, remote config status, published banners, pending reports, and operational alerts.
- **`/feature-flags`**: Granular remote configuration switches supporting:
  - 0–100% canary rollout percentage.
  - Multi-platform targeting (Android / iOS / Web).
  - User segmentation (New users, VIP members, verified hosts).
  - Emergency **KILL SWITCH** terminating broken feature code immediately in production.
- **`/settings`**: Platform parameters, minimum supported app version, maintenance mode locks, and force-update thresholds.
- **`/screen-security`**: Client security policies (e.g. screenshot prevention, screen recording blackouts on video calls).

### 3.2 Mobile Release Center
- **`/app-releases`**: Binary distribution pipeline managing Android APK and AAB packages:
  - Lifecycle: `Draft -> Testing -> Approved -> Scheduled -> Released -> Rolled Back`.
  - Artifact Tracking: Version Name, Version Code, File Size, SHA-256 Checksum, Uploader, Approver, Timestamp.
  - **Zero Signing Key Access**: All signing keys reside securely within CI/CD secrets and are never exposed in frontend files.

### 3.3 Economy & Digital Goods Studio
- **`/gifts`**: Virtual gift catalog management (Coin cost, Diamond yield, 2D thumbnails, sound triggers, and SVGA/WebP animation assets).
- **`/frames`**: Avatar decorative frames conveying status in voice rooms.
- **`/avatars`**: Curated system avatars and custom avatar approval workflows.
- **`/vip`**: VIP membership tiers, subscription duration, entry broadcast effects, and privilege flag bundles.
- **`/levels`**: Wealth and charisma level thresholds, badge unlocks, and XP conversion factors.

### 3.4 Content & Communications Studio
- **`/cms`**: In-app rich text pages (Terms of Service, Privacy Policy, Community Guidelines, Host Rules, FAQ).
- **`/banners`**: Home screen carousel and voice room top banner scheduling with deep-link routing.
- **`/ads`**: In-app advertising slot parameters and frequency capping.
- **`/events`**: Seasonal social events, gifting contests, and leaderboard configurations.
- **`/notifications/campaigns`**: Multi-channel campaign hub orchestrating targeted FCM push alerts, in-app notifications, and socket broadcasts.
- **`/messages/system`**: Real-time system notice dispatcher.
- **`/messages/activity`**: Activity reward notifications.

### 3.5 Customer Support & Compliance
- **`/help-support`**: Operator ticketing desk handling user inquiries, payment disputes, and account recovery.
- **`/moderation`**: Content moderation desk filtering text, images, and user bios.
- **`/bans/device` & `/bans/id`**: Operational access to device and account security ban lists.

---

## 4. Safety & Operational Rules

1. **Dangerous Changes Require Confirmation**: Altering force-update versions or triggering a kill switch triggers a confirmation modal requiring operator justification for audit logs.
2. **Backward Compatibility**: All 47 original routes are preserved with zero path breakage.
3. **No Fake Mocks**: Features awaiting backend endpoints render typed fallback states with direct references to `YARO_BACKEND_GAP_REGISTER.md`.
