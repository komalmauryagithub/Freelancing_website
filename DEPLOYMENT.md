# Production Deployment & Operational Engineering Guide

## Overview

This repository is an enterprise-grade full-stack creative freelancing digital studio and client management platform ("Vanguard Digital Studio"). Built with **Next.js App Router (React 19)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **Render Managed PostgreSQL**, it integrates end-to-end client booking, lead CRM, milestone project management, real-time messaging, calendar scheduling, automated invoicing, and **Razorpay** payment processing.

---

## 1. Prerequisites & System Requirements

- **Node.js**: v20.18+ (tested and pinned via `.node-version` and `package.json` engines)
- **PostgreSQL**: PostgreSQL 14+ (hosted on Render Managed PostgreSQL or running locally)
- **Package Manager**: npm v10+

---

## 2. Environment Variables & Secret Configuration

Copy the example environment configuration:

```bash
cp .env.example .env
```

### Complete Environment Variables Checklist:

| Variable Name | Required | Scope | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | Server | PostgreSQL connection string (`?sslmode=require` in production). In Render, use the **Internal Database URL** for zero-latency, private network VPC connectivity. |
| `NODE_ENV` | **Yes** | Server | Set to `production` in production deployment. |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Public | Base domain (e.g. `https://vanguard-freelancer-platform.onrender.com` or custom domain). |
| `PORT` | Optional | Server | Injected automatically by Render (defaults to `10000`). |
| `RAZORPAY_KEY_ID` | **Yes** | Server | Razorpay API Key ID (`rzp_test_...` in test mode, `rzp_live_...` in live production). |
| `RAZORPAY_KEY_SECRET` | **Yes** | Server | Razorpay Key Secret for server-side order generation and HMAC signature verification. |
| `RAZORPAY_WEBHOOK_SECRET` | **Yes** | Server | Secret configured in Razorpay Dashboard for webhook signature verification. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **Yes** | Public | Razorpay Key ID exposed to client browser to open checkout modal safely. |
| `SESSION_SECRET` | Optional | Server | Fallback cryptographic entropy for session hashing (minimum 32 characters). |

> [!CAUTION]
> **Zero Credential Exposure**: Never commit `.env` or paste secrets into `NEXT_PUBLIC_*` variables. All application logs sanitize database connection strings and sensitive headers automatically via `src/lib/logger.ts`.

---

## 3. Render Production Deployment

### Option A: 1-Click Render Blueprint Deployment (Recommended)

This repository includes a production-ready `render.yaml` infrastructure-as-code specification.

