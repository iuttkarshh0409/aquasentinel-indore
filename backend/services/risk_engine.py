def calculate_forecast_risk(predicted_level):
    """
    Factor 1: Forecasted Groundwater Level (Weight: 40%)
    < 5      => 20
    5 – 10   => 40
    10 – 15  => 60
    15 – 20  => 80
    > 20     => 100
    """
    if predicted_level < 5:
        return 20
    elif predicted_level <= 10:
        return 40
    elif predicted_level <= 15:
        return 60
    elif predicted_level <= 20:
        return 80
    else:
        return 100

def get_block_risk(block_name):
    """
    Factor 2: Block-Level Groundwater Stress (Weight: 30%)
    """
    block_map = {
        "depalpur": 61.4,
        "sanwer": 59.3,
        "indore": 48.3,
        "mhow": 47.4
    }
    return block_map.get(str(block_name).lower(), 50.0)

def get_aquifer_risk(aquifer_type):
    """
    Factor 3: Aquifer Vulnerability (Weight: 20%)
    """
    aquifer_map = {
        "unconfined": 40,
        "semi-confined": 70,
        "confined": 85
    }
    return aquifer_map.get(str(aquifer_type).lower(), 50)

def get_seasonal_risk(season_order):
    """
    Factor 4: Seasonal Vulnerability (Weight: 10%)
    season_order mapping:
    1 => Pre-Monsoon (May)      => 80
    2 => Monsoon (August)        => 20
    3 => Post-Monsoon (November) => 40
    4 => Recession (January)     => 60
    """
    try:
        order = int(season_order)
    except (ValueError, TypeError):
        order = 1
        
    seasonal_map = {
        1: 80,  # Pre-Monsoon
        2: 20,  # Monsoon
        3: 40,  # Post-Monsoon
        4: 60   # Recession
    }
    return seasonal_map.get(order, 50)

def evaluate_risk(predicted_water_level, block, aquifer, season_order):
    """
    Calculates composite risk score and returns category.
    """
    forecast_risk = calculate_forecast_risk(predicted_water_level)
    block_risk = get_block_risk(block)
    aquifer_risk = get_aquifer_risk(aquifer)
    seasonal_risk = get_seasonal_risk(season_order)
    
    composite_score = (
        (0.40 * forecast_risk) +
        (0.30 * block_risk) +
        (0.20 * aquifer_risk) +
        (0.10 * seasonal_risk)
    )
    
    # Round to nearest integer as per standard spec examples
    final_score = int(round(composite_score))
    
    # Classify severity
    if final_score <= 25:
        risk_level = "Low"
    elif final_score <= 50:
        risk_level = "Moderate"
    elif final_score <= 75:
        risk_level = "High"
    else:
        risk_level = "Critical"
        
    return final_score, risk_level
