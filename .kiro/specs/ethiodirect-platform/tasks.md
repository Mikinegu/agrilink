# Implementation Plan: EthioDirect Platform Extension

## Overview

Adds React Router navigation, role guards, role-isolated dashboards, DynamicSidebar,
Flask AI/IoT sidecar, and Node.js proxy routes to the existing AgriLink monorepo.
All 26 existing components and all server.ts routes are preserved.

## Tasks

- [ ] 1. Create AuthGuard, RoleGuard, and LoadingSpinner
  - Create src/guards/AuthGuard.tsx: read localStorage and supabase.auth.getUser(); show LoadingSpinner while resolving; return Outlet if authenticated else Navigate to /login
  - Create src/guards/RoleGuard.tsx: accept allowedRoles prop; fetch /api/auth/current cached 60s in sessionStorage; return Outlet if role matches else Navigate to role dashboard
  - Create src/components/LoadingSpinner.tsx: centered emerald animated spinner with optional label prop
  - _Requirements: REQ-101, REQ-102_

- [ ] 2. Create DynamicSidebar and DashboardLayout
  - Create src/components/DynamicSidebar.tsx: define SIDEBAR_CONFIG mapping all UserRole values to SidebarItem arrays; use NavLink with active styles; show avatar, name, role badge, Sign Out button; collapse to icon rail on <=768px with hamburger toggle
  - Create src/layouts/DashboardLayout.tsx: flex row layout with DynamicSidebar plus main Outlet; pass currentUser and onSignOut from context
  - _Requirements: REQ-801, REQ-802, REQ-803_

- [ ] 3. Create AppRouter and update App.tsx
  - Create src/router/AppRouter.tsx: full route tree per REQ-104 using AuthGuard, RoleGuard, DashboardLayout, lazy-loaded page components, and NotFoundPage fallback
  - Update src/App.tsx: wrap in BrowserRouter; render AppRouter; lift modal state into AppContext so routed pages can trigger cart, payment, and notification modals
  - _Requirements: REQ-103, REQ-104_

- [ ] 4. Create LandingPageRoute, LoginPage, and NotFoundPage
  - Create src/components/LandingPageRoute.tsx: hero section with hero.mp4 video, headline, Link CTAs to /register and /login; How It Works modal with 4-step captions; trust badges; stat bar
  - Create src/components/LoginPage.tsx: full-page AuthModal content; on success navigate to role dashboard via useNavigate
  - Create src/components/NotFoundPage.tsx: 404 message with Link back to /
  - _Requirements: REQ-201, REQ-202, REQ-203, REQ-204_

- [ ] 5. Update EthioDirectRegistration for router integration
  - Import useNavigate from react-router-dom
  - On Step 4 Go to Dashboard button call navigate() to /<role>/dashboard mapping producer->farmer, buyer->buyer, logistics->logistics
  - Verify signUpWithSupabase is called as first step of handleSubmit chain (already in place)
  - _Requirements: REQ-301, REQ-302, REQ-303, REQ-304, REQ-305_

- [ ] 6. Create Farmer Dashboard pages
  - Create src/components/FarmerDashboard.tsx: MarketPriceTicker polling GET /api/ai/market-intelligence every 60s; ListHarvestForm to POST /api/products; BuyerMatchmakerFeed from GET /api/quotes; EscrowWalletCard from GET /api/escrow/ledger; AiQualityScannerCard with file-to-base64 to POST /api/ai/scan-crop
  - Create src/components/FarmerListings.tsx: product table with inline price/qty edit via PATCH /api/products/:id; archive via DELETE /api/products/:id
  - Create src/components/FarmerEscrowWallet.tsx: full ledger table from GET /api/escrow/ledger with colour-coded status badges
  - _Requirements: REQ-401, REQ-402, REQ-403, REQ-404, REQ-405_

