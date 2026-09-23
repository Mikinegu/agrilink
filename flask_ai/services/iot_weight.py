import datetime
import hashlib
import os
from typing import Optional, Dict, Any

# In-memory storage fallback for local development or when Supabase is offline
_in_memory_weight_logs: Dict[str, list] = {}

_supabase_client = None

def get_supabase_client():
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

    if supabase_url and supabase_key:
        try:
            from supabase import create_client
            _supabase_client = create_client(supabase_url, supabase_key)
            return _supabase_client
        except Exception as e:
            print(f"[IoT] Warning: Could not initialize Supabase client: {e}")
            return None
    return None


def log_weight(device_id: str, cargo_weight_kg: float, order_id: str, timestamp: Optional[str] = None) -> dict:
    """
    Validates IoT cargo weight, generates an immutable cryptographic receipt,
    and inserts the record into Supabase iot_weight_logs (or in-memory cache).
    """
    try:
        weight = float(cargo_weight_kg)
        if weight <= 0:
            return {"success": False, "error": "cargo_weight_kg must be greater than zero"}
    except (TypeError, ValueError):
        return {"success": False, "error": "Invalid cargo_weight_kg value"}

    if not device_id or not order_id:
        return {"success": False, "error": "device_id and order_id are required fields"}

    logged_at = timestamp or datetime.datetime.now(datetime.timezone.utc).isoformat()
    # Generate cryptographic receipt signature
    raw_sig = f"{order_id}:{device_id}:{weight}:{logged_at}"
    receipt_id = "ETH-IOT-" + hashlib.sha256(raw_sig.encode("utf-8")).hexdigest()[:16].upper()

    log_entry = {
        "device_id": str(device_id),
        "order_id": str(order_id),
        "weight_kg": weight,
        "receipt_id": receipt_id,
        "logged_at": logged_at,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    # Store in in-memory fallback
    if order_id not in _in_memory_weight_logs:
        _in_memory_weight_logs[order_id] = []
    _in_memory_weight_logs[order_id].append(log_entry)

    # Attempt Supabase insert if client configured
    sb = get_supabase_client()
    if sb:
        try:
            res = sb.table("iot_weight_logs").insert(log_entry).execute()
            if res.data:
                return {
                    "success": True,
                    "receipt_id": receipt_id,
                    "signed_at": logged_at,
                    "data": res.data[0]
                }
        except Exception as e:
            print(f"[IoT] Supabase insert warning: {e}. Persisted to sidecar memory.")

    return {
        "success": True,
        "receipt_id": receipt_id,
        "signed_at": logged_at,
        "data": log_entry
    }


def get_latest_weight(order_id: str) -> Optional[dict]:
    """
    Retrieves the most recent verified IoT weight log for a given order ID.
    """
    if not order_id:
        return None

    # Check Supabase first
    sb = get_supabase_client()
    if sb:
        try:
            res = sb.table("iot_weight_logs") \
                .select("*") \
                .eq("order_id", order_id) \
                .order("logged_at", desc=True) \
                .limit(1) \
                .execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"[IoT] Supabase query warning: {e}. Checking in-memory store.")

    # Fallback to in-memory store
    logs = _in_memory_weight_logs.get(order_id, [])
    if logs:
        # Sort by logged_at descending
        sorted_logs = sorted(logs, key=lambda x: x.get("logged_at", ""), reverse=True)
        return sorted_logs[0]

    return None
