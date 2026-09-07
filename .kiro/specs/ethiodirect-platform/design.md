# Design Document

## Overview

EthioDirect adds React Router DOM v6 navigation, role-isolated dashboards, a Python Flask
AI/IoT sidecar, and a DynamicSidebar to the existing AgriLink monorepo. The existing
Node.js Express backend, Supabase Postgres, Drizzle ORM, Chapa escrow routes, and all
26 existing React components are preserved. New components are additive.

## Architecture

### System Diagram

```
Browser (React 19 + Vite + React Router DOM v6)
  ├── Public routes: /, /login, /register
  ├── AuthGuard → RoleGuard → DashboardLayout → DynamicSidebar + <Outlet />
  │     ├── /farmer/*    FarmerDashboard, FarmerListings, FarmerEscrowWallet
  │     ├── /buyer/*     BuyerDashboard, MarketplaceView, BuyerEscrowManager
  │     └── /logistics/* LogisticsDashboard, LoadBoard, ActiveTrip
  │
  │  HTTP (same origin)
  ▼
Node.js Express server.ts (port 3000)
  ├── Existing: /api/auth/*, /api/products, /api/orders, /api/cart,
  │            /api/escrow/*, /api/ai/agri-advisor, /api/ussd
  ├── NEW PROXY: /api/ai/scan-crop  → Flask :5001
  └── NEW PROXY: /api/iot/*         → Flask :5001
        │
        ├── Drizzle ORM → PGlite (dev) / Supabase Postgres (prod)
        └── Supabase Auth (JWT)

Flask Sidecar flask_ai/app.py (port 5001)
  ├── POST /api/ai/scan-crop   crop_scanner.py (OpenCV)
  ├── POST /api/iot/weight-log iot_weight.py (Supabase insert)
  └── GET  /api/iot/weight-log/<order_id>
```

### File Layout (new files only)

```
project-main/
├── flask_ai/
│   ├── app.py
│   ├── requirements.txt
│   ├── README.md
│   └── services/
│       ├── crop_scanner.py
│       └── iot_weight.py
└── src/
    ├── guards/
    │   ├── AuthGuard.tsx
    │   └── RoleGuard.tsx
    ├── router/
    │   └── AppRouter.tsx
    ├── layouts/
    │   └── DashboardLayout.tsx
    └── components/
        ├── DynamicSidebar.tsx
        ├── LandingPageRoute.tsx
        ├── LoginPage.tsx
        ├── NotFoundPage.tsx
        ├── LoadingSpinner.tsx
        ├── FarmerDashboard.tsx
        ├── FarmerListings.tsx
        ├── FarmerEscrowWallet.tsx
        ├── BuyerDashboard.tsx
        ├── BuyRequestsPage.tsx
        ├── BuyerOrders.tsx
        ├── BuyerEscrowManager.tsx
        ├── LogisticsDashboard.tsx
        ├── LoadBoard.tsx
        ├── ActiveTrip.tsx
        └── FleetEarnings.tsx
```

## Components and Interfaces

### AuthGuard.tsx

```typescript
// Reads localStorage.agrilink_authenticated and Supabase session
// Shows LoadingSpinner while session check is in progress
// Renders <Outlet /> if authenticated, else <Navigate to="/login" replace />
interface AuthGuardProps {}  // no props — reads from context/storage
```

### RoleGuard.tsx

```typescript
interface RoleGuardProps {
  allowedRoles: UserRole[];
}
// Reads currentUser from /api/auth/current (cached 60s in sessionStorage)
// Renders <Outlet /> if currentUser.role in allowedRoles
// Else <Navigate to={`/${currentUser.role.toLowerCase()}/dashboard`} replace />
```

### DashboardLayout.tsx

```typescript
// Flex layout: <DynamicSidebar currentUser={...} /> + <main><Outlet /></main>
// Passes currentUser from context down to sidebar
```

### DynamicSidebar.tsx

```typescript
interface SidebarItem {
  label: string;
  icon: React.ElementType;  // lucide-react icon component
  path: string;
}

const SIDEBAR_CONFIG: Record<UserRole, SidebarItem[]> = {
  FARMER:           [ dashboard, listings, escrow, finance ],
  BUYER:            [ dashboard, marketplace, requests, orders, escrow ],
  BUSINESS_BUYER:   [ dashboard, marketplace, requests, orders, escrow ],
  DRIVER:           [ dashboard, loadboard, trip, earnings ],
  LOGISTICS_ADMIN:  [ dashboard, loadboard, trip, earnings ],
  PLATFORM_ADMIN:   [ admin dashboard, orders, payments, users ],
  INPUT_SUPPLIER:   [ dashboard, products ],
  FINANCIAL_INSTITUTION: [ dashboard, applications ],
  HUB_OPERATOR:     [ dashboard, logistics ],
};

interface DynamicSidebarProps {
  currentUser: User;
  onSignOut: () => void;
}
```

### FarmerDashboard.tsx

```typescript
// Sections rendered as cards in a responsive grid:
// 1. MarketPriceTicker — polls GET /api/ai/market-intelligence every 60s
// 2. ListHarvestForm — POST /api/products
// 3. BuyerMatchmakerFeed — GET /api/quotes (limit 10)
// 4. EscrowWalletCard — GET /api/escrow/ledger
// 5. AiQualityScannerCard — file input → base64 → POST /api/ai/scan-crop
```

### BuyerEscrowManager.tsx

```typescript
// Table from GET /api/escrow/ledger
// Per row action:
//   POST /api/escrow/confirm-delivery → then POST /api/escrow/release
// Shows loading state during both calls; shows success/error toast
```

### Flask crop_scanner.py

