# Requirements Document

## Introduction

EthioDirect extends the existing AgriLink/EthioDirect monorepo at
`c:\Users\Bamlak\Downloads\project-main` with:

- React Router DOM v6 replacing tab-state SPA navigation
- Role-isolated dashboards (Farmer, Buyer, Logistics, Admin)
- AuthGuard and RoleGuard security components
- DynamicSidebar rendering role-specific navigation
- Python Flask sidecar service (port 5001) for AI crop scanning and IoT weight logging
- New proxy routes in the existing Node.js Express server

The existing stack (React 19 + Vite, Node.js Express, Drizzle ORM, Supabase Postgres,
PGlite fallback, Chapa escrow routes, EthiopianPaymentModal) is preserved and extended.

## Requirements

### 1. Routing and Security Guards

- REQ-101: All routes under `/farmer/*`, `/buyer/*`, `/logistics/*`, `/admin/*` MUST
  be wrapped in `AuthGuard` (`src/guards/AuthGuard.tsx`) which redirects unauthenticated
  visitors to `/login`.
- REQ-102: `RoleGuard` (`src/guards/RoleGuard.tsx`) accepts `allowedRoles: UserRole[]`.
  A user whose role is not in `allowedRoles` is redirected to
  `/<role.toLowerCase()>/dashboard`. Example: FARMER visiting `/buyer` → `/farmer/dashboard`.
- REQ-103: `DynamicSidebar` renders nav links exclusively for the current user's role;
  cross-role links are never rendered.
- REQ-104: `src/router/AppRouter.tsx` is the single source of truth for all application
  paths.

Route table:

| Path | Component | Guard |
|---|---|---|
| `/` | `LandingPageRoute` | Public |
| `/login` | `LoginPage` | Public |
| `/register` | `EthioDirectRegistration` | Public |
| `/farmer/dashboard` | `FarmerDashboard` | Auth + FARMER |
| `/farmer/listings` | `FarmerListings` | Auth + FARMER |
| `/farmer/escrow` | `FarmerEscrowWallet` | Auth + FARMER |
| `/farmer/finance` | `FinancePortal` | Auth + FARMER |
| `/buyer/dashboard` | `BuyerDashboard` | Auth + BUYER, BUSINESS_BUYER |
| `/buyer/marketplace` | `MarketplaceView` | Auth + BUYER, BUSINESS_BUYER |
| `/buyer/requests` | `BuyRequestsPage` | Auth + BUYER, BUSINESS_BUYER |
| `/buyer/orders` | `BuyerOrders` | Auth + BUYER, BUSINESS_BUYER |
| `/buyer/escrow` | `BuyerEscrowManager` | Auth + BUYER, BUSINESS_BUYER |
| `/logistics/dashboard` | `LogisticsDashboard` | Auth + DRIVER, LOGISTICS_ADMIN |
| `/logistics/loadboard` | `LoadBoard` | Auth + DRIVER, LOGISTICS_ADMIN |
| `/logistics/trip` | `ActiveTrip` | Auth + DRIVER, LOGISTICS_ADMIN |
| `/logistics/earnings` | `FleetEarnings` | Auth + DRIVER, LOGISTICS_ADMIN |
| `/admin/*` | `AdminPortal` | Auth + PLATFORM_ADMIN |
| `*` | `NotFoundPage` | Public |

### 2. Landing Page

- REQ-201: The `/` route renders a hero section with headline
  "Ethiopia's First Verified B2B Agri-Escrow Marketplace", two CTAs:
  "Register Free" → `/register` and "Sign In" → `/login`.
- REQ-202: A "How It Works" button opens a modal playing an inline video with
  4-step animated captions: Harvest Listing → Escrow Lock → Fleet Transit → Verified Payout.
- REQ-203: A trust section displays badges for Telebirr, Chapa, CBE Birr, Supabase Auth
  and a stat bar showing verified farmer count, buyer count, on-time delivery rate.
- REQ-204: The landing page is mobile-first (375 px minimum), uses semantic HTML5,
  and meets WCAG 2.1 AA colour contrast.

### 3. Registration Wizard

- REQ-301: Step 1 shows role selection cards: Farmer/Producer, Commercial Buyer,
  Logistics Fleet.
- REQ-302: Step 2 collects full name, email, password (min 6 chars), phone (+251 prefix),
  and a 6-digit OTP. Calls `signUpWithSupabase` from `src/lib/supabase.ts`.
- REQ-303: Step 3 renders role-specific KYB fields.
  Farmer: Farm Name, Farm Size (ha), Region, Zone, Woreda, Primary Crops,
  National ID, Bank Name, Bank Account.
  Buyer: Company Name, Buyer Type, TIN, Region, Delivery Address.
  Logistics: Vehicle Type, License Plate, Driver License Number, Operating Region.
- REQ-304: Submit chain must execute in order:
  1. `signUpWithSupabase` (Supabase Auth account + verification email)
  2. `POST /api/auth/register` (local DB user row)
  3. `POST /api/auth/supabase-sync` (link UID)
  4. `POST /api/farms` (Farmer role only)
