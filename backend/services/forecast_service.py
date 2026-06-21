import pandas as pd
from services import model_loader

def get_forecast(block, well_type, aquifer, season_order, current_water_level, block_avg_depth, block_risk_score):
    """
    Ingests environmental features and executes prediction.
    """
    # Create the DataFrame with the exact columns and types expected by the pipeline
    features_dict = {
        "block": [str(block)],
        "well_type": [str(well_type)],
        "aquifer": [str(aquifer)],
        "season_order": [int(season_order)],
        "current_water_level": [float(current_water_level)],
        "block_avg_depth": [float(block_avg_depth)],
        "block_risk_score": [float(block_risk_score)]
    }
    
    features_df = pd.DataFrame(features_dict)
    
    # Run the model pipeline's prediction
    predictions = model_loader.predict(features_df)
    
    # The output is a list/numpy array of float predictions
    predicted_val = float(predictions[0])
    
    # Return as rounded to 2 decimal places to match guide examples
    return round(predicted_val, 2)
