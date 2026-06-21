def generate_recommendations(risk_level, risk_score, aquifer, block):
    """
    Generates a prioritized list of recommendations based on:
    1. Risk severity
    2. Aquifer type
    3. Block location
    """
    recs = []
    
    # 1. Risk-based recommendations
    if risk_level == "Low":
        recs.extend([
            "Routine monitoring",
            "Infrastructure maintenance",
            "Annual assessments"
        ])
    elif risk_level == "Moderate":
        recs.extend([
            "Increase monitoring frequency",
            "Promote household rainwater harvesting",
            "Seasonal reviews"
        ])
    elif risk_level == "High":
        recs.extend([
            "Construct recharge pits",
            "Expand harvesting systems",
            "Reduce groundwater extraction by 10%",
            "Identify new recharge zones"
        ])
    elif risk_level == "Critical":
        recs.extend([
            "Immediate interventions",
            "Restrict non-essential extraction",
            "Weekly monitoring",
            "Emergency conservation campaigns"
        ])

    # 2. Aquifer-specific recommendations
    aquifer_clean = str(aquifer).strip().lower()
    if aquifer_clean == "unconfined":
        recs.append("Surface recharge structures and stormwater infiltration")
    elif aquifer_clean == "semi-confined":
        recs.append("Managed aquifer recharge and borewell recharge")
    elif aquifer_clean == "confined":
        recs.append("Strict extraction management and zone protection")

    # 3. Block-specific recommendations
    block_clean = str(block).strip().lower()
    if block_clean == "depalpur":
        recs.append("Recharge pit construction and extraction reduction programs (Depalpur focus)")
    elif block_clean == "sanwer":
        recs.append("Managed aquifer recharge and agricultural efficiency (Sanwer focus)")
    elif block_clean == "indore":
        recs.append("Urban recharge structures and monitoring expansion (Indore focus)")
    elif block_clean == "mhow":
        recs.append("Preventive conservation and community awareness (Mhow focus)")

    # Return unique recommendations while preserving ordering
    seen = set()
    unique_recs = []
    for r in recs:
        if r not in seen:
            seen.add(r)
            unique_recs.append(r)
            
    return unique_recs
