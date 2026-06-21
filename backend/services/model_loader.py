import os
import joblib

# Global variable to cache the loaded model
_model = None

def get_model_path():
    # Try multiple potential paths to locate the model robustly
    candidates = [
        # Relative to backend/
        os.path.join(os.path.dirname(__file__), "..", "model", "aquasentinel_forecast_model.pkl"),
        # Relative to root/
        os.path.join("model", "aquasentinel_forecast_model.pkl"),
        # Absolute path in user workspace
        r"d:\Side Projects\hackathon-projects\aquasentinel\model\aquasentinel_forecast_model.pkl"
    ]
    for path in candidates:
        if os.path.exists(path):
            return os.path.abspath(path)
    # Default fallback
    return candidates[0]

def load_model():
    global _model
    if _model is None:
        model_path = get_model_path()
        print(f"Loading model from: {model_path}")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
        _model = joblib.load(model_path)
    return _model

def predict(features_df):
    """
    Exposes a standardized predict method.
    Accepts a pandas DataFrame containing features.
    """
    model = load_model()
    return model.predict(features_df)