```python
def analyse_crop(image_base64: str, crop_name: str, region: str) -> dict:
    # 1. base64.b64decode → numpy uint8 array → cv2.imdecode
    # 2. cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    # 3. Compute mean HSV → classify colour_profile:
    #    Hue 35-85 → VIBRANT_GREEN
    #    Hue 15-35 → YELLOWING
    #    Hue 0-15 or 170-180 → BROWNING
    #    else → MIXED
    # 4. cv2.threshold + cv2.findContours → defect_count
    # 5. Grade mapping:
    #    defects 0-2 + VIBRANT_GREEN → PREMIUM (confidence 95)
    #    defects 3-5 + GREEN/YELLOW  → GRADE_A  (confidence 85)
    #    defects 6-10               → GRADE_B  (confidence 70)
    #    defects > 10               → PROCESSING_GRADE (confidence 60)
    # 6. Return dict
```

### Flask iot_weight.py

```python
def log_weight(device_id, cargo_weight_kg, order_id, timestamp) -> dict:
    # Validate: cargo_weight_kg > 0
    # receipt_id = sha256(f"{order_id}{timestamp}").hexdigest()[:16]
    # Supabase insert into iot_weight_logs
    # Return { success, receipt_id, signed_at }

def get_latest_weight(order_id: str) -> dict | None:
    # Supabase select latest row WHERE order_id = order_id
```

### Node.js Proxy (additions to server.ts)

```typescript
// Proxy to Flask sidecar with 503 fallback
app.post('/api/ai/scan-crop', async (req, res) => {
  try {
    const r = await fetch('http://localhost:5001/api/ai/scan-crop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(15000),
    });
    res.json(await r.json());
  } catch {
    res.status(503).json({ error: 'AI service unavailable. Start flask_ai/app.py.' });
  }
});

app.all('/api/iot/*', async (req, res) => {
  const flaskPath = req.path.replace('/api/iot', '/api/iot');
  try {
    const r = await fetch('http://localhost:5001' + flaskPath, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
      signal: AbortSignal.timeout(10000),
    });
    res.json(await r.json());
  } catch {
    res.status(503).json({ error: 'IoT service unavailable. Start flask_ai/app.py.' });
  }
});
```

## Data Models

### iot_weight_logs (new Supabase table)

```sql
CREATE TABLE IF NOT EXISTS public.iot_weight_logs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id      TEXT        NOT NULL,
  order_id       TEXT        NOT NULL,
  weight_kg      NUMERIC(10,3) NOT NULL CHECK (weight_kg > 0),
  receipt_id     TEXT        NOT NULL UNIQUE,
  logged_at      TIMESTAMPTZ NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.iot_weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON public.iot_weight_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
```

### Existing tables used (no schema changes)

- `users` — auth and profile
- `products` — harvest listings
- `orders` / `order_items` — purchase orders
- `escrow_ledger` — Chapa escrow state (pending/locked/released)
- `core_orders` — UUID-keyed orders for escrow workflow
- `logistics` — delivery tracking
- `quote_requests` — buyer RFQs

### SIDEBAR_CONFIG type

```typescript
type SidebarItem = { label: string; icon: React.ElementType; path: string };
type SidebarConfig = Record<UserRole, SidebarItem[]>;
```

## Error Handling

- AuthGuard shows `<LoadingSpinner />` for up to 3 seconds during session check.
  If check times out, redirects to `/login`.
- RoleGuard caches the user role in `sessionStorage` for 60 seconds to avoid
  repeated API calls on every route transition.
- Flask proxy routes return `{ error: "AI/IoT service unavailable" }` with HTTP 503
  if Flask is not running, ensuring the React UI can show a graceful error message.
- All dashboard data-fetch hooks use try/catch and display an inline error banner
  with a Retry button on failure.
- The BuyerEscrowManager disables the Release Funds button during in-flight requests
  to prevent double-submission.

## Testing Strategy

- TypeScript `npx tsc --noEmit` run after all new files are written.
- Each guard component is manually tested with three scenarios:
  logged-out user, correct-role user, wrong-role user.
- Flask sidecar tested with a sample base64-encoded crop JPEG via curl:
  `curl -X POST http://localhost:5001/api/ai/scan-crop -H "Content-Type: application/json"
  -d '{"image_base64":"...","crop_name":"Tomato","region":"Oromia"}'`
- IoT endpoint tested with:
  `curl -X POST http://localhost:5001/api/iot/weight-log -d '{"device_id":"DEV-01",
  "cargo_weight_kg":250,"order_id":"ORD-1","timestamp":"2026-01-01T00:00:00Z"}'`

## Correctness Properties

### Property 1: Role isolation enforced on client and server
**Validates: Requirements 1.2, 1.3**
A user must never see another role's dashboard data even if they manually navigate to a protected URL.
RoleGuard redirects immediately and API routes verify the session user's role before returning any data.

### Property 2: Escrow release gated on confirmed delivery
**Validates: Requirements 5.4**
The Release Funds action calls POST /api/escrow/confirm-delivery first; if that call fails the release
is not attempted. The button is disabled during in-flight requests to prevent double-submission.

### Property 3: Flask sidecar failures isolated from Express server
**Validates: Requirements 7.5**
Every Flask proxy call is wrapped in try/catch with AbortSignal.timeout(). A Flask crash returns
HTTP 503 to the React UI without crashing or affecting any other Express route.

### Property 4: Registration submit chain is sequential with visible error reporting
**Validates: Requirements 3.4, 3.5**
The four submit steps run in order: signUpWithSupabase, POST /api/auth/register,
POST /api/auth/supabase-sync, POST /api/farms. Failure at any step sets submitError state
with a clear message so the user knows exactly what succeeded and what failed.