- REQ-305: Step 4 success screen shows name, role badge, user ID, Supabase UID,
  email verification notice, and a "Go to Dashboard" button using `useNavigate`.

### 4. Farmer Dashboard

- REQ-401: Market price ticker shows ETB/quintal for 5+ crops from
  `GET /api/ai/market-intelligence`, auto-refreshed every 60 seconds.
- REQ-402: "List a Harvest" form (name, category, quantity, grade, price ETB,
  harvest date) calls `POST /api/products`.
- REQ-403: Buyer Matchmaker feed shows latest 10 quote requests from `GET /api/quotes`.
- REQ-404: Escrow Wallet card shows locked, released, pending ETB from
  `GET /api/escrow/ledger`.
- REQ-405: AI Quality Scanner card accepts an image file upload, encodes to base64,
  posts to `POST /api/ai/scan-crop`, and displays grade, confidence, defects found,
  and recommendation.

### 5. Buyer Dashboard

- REQ-501: Marketplace feed shows active product listings from `GET /api/products`
  with search, category, grade, and region filters.
- REQ-502: "Post a Buy Request" form calls `POST /api/quotes`.
- REQ-503: Live logistics tracker polls `GET /api/logistics/deliveries` every 30 seconds
  and shows status badge, driver name, estimated arrival per order.
- REQ-504: Escrow Manager table shows all escrow rows from `GET /api/escrow/ledger`.
  Per row: status badge, amounts, Chapa tx ref, and a "Confirm Delivery & Release Funds"
  button that calls `POST /api/escrow/confirm-delivery` then `POST /api/escrow/release`.

### 6. Logistics Dashboard

- REQ-601: Load Board shows available shipping jobs from `GET /api/logistics/deliveries`.
- REQ-602: Active Trip Manager shows one active delivery with sequential status buttons:
  "Arrived at Pickup", "Loaded & Departed", "Delivered". Each button calls
  `PATCH /api/logistics/deliveries/:id/status` with the corresponding status string.
- REQ-603: IoT Weight display shows the latest cargo weight from
  `GET /api/iot/weight-log/:orderId` (proxied to Flask sidecar).
- REQ-604: Fleet Earnings page shows completed delivery totals in ETB.

### 7. Flask AI Sidecar

- REQ-701: A Python Flask service in `flask_ai/app.py` runs on port 5001.
  Start command: `python flask_ai/app.py`.
- REQ-702: `POST /api/ai/scan-crop` accepts `{ image_base64, crop_name, region }` and
  returns `{ grade, confidence_score, defects_detected, colour_profile, recommendation }`.
  Uses OpenCV HSV colour analysis and contour-based defect detection.
- REQ-703: `POST /api/iot/weight-log` accepts `{ device_id, cargo_weight_kg, order_id,
  timestamp }`, validates payload, inserts into Supabase `iot_weight_logs` table,
  returns `{ success, receipt_id, signed_at }`.
- REQ-704: `GET /api/iot/weight-log/<order_id>` returns the latest weight log for an order.
- REQ-705: `server.ts` proxies `POST /api/ai/scan-crop` and `ALL /api/iot/*` to the Flask
  sidecar with a 503 fallback if the sidecar is unreachable.

### 8. Dynamic Sidebar

- REQ-801: `SIDEBAR_CONFIG` constant maps every `UserRole` to `{ label, icon, path }[]`.
  `DynamicSidebar.tsx` renders only the items for the active user's role.
- REQ-802: Sidebar displays user avatar, full name, role badge, and a Sign Out button
  calling `signOutSupabase`.
- REQ-803: Sidebar collapses to an icon-only rail on screens ≤ 768 px with a
  hamburger toggle.

### 9. Non-Functional Requirements

- REQ-NF-01: All new React components use TypeScript (`.tsx`).
- REQ-NF-02: No new npm packages are added without explicit approval.
- REQ-NF-03: Flask dependencies are pinned in `flask_ai/requirements.txt`.
- REQ-NF-04: All existing `server.ts` routes remain fully operational.
- REQ-NF-05: Authenticated dashboard routes load within 3 seconds on a 4G connection.
- REQ-NF-06: Tailwind classes use only the existing Slate and Emerald palette.

## Glossary

- **AuthGuard**: React Router layout route that redirects unauthenticated users to `/login`.
- **RoleGuard**: React Router layout route that redirects users to their own dashboard
  if they attempt to access a route outside their role.
- **DynamicSidebar**: Navigation sidebar rendering only role-appropriate links from
  `SIDEBAR_CONFIG`.
- **Flask Sidecar**: Python Flask microservice on port 5001 handling AI crop scanning
  and IoT weight logging.
- **Escrow**: Funds locked in Chapa/Telebirr pending verified delivery confirmation.
- **KYB**: Know Your Business — role-specific identity and business verification fields.
- **SIDEBAR_CONFIG**: TypeScript constant mapping `UserRole` to navigation item arrays.
- **OTP**: One-Time Password — 6-digit code used for phone verification in Step 2.
