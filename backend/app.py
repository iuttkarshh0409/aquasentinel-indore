from flask import Flask, request, jsonify
from flask_cors import CORS
from services import forecast_service, risk_engine, recommendation_engine, model_loader

app = Flask(__name__)
# Enable CORS for all domains to prevent cross-origin blockages during the hackathon
CORS(app)

# Pre-load model at startup
try:
    model_loader.load_model()
    print("Model pre-loaded successfully.")
except Exception as e:
    print(f"Warning: Failed to load model at startup: {e}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/predict', methods=['POST'])
@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing required field"}), 400
        
    required_fields = [
        "block",
        "well_type",
        "aquifer",
        "season_order",
        "current_water_level",
        "block_avg_depth",
        "block_risk_score"
    ]
    
    # Check if any field is missing
    for field in required_fields:
        if field not in data or data[field] is None:
            return jsonify({"error": "Missing required field"}), 400
            
    # Extract values
    try:
        block = data["block"]
        well_type = data["well_type"]
        aquifer = data["aquifer"]
        season_order = int(data["season_order"])
        current_water_level = float(data["current_water_level"])
        block_avg_depth = float(data["block_avg_depth"])
        block_risk_score = float(data["block_risk_score"])
    except (ValueError, TypeError) as e:
        return jsonify({"error": "Invalid field format or value"}), 400

    # Get ML prediction
    try:
        predicted_water_level = forecast_service.get_forecast(
            block=block,
            well_type=well_type,
            aquifer=aquifer,
            season_order=season_order,
            current_water_level=current_water_level,
            block_avg_depth=block_avg_depth,
            block_risk_score=block_risk_score
        )
    except Exception as e:
        return jsonify({"error": f"Model prediction failed: {str(e)}"}), 500

    # Calculate risk score and level
    risk_score, risk_level = risk_engine.evaluate_risk(
        predicted_water_level=predicted_water_level,
        block=block,
        aquifer=aquifer,
        season_order=season_order
    )

    # Generate recommendations
    recs = recommendation_engine.generate_recommendations(
        risk_level=risk_level,
        risk_score=risk_score,
        aquifer=aquifer,
        block=block
    )

    # Return standardized JSON response
    response_payload = {
        "predicted_water_level": predicted_water_level,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "recommendations": recs
    }

    return jsonify(response_payload)

if __name__ == '__main__':
    # Run server on port 8000 (per REST API Spec Dev Base URL http://localhost:8000/api)
    # Also support port 5000 in fallback instructions, but let's default to port 8000 as per Frontend Integration Guide's http://localhost:8000/api
    app.run(host='0.0.0.0', port=8000, debug=True)