- [ ] 7. Create Buyer Dashboard pages
  - Create src/components/BuyerDashboard.tsx: summary stats (active orders, locked escrow ETB, pending quotes); quick-action links; recent activity feed
  - Create src/components/BuyRequestsPage.tsx: Post a Buy Request form to POST /api/quotes; table of own quotes
  - Create src/components/BuyerOrders.tsx: orders list from GET /api/orders with expandable rows
  - Create src/components/BuyerEscrowManager.tsx: escrow table; Confirm Delivery and Release Funds button calling POST /api/escrow/confirm-delivery then POST /api/escrow/release; disable during in-flight requests
  - _Requirements: REQ-501, REQ-502, REQ-503, REQ-504_

- [ ] 8. Create Logistics Dashboard pages
  - Create src/components/LogisticsDashboard.tsx: summary cards for active trips, completed count, earnings ETB
  - Create src/components/LoadBoard.tsx: delivery cards from GET /api/logistics/deliveries; Accept Job button via PATCH /api/logistics/deliveries/:id/status
  - Create src/components/ActiveTrip.tsx: active delivery with sequential Arrived/Loaded/Delivered buttons; IoT weight display from GET /api/iot/weight-log/:orderId
  - Create src/components/FleetEarnings.tsx: completed deliveries with ETB totals
  - _Requirements: REQ-601, REQ-602, REQ-603, REQ-604_

- [ ] 9. Create Flask AI sidecar service
  - Create flask_ai/requirements.txt: flask==3.1.1, flask-cors==5.0.1, opencv-python-headless==4.11.0.86, numpy==2.2.6, Pillow==11.2.1, supabase==2.15.1, python-dotenv==1.1.0
  - Create flask_ai/services/crop_scanner.py: analyse_crop() using OpenCV HSV analysis and contour defect detection returning grade, confidence_score, defects_detected, colour_profile, recommendation
  - Create flask_ai/services/iot_weight.py: log_weight() inserting to Supabase iot_weight_logs; get_latest_weight() selecting latest row by order_id
  - Create flask_ai/app.py: Flask with CORS; POST /api/ai/scan-crop; POST and GET /api/iot/weight-log routes; run on port 5001
  - Create flask_ai/README.md: setup, run, and env var instructions
  - _Requirements: REQ-701, REQ-702, REQ-703, REQ-704, REQ-705_

- [ ] 10. Add Node.js proxy routes to server.ts
  - Add POST /api/ai/scan-crop proxy to http://localhost:5001 with 15s timeout and 503 fallback message
  - Add ALL /api/iot/* proxy to http://localhost:5001 with 10s timeout and 503 fallback message
  - Insert both proxy routes before the startServer() call in server.ts
  - _Requirements: REQ-705_

- [ ] 11. Create Supabase IoT weight logs migration
  - Create supabase/migrations/20260902000000_iot_weight_logs.sql
  - Table iot_weight_logs: id UUID PK, device_id TEXT, order_id TEXT, weight_kg NUMERIC(10,3) CHECK > 0, receipt_id TEXT UNIQUE, logged_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()
  - Enable RLS and add service_role_only policy for ALL operations
  - _Requirements: REQ-703_

- [ ] 12. TypeScript verification and integration smoke test
  - Run npx tsc --noEmit and fix all resulting type errors
  - Verify SIDEBAR_CONFIG has an entry for every UserRole in src/types/index.ts
  - Verify all 26 existing components still compile without errors
  - _Requirements: REQ-NF-01, REQ-NF-04_

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": [1, 9, 11], "description": "Foundation — no dependencies" },
    { "wave": 2, "tasks": [2, 10],    "description": "Sidebar and proxy — depend on wave 1" },
    { "wave": 3, "tasks": [3],         "description": "AppRouter — depends on sidebar" },
    { "wave": 4, "tasks": [4, 5, 7],  "description": "Landing, registration, buyer pages — depend on router" },
    { "wave": 5, "tasks": [6, 8],     "description": "Farmer and logistics pages — depend on router and proxy" },
    { "wave": 6, "tasks": [12],        "description": "TypeScript verification — depends on all previous" }
  ]
}
```

## Notes

- Verify react-router-dom with: npm ls react-router-dom
- New components go in src/components/. Guards in src/guards/, router in src/router/, layout in src/layouts/.
- App.tsx modal state must be lifted into AppContext for routed pages.
- Flask sidecar is optional — all proxy routes return 503 gracefully when Flask is not running.
