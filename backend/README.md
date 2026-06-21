# AquaSentinel Indore — Backend Service

This is the Flask backend service for the **AquaSentinel Water Crisis Early Warning System**. It handles machine learning model unpickling, feature preprocessing, risk score calculations, and prioritized municipal recommendations.

## Core Features
1. **Model Loader Service**: Safely unpickles and retains the trained Linear Regression model (`aquasentinel_forecast_model.pkl`) at startup.
2. **Forecast Service**: Standardizes incoming target parameters into a pandas DataFrame matching the ML training structure (specific column order and types) to calculate water levels.
3. **Aquifer Risk Engine**: Calculates a composite aquifer stress score based on a weighted formula:
   $$\text{Stress Score} = (\text{Water Level} \times 40\%) + (\text{Block Average Depth} \times 30\%) + (\text{Aquifer Score} \times 20\%) + (\text{Season Score} \times 10\%)$$
   Categorizes the final score into standard municipal risk levels: `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`.
4. **Intervention Engine**: Generates context-aware, prioritized policy/infrastructure actions categorized by type (e.g., Recharge, Monitoring, Demand).

---

## API Endpoints

### 1. Health Probe
- **Path**: `GET /health`
- **Response**:
  ```json
  { "status": "ok" }
  ```

### 2. Predict Forecast
- **Path**: `POST /predict` (also supports `POST /api/predict`)
- **Headers**: `Content-Type: application/json`
- **Request Body Parameters**:
  - `block` (string): e.g. `"Depalpur"`, `"Sanwer"`, `"Indore"`, `"Mhow"`
  - `well_type` (string): e.g. `"Bore Well"`, `"Dug Well"`
  - `aquifer` (string): e.g. `"Semi-Confined"`, `"Unconfined"`, `"Confined"`
  - `season_order` (integer): `1` (Pre-Monsoon), `2` (Monsoon), `3` (Post-Monsoon), `4` (Recession)
  - `current_water_level` (float): Target depth in feet
  - `block_avg_depth` (float): Base depth in meters
  - `block_risk_score` (float): Regional baseline score
- **Response Payload**:
  ```json
  {
    "predicted_water_level": 18.5,
    "risk_score": 72.0,
    "risk_level": "HIGH",
    "recommendations": [
      "Construct recharge pits in high-risk wards",
      "Reduce groundwater extraction by 10%"
    ]
  }
  ```

---

## Setup & Development

### Prerequisites
Make sure you have Python 3.9+ and `pip` installed.

### 1. Create a Virtual Environment (Recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
Installs required packages, including pinned ML dependencies:
```bash
pip install -r requirements.txt
```

### 3. Run the Development Server
Starts the Flask server on port `8000`:
```bash
python app.py
```
The endpoints will be live at **`http://localhost:8000/`**.
