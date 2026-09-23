# EthioDirect Flask AI & IoT Sidecar

Autonomous Python microservice running alongside AgriLink on port 5001. Provides computer vision crop quality grading and IoT transit cargo scale telemetry.

---

## Capabilities

1. **AI Crop Diagnostics (`POST /api/ai/scan-crop`)**:
   - OpenCV HSV colour-space evaluation (`VIBRANT_GREEN`, `YELLOWING`, `BROWNING`, `MIXED`).
   - Gaussian blur, adaptive thresholding, and contour defect/blemish counting.
   - Automated grade classification: `PREMIUM` (95%), `GRADE_A` (85%), `GRADE_B` (70%), `PROCESSING_GRADE` (60%).
   - Actionable recommendations tailored to Ethiopian agricultural commodities (Teff, Coffee, Chickpeas, Wheat, Avocado).

2. **Verifiable IoT Weight Ledger (`POST /api/iot/weight-log`, `GET /api/iot/weight-log/<order_id>`)**:
   - Validates live truck/scale weight measurements.
   - Generates SHA-256 cryptographic receipt hashes (`ETH-IOT-...`).
   - Inserts into Supabase `iot_weight_logs` table (with in-memory fallback for offline dev).

---

## Installation & Setup

### 1. Create a Python Virtual Environment

```bash
cd flask_ai
python -m venv venv

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Linux / macOS
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration (Optional)

Create a `.env` in `flask_ai/` or use the project root `.env`:

```env
FLASK_PORT=5001
SUPABASE_URL=https://your-supabase-instance.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run the Service

```bash
python app.py
```

The service will listen on `http://localhost:5001`. Express proxies incoming `/api/ai/scan-crop` and `/api/iot/*` calls directly to this service.

---

## Verification & Testing

### Test 1: Health Check
```bash
curl http://localhost:5001/health
```

### Test 2: AI Crop Scanner
```bash
curl -X POST http://localhost:5001/api/ai/scan-crop \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "crop_name": "Magna White Teff",
    "region": "Bishoftu, Oromia"
  }'
```

### Test 3: Log IoT Cargo Weight
```bash
curl -X POST http://localhost:5001/api/iot/weight-log \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "SCALE-ET-042",
    "cargo_weight_kg": 4500.5,
    "order_id": "AGR-2026-09-1001",
    "timestamp": "2026-09-21T12:00:00Z"
  }'
```

### Test 4: Retrieve Latest IoT Cargo Weight
```bash
curl http://localhost:5001/api/iot/weight-log/AGR-2026-09-1001
```
