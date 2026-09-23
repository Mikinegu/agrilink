import os
import sys
from pathlib import Path

# Add project root to sys.path so services can be imported cleanly
sys.path.insert(0, str(Path(__file__).resolve().parent))

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load local environment if present
load_dotenv()

from services.crop_scanner import analyse_crop
from services.iot_weight import log_weight, get_latest_weight

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "EthioDirect AI & IoT Sidecar",
        "port": 5001,
        "opencv_available": True
    }), 200


@app.route("/api/ai/scan-crop", methods=["POST"])
def scan_crop_endpoint():
    try:
        data = request.get_json(force=True, silent=True) or {}
        image_base64 = data.get("image_base64")
        crop_name = data.get("crop_name", "Agricultural Crop")
        region = data.get("region", "Ethiopia")

        if not image_base64:
            return jsonify({
                "error": "image_base64 payload is required"
            }), 400

        result = analyse_crop(image_base64, crop_name=crop_name, region=region)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "error": "Failed to analyse crop image",
            "details": str(e)
        }), 500


@app.route("/api/iot/weight-log", methods=["POST"])
def log_weight_endpoint():
    try:
        data = request.get_json(force=True, silent=True) or {}
        device_id = data.get("device_id")
        cargo_weight_kg = data.get("cargo_weight_kg")
        order_id = data.get("order_id")
        timestamp = data.get("timestamp")

        if cargo_weight_kg is None or not device_id or not order_id:
            return jsonify({
                "error": "device_id, cargo_weight_kg, and order_id are required"
            }), 400

        result = log_weight(
            device_id=device_id,
            cargo_weight_kg=cargo_weight_kg,
            order_id=order_id,
            timestamp=timestamp
        )

        if not result.get("success"):
            return jsonify(result), 400

        return jsonify(result), 201
    except Exception as e:
        return jsonify({
            "error": "Failed to log IoT cargo weight",
            "details": str(e)
        }), 500


@app.route("/api/iot/weight-log/<order_id>", methods=["GET"])
def get_weight_endpoint(order_id):
    try:
        record = get_latest_weight(order_id)
        if not record:
            return jsonify({
                "error": f"No IoT weight measurements found for order {order_id}"
            }), 404
        return jsonify(record), 200
    except Exception as e:
        return jsonify({
            "error": "Failed to fetch IoT weight record",
            "details": str(e)
        }), 500


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5001))
    print(f"[*] Starting EthioDirect AI/IoT sidecar on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