1. Push your repository to GitHub or GitLab.
2. In the [Render Dashboard](https://dashboard.render.com), click **Blueprints** → **New Blueprint Instance**.
3. Connect your repository. Render will automatically detect `render.yaml` and provision:
   - **Managed PostgreSQL Database**: `freelancer-db` (Starter plan with automated backups, VPC private network).
   - **Next.js Web Service**: `vanguard-freelancer-platform` (Starter plan, automated build & deploy, health checks at `/api/health`).
4. Render prompts for the non-synced Razorpay secrets (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`). Enter your test or live keys.
5. Click **Apply**. Render will provision the database, inject the internal connection string, apply migrations, and launch the web service.

---

### Option B: Manual Render Deployment Step-by-Step

#### Step 1: Provision Render Managed PostgreSQL
1. In Render Dashboard, click **New +** → **PostgreSQL**.
2. **Name**: `freelancer-db`
3. **Database**: `freelancer_platform`
4. **User**: `vanguard_admin`
5. **Region**: `Oregon` (US West) or `Frankfurt` (EU Central).
6. **Plan**: `Starter` (includes automated daily backups and high availability).
7. Click **Create Database**.
8. Once provisioned, copy the **Internal Database URL** from the Connection Info section.

#### Step 2: Provision Next.js Web Service
1. Click **New +** → **Web Service** and connect your repository.
2. **Name**: `vanguard-freelancer-platform`
3. **Region**: Same region as your database (`Oregon`).
4. **Branch**: `main`
5. **Runtime**: `Node`
6. **Build Command**:
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```
7. **Start Command**:
   ```bash
   npm run start
   ```
8. **Health Check Path**: `/api/health`
9. **Environment Variables**:
   - `DATABASE_URL`: *(Paste the Internal Database URL from Step 1)*
   - `NODE_ENV`: `production`
   - `NEXT_PUBLIC_APP_URL`: `https://vanguard-freelancer-platform.onrender.com`
   - `RAZORPAY_KEY_ID`: `rzp_test_...`
   - `RAZORPAY_KEY_SECRET`: `...`
   - `RAZORPAY_WEBHOOK_SECRET`: `...`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: `rzp_test_...`
10. Click **Create Web Service**.

---

## 4. Post-Deployment Database Initialization

### 1. Safe Production Migrations
Migrations run automatically during the Render build phase via `npx prisma migrate deploy`. To manually execute pending migrations from the Render Shell tab:
```bash
npx prisma migrate deploy
```

### 2. Bootstrap the Studio Administrator
Run the secure server-side bootstrap command to initialize the administrator account:
```bash
npm run auth:bootstrap-admin
```
Or execute via Render **Shell**:
```bash
npx tsx scripts/bootstrap-admin.ts --email=director@vanguardstudio.io --name="Studio Director" --password="YourSecurePassword123!"
```

### 3. (Optional) Seed Sample Studio Content
To populate sample portfolio projects, service catalog offerings, and demonstration records:
```bash
npm run db:seed
```

---

## 5. Transitioning from Razorpay Test Mode to Live Production Payments

1. **Complete Business Verification**: In your [Razorpay Dashboard](https://dashboard.razorpay.com), complete KYC and account activation.
2. **Generate Live API Keys**:
   - Navigate to **Settings** → **API Keys** → **Generate Live Key**.
   - Copy `Key Id` (`rzp_live_...`) and `Key Secret`.
3. **Configure Webhook in Razorpay Dashboard**:
   - Navigate to **Settings** → **Webhooks** → **Add New Webhook**.
   - **Webhook URL**: `https://your-custom-domain.com/api/webhooks/razorpay`
   - **Secret**: Enter a strong random secret (e.g. 32-character hex).
   - **Active Events**:
     - `payment.captured`
     - `payment.failed`
     - `order.paid`
     - `refund.processed`
     - `refund.created`
4. **Update Render Environment Variables**:
   - Set `RAZORPAY_KEY_ID` to your `rzp_live_...` Key ID.
   - Set `RAZORPAY_KEY_SECRET` to your live Key Secret.
   - Set `RAZORPAY_WEBHOOK_SECRET` to the webhook secret you configured.
   - Set `NEXT_PUBLIC_RAZORPAY_KEY_ID` to your live Key ID.
5. Save changes in Render. The Web Service will perform a zero-downtime rolling restart with live payment processing enabled.

---

## 6. Persistent File Storage Architecture

On Render, Web Service container filesystems are ephemeral (restarting a container resets `/public/uploads`).

### Storage Strategies:
1. **Render Persistent Disk**:
   - In Render Dashboard under your Web Service, go to **Disks** → **Add Disk**.
   - Mount path: `/var/data`.
   - Size: 10GB - 50GB.
   - Create a symlink from `/var/data` to `public/uploads`.
2. **Cloudflare R2 / AWS S3 Object Storage**:
   - For scale, configure AWS S3 or Cloudflare R2 bucket credentials.
   - Upload routes stream files directly to the S3-compatible bucket, storing authorized signed URLs in PostgreSQL.

---

## 7. Database Backups, Recovery & Disaster Recovery

### Automated Backups (Render Managed PostgreSQL)
Render Managed PostgreSQL on Starter and higher plans automatically takes **daily automated snapshots** retained for 7 days with point-in-time recovery.

### Manual Backup (CLI)
From your local workstation or CI runner with network access:
```bash
# Create compressed PostgreSQL dump
pg_dump -Fc -v -d "YOUR_EXTERNAL_DATABASE_URL" -f "vanguard_backup_$(date +%Y%m%d_%H%M%S).dump"
```

### Database Restore Procedure
```bash
# Restore from compressed dump
pg_restore -v --clean --no-owner --no-acl -d "YOUR_EXTERNAL_DATABASE_URL" vanguard_backup_YYYYMMDD.dump
```

---

## 8. Rollback Procedures

### Application Code Rollback
1. In the Render Dashboard, navigate to your Web Service.
2. Open the **Deploys** tab.
3. Locate the previous stable deployment commit/SHA.
4. Click the three dots `...` and select **Rollback to this deploy**.
5. Render immediately switches traffic to the prior container build without downtime.

### Database Schema Rollback
If a migration needs to be rolled back:
1. Apply the corresponding down-migration script or restore the database from the pre-deployment snapshot taken prior to the release.
2. Deploy the previous application version.

---

## 9. Custom Domain & HTTPS Mapping

1. In Render Dashboard, open **Settings** → **Custom Domains**.
2. Add your apex domain (e.g. `vanguardstudio.io`) and subdomain (`www.vanguardstudio.io`).
3. In your DNS provider (Cloudflare, Namecheap, Route 53):
   - Add a `CNAME` record for `www` pointing to `vanguard-freelancer-platform.onrender.com`.
   - Add an `ALIAS` or `ANAME` record (or Cloudflare CNAME flattening) for the apex `@`.
4. Render automatically provisions and auto-renews free TLS/SSL certificates via Let's Encrypt.

---

## 10. Automated Test Verification & Quality Gates

The codebase contains 156 automated unit, integration, and security tests:

```bash
# Run all 5 platform test suites
npm test
```

### Individual Test Suites:
- `npm run test:auth`: 21 tests (Bcrypt 12 rounds, RBAC, session expiry, token entropy, enumeration defense)
- `npm run test:crm`: 27 tests (Idempotency lock, lead CRM, quotation line-item math, audit logs)
- `npm run test:portal`: 28 tests (Client tenant isolation, protected document streaming, milestone progress math, change requests)
- `npm run test:phase6`: 31 tests (Socket.IO auth, chat rate limits, call booking double-booking defense, UTC timezone invariant)
- `npm run test:payments`: 49 tests (Invoice calculations, tax math, Razorpay HMAC SHA-256 signatures, webhook raw body HMAC, duplicate webhook idempotency, settlement reconciliation, refund state handling)

### Type Checking & Production Build Verification:
```bash
# Type check without compilation
npx tsc --noEmit

# Production Next.js build
npm run build
```
