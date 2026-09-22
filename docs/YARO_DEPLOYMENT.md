# Yaro Platform OS — Production Deployment & Operations Runbook

## 1. Production Architecture Overview

The Yaro Platform Operating System is deployed on an enterprise Ubuntu server cluster managed via PM2 process manager and Nginx reverse proxy with TLS/SSL termination.

| Service Component | Subdomain / URI | Port | PM2 Process Name | Process ID | Tech Stack |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **Yaro Platform Command Center** | `admin.meethi.live` | `3100` | `yaro-admin` | 10 | Next.js 16 (Turbopack) |
| **Yaro App Operations Center** | `management.meethi.live` | `3102` | `yaro-management` | 11 | Next.js 16 (Turbopack) |
| **Yaro Backend API Gateway** | `api.yaroapp.in` / `api.meethi.live` | `3101` | `yaro-server` | 8 | Node.js / Express / Socket.io |
| **Yaro Web Portal** | `yaroapp.in` / `meethi.live` | `3105` | `yaro-website` | 9 | Next.js / Static SSR |

Server IP: `217.216.58.223` (Access via SSH key as `root`).

---

## 2. Pre-Deployment Validation Gate (Zero Downtime)

Before deploying updates to the live cluster, run the following automated pipeline locally:

```powershell
# 1. Verify YaroAdmin Build & Type Checking
cd "e:\All In One\voice call Club\YaroAdmin"
npm run build

# 2. Verify YaroAppManagement Build & Type Checking
cd "e:\All In One\voice call Club\YaroAppManagement"
npm run build
```

Expected validation criteria:
- **Zero compile errors** (Exit Code 0).
- **YaroAdmin**: $\ge 129$ static/dynamic routes generated.
- **YaroAppManagement**: $\ge 49$ static/dynamic routes generated.

---

## 3. Remote Server Deployment Runbook

Deployments to production server `217.216.58.223` follow this exact execution sequence:

### Step 1: Git Push to Remote Repository
```powershell
git add .
git commit -m "feat(platform-os): complete enterprise control plane overhaul for YaroAdmin and YaroAppManagement"
git push origin main
```

### Step 2: SSH Connect & Pull Code
```bash
ssh root@217.216.58.223

# Navigate to project root
cd /var/www/yaro   # (or configured deployment directory)
git pull origin main
```

### Step 3: Production Build on Server
```bash
# Build YaroAdmin
cd /var/www/yaro/YaroAdmin
npm install --legacy-peer-deps
npm run build

# Build YaroAppManagement
cd /var/www/yaro/YaroAppManagement
npm install --legacy-peer-deps
npm run build
```

### Step 4: Graceful Zero-Downtime Reload via PM2
```bash
# Gracefully reload admin and management processes without dropping in-flight requests
pm2 reload yaro-admin
pm2 reload yaro-management

# Inspect status
pm2 status
pm2 logs yaro-admin --lines 30 --nostream
pm2 logs yaro-management --lines 30 --nostream
```

---

## 4. Rollback Plan

If an unexpected runtime regression occurs in production:
1. Revert Git HEAD to the previous stable release commit:
   ```bash
   git reset --hard HEAD~1
   npm run build
   pm2 reload yaro-admin yaro-management
   ```
2. Trigger the emergency **Kill Switch** on any failing remote feature via `management.meethi.live/feature-flags`.
3. Check `/security/audit-center` to verify all actor actions and system states.
