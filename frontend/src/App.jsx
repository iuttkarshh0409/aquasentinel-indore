import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  ShieldAlert, 
  Award, 
  TrendingUp, 
  RefreshCw, 
  MapPin, 
  Compass,
  Users,
  Hourglass,
  Heart
} from "lucide-react";
import L from "leaflet";
import Card from "./components/Card";

// ====================================================================
// INTERACTIVE GIS MAP COMPONENT (React Leaflet Wrapper)
// ====================================================================
function InteractiveMap({ activeBlock, onBlockSelect, simulatedRiskLevel, riskScore }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circlesRef = useRef({});

  // Geofenced Block Coordinates representing regional aquifers
  const blocksConfig = [
    { name: "Depalpur", coords: [22.8456, 75.5401], baseRadius: 6200 },
    { name: "Sanwer", coords: [22.9754, 75.8117], baseRadius: 5800 },
    { name: "Indore", coords: [22.7196, 75.8577], baseRadius: 5200 },
    { name: "Mhow", coords: [22.5519, 75.7536], baseRadius: 5400 },
  ];

  // Utility to calculate styles based on block status and active threats
  const getBlockStyle = (blockName, isActive) => {
    let fillColor;
    let borderColor;
    
    // Default static risk profile for background mapping
    let risk = "LOW";
    if (blockName === "Depalpur" || blockName === "Sanwer") {
      risk = "HIGH";
    } else if (blockName === "Indore") {
      risk = "MEDIUM";
    }

    // Override active block with the live computed simulated risk level
    const targetRisk = isActive ? simulatedRiskLevel : risk;

    if (targetRisk === "CRITICAL" || targetRisk === "HIGH") {
      fillColor = "#f43f5e"; // Vibrant Rose
      borderColor = "#be123c"; // Crimson Border
    } else if (targetRisk === "MEDIUM") {
      fillColor = "#f59e0b"; // Rich Amber
      borderColor = "#b45309"; // Dark Amber Border
    } else {
      fillColor = "#10b981"; // Vibrant Emerald
      borderColor = "#047857"; // Dark Emerald Border
    }

    return {
      fillColor,
      color: isActive ? "#0284c7" : borderColor,
      weight: isActive ? 3 : 1.5,
      fillOpacity: isActive ? 0.75 : 0.45,
    };
  };

  // Initialize Map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current, {
        center: [22.78, 75.74],
        zoom: 9.5,
        zoomControl: false,
        attributionControl: false,
      });

      // Richer, high-contrast OSM Hot map tiles (features warm/vibrant colors)
      L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        maxZoom: 19,
        className: "map-tiles"
      }).addTo(map);

      mapInstanceRef.current = map;

      // Draw Interactive Aquifer Zones
      blocksConfig.forEach((blk) => {
        const initialStyle = getBlockStyle(blk.name, activeBlock === blk.name);
        const circle = L.circle(blk.coords, {
          radius: blk.baseRadius,
          ...initialStyle
        }).addTo(map);

        // Click Handler
        circle.on("click", () => {
          onBlockSelect(blk.name);
        });

        // Hover Animations
        circle.on("mouseover", () => {
          circle.setStyle({ fillOpacity: 0.85, weight: 3, color: "#0284c7" });
        });
        circle.on("mouseout", () => {
          const updatedStyle = getBlockStyle(blk.name, activeBlock === blk.name);
          circle.setStyle(updatedStyle);
        });

        // Tooltip
        circle.bindTooltip(`<b>${blk.name} Block</b><br/>Click to target zone`, {
          direction: "top",
          permanent: false,
          opacity: 0.95,
        });

        circlesRef.current[blk.name] = circle;
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Synchronize state updates (Dynamic coloring & focus highlights)
  useEffect(() => {
    if (mapInstanceRef.current) {
      blocksConfig.forEach((blk) => {
        const circle = circlesRef.current[blk.name];
        if (circle) {
          const isActive = activeBlock === blk.name;
          const updatedStyle = getBlockStyle(blk.name, isActive);
          circle.setStyle(updatedStyle);

          if (isActive) {
            circle.openTooltip();
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBlock, simulatedRiskLevel, riskScore]);

  return (
    <div className="w-full h-72 rounded border border-slate-200/80 overflow-hidden relative shadow-inner z-0">
      <div ref={mapRef} className="w-full h-full bg-slate-100" />
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded px-2.5 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider shadow-sm z-[1000] pointer-events-none">
        Target Aquifer: {activeBlock}
      </div>
    </div>
  );
}

// ====================================================================
// MAIN APP COMPONENT
// ====================================================================
function App() {
  // Live Sensor Data (Demo Mode / Simulated)
  const [sensorWaterLevel, setSensorWaterLevel] = useState(23.0);
  const [sensorPh, setSensorPh] = useState(7.4);
  const [sensorTds, setSensorTds] = useState(450);
  const [sensorRisk, setSensorRisk] = useState("LOW");

  // Virtual Sensor Control Room Console Logs Feed
  const [consoleLogs, setConsoleLogs] = useState([
    "System booted. Initializing aquifer telemetry links...",
    "Live telemetry feed online. Station ID: IMC-AQ-452"
  ]);
  const consoleContainerRef = useRef(null);

  // AI Prediction Inputs (Real / Forecast System)
  const [block, setBlock] = useState("Depalpur");
  const [wellType, setWellType] = useState("Bore Well");
  const [aquifer, setAquifer] = useState("Semi-Confined");
  const [seasonOrder, setSeasonOrder] = useState(1);
  const [currentWaterLevel, setCurrentWaterLevel] = useState(28.5);
  const [blockAvgDepth, setBlockAvgDepth] = useState(11.55);
  const [blockRiskScore, setBlockRiskScore] = useState(61.4);

  // AI Prediction Outputs
  const [predictedWaterLevel, setPredictedWaterLevel] = useState(18.5);
  const [riskScore, setRiskScore] = useState(72);
  const [riskLevel, setRiskLevel] = useState("HIGH");
  const [recommendations, setRecommendations] = useState([
    "Construct recharge pits in high-risk wards",
    "Reduce groundwater extraction by 10%",
    "Increase monitoring frequency",
    "Promote rainwater harvesting"
  ]);

  // "What If" Simulator Policy Toggles
  const [rechargeProgram, setRechargeProgram] = useState(false);
  const [extractionCap, setExtractionCap] = useState(false);
  const [rainwaterHarvesting, setRainwaterHarvesting] = useState(false);
  const [industrialStress, setIndustrialStress] = useState(false);
  const [urbanConcreteCover, setUrbanConcreteCover] = useState(false);
  const [expandedPolicies, setExpandedPolicies] = useState({});

  const togglePolicyExpand = (key) => {
    setExpandedPolicies(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Block defaults map
  const blockDefaults = {
    Depalpur: { avgDepth: 11.55, riskScore: 61.4, aquifer: "Semi-Confined" },
    Sanwer: { avgDepth: 9.19, riskScore: 59.3, aquifer: "Semi-Confined" },
    Indore: { avgDepth: 8.07, riskScore: 48.3, aquifer: "Unconfined" },
    Mhow: { avgDepth: 7.46, riskScore: 47.4, aquifer: "Unconfined" }
  };

  // Update block-specific defaults when block changes
  const handleBlockChange = (newBlock) => {
    setBlock(newBlock);
    if (blockDefaults[newBlock]) {
      setBlockAvgDepth(blockDefaults[newBlock].avgDepth);
      setBlockRiskScore(blockDefaults[newBlock].riskScore);
      setAquifer(blockDefaults[newBlock].aquifer);
    }
  };

  // API Call to Flask backend
  const handlePredict = useCallback(async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://aquasentinel-indore-sgo8.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          block,
          well_type: wellType,
          aquifer,
          season_order: Number(seasonOrder),
          current_water_level: Number(currentWaterLevel),
          block_avg_depth: Number(blockAvgDepth),
          block_risk_score: Number(blockRiskScore)
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to fetch prediction");
      }

      const result = await response.json();
      setPredictedWaterLevel(result.predicted_water_level);
      setRiskScore(result.risk_score);
      setRiskLevel(result.risk_level.toUpperCase());
      setRecommendations(result.recommendations);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [block, wellType, aquifer, seasonOrder, currentWaterLevel, blockAvgDepth, blockRiskScore]);

  // Fetch initial prediction
  useEffect(() => {
    let active = true;
    const fetchInitial = async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (active) {
        handlePredict();
      }
    };
    fetchInitial();
    return () => {
      active = false;
    };
  }, [handlePredict]);

  // Virtual Sensor Simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      const level = (20 + Math.random() * 5).toFixed(1);
      const phValue = (7 + Math.random() * 1).toFixed(2);
      const tdsValue = Math.floor(400 + Math.random() * 100);

      setSensorWaterLevel(level);
      setSensorPh(phValue);
      setSensorTds(tdsValue);

      let currentRisk = "LOW";
      if (level < 21) {
        currentRisk = "HIGH";
      } else if (level < 23) {
        currentRisk = "MEDIUM";
      }
      setSensorRisk(currentRisk);

      // Generate a dynamic, formatted terminal log line
      const timestamp = new Date().toLocaleTimeString();
      const zones = ["Zone-A (Depalpur)", "Zone-N (Sanwer)", "Central (Indore)", "Heights (Mhow)"];
      const targetZone = zones[Math.floor(Math.random() * zones.length)];
      const logMessage = `[${timestamp}] Telemetry synced from ${targetZone} • pH: ${phValue} • TDS: ${tdsValue}ppm • Level: ${level}ft [${currentRisk} RISK]`;

      setConsoleLogs((prev) => {
        const newLogs = [...prev, logMessage];
        if (newLogs.length > 25) newLogs.shift();
        return newLogs;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll the virtual sensor log console container
  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // Calculate "What If" simulation values
  let simulatedWaterLevel = predictedWaterLevel;
  let simulatedRiskScore = riskScore;

  if (rechargeProgram) {
    simulatedWaterLevel = Number((simulatedWaterLevel * 0.85).toFixed(2));
    simulatedRiskScore = Math.max(0, simulatedRiskScore - 12);
  }
  if (extractionCap) {
    simulatedWaterLevel = Number((simulatedWaterLevel * 0.90).toFixed(2));
    simulatedRiskScore = Math.max(0, simulatedRiskScore - 8);
  }
  if (rainwaterHarvesting) {
    simulatedWaterLevel = Number((simulatedWaterLevel * 0.92).toFixed(2));
    simulatedRiskScore = Math.max(0, simulatedRiskScore - 6);
  }
  if (industrialStress) {
    simulatedWaterLevel = Number((simulatedWaterLevel * 1.25).toFixed(2));
    simulatedRiskScore = Math.min(100, simulatedRiskScore + 15);
  }
  if (urbanConcreteCover) {
    simulatedWaterLevel = Number((simulatedWaterLevel * 1.18).toFixed(2));
    simulatedRiskScore = Math.min(100, simulatedRiskScore + 10);
  }

  let simulatedRiskLevel = riskLevel;
  if (rechargeProgram || extractionCap || rainwaterHarvesting || industrialStress || urbanConcreteCover) {
    if (simulatedRiskScore >= 75) {
      simulatedRiskLevel = "CRITICAL";
    } else if (simulatedRiskScore >= 60) {
      simulatedRiskLevel = "HIGH";
    } else if (simulatedRiskScore >= 45) {
      simulatedRiskLevel = "MEDIUM";
    } else {
      simulatedRiskLevel = "LOW";
    }
  }

  const blockPopulation = {
    Depalpur: "215,000 residents",
    Sanwer: "185,000 residents",
    Indore: "1,450,000 residents",
    Mhow: "280,000 residents"
  };

  let baseRunway = 10;
  if (block === "Depalpur" || block === "Sanwer") {
    baseRunway = 6.5;
  } else if (block === "Indore") {
    baseRunway = 12.0;
  } else if (block === "Mhow") {
    baseRunway = 8.5;
  }

  let simulatedRunway = baseRunway;
  if (rechargeProgram) simulatedRunway += 4.5;
  if (extractionCap) simulatedRunway += 3.0;
  if (rainwaterHarvesting) simulatedRunway += 1.5;
  if (industrialStress) simulatedRunway -= 4.0;
  if (urbanConcreteCover) simulatedRunway -= 2.5;
  simulatedRunway = Math.max(1.5, Math.min(30, simulatedRunway));

  const groundwaterHealthScore = Math.max(0, Math.min(100, 100 - simulatedRiskScore));
  let healthLabel = "Excellent";
  let healthColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (groundwaterHealthScore < 40) {
    healthLabel = "Critical / Degraded";
    healthColor = "text-red-700 bg-red-50 border-red-200";
  } else if (groundwaterHealthScore < 60) {
    healthLabel = "Moderate Stress";
    healthColor = "text-amber-700 bg-amber-50 border-amber-200";
  } else if (groundwaterHealthScore < 80) {
    healthLabel = "Stable / Good";
    healthColor = "text-sky-700 bg-sky-50 border-sky-200";
  }
  // Determine risk theme colors
  let riskColorClass = "text-slate-600 border-slate-200 bg-slate-100";
  let gaugeStroke = "#0284c7";
  if (simulatedRiskLevel === "CRITICAL") {
    riskColorClass = "text-red-700 border-red-200 bg-red-50";
    gaugeStroke = "#dc2626";
  } else if (simulatedRiskLevel === "HIGH") {
    riskColorClass = "text-rose-700 border-rose-200 bg-rose-50";
    gaugeStroke = "#e11d48";
  } else if (simulatedRiskLevel === "MEDIUM") {
    riskColorClass = "text-amber-700 border-amber-200 bg-amber-50";
    gaugeStroke = "#d97706";
  } else if (simulatedRiskLevel === "LOW") {
    riskColorClass = "text-emerald-700 border-emerald-200 bg-emerald-50";
    gaugeStroke = "#059669";
  }

  const radius = 40;
  const strokeWidth = 5.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (simulatedRiskScore / 100) * circumference;

  const blockPresetList = ["Depalpur", "Sanwer", "Indore", "Mhow"];

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-slate-100 to-sky-50/50 text-slate-800 flex flex-col font-sans selection:bg-sky-100 relative">
      
      {/* AMBIENT CANVAS BLOBS */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-sky-200/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* HEADER SECTION */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200/80 mb-8 gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-white border border-slate-200 text-sky-600 shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Indore Municipal Corporation • Aquifer Monitoring Portal
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
              AquaSentinel <span className="text-sky-600 font-normal text-lg">Indore</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-white border border-slate-200/80 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Forecasting Model Active
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            System Dashboard v2.2
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-16 z-10">
        
        {/* LEFT COMPONENT */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* TELEMETRY */}
          <section>
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              Live Telemetry Feed (Virtual Sensor Mode)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <Card title="Water Level" value={`${sensorWaterLevel} ft`} />
              <Card title="pH" value={sensorPh} />
              <Card title="TDS" value={`${sensorTds} ppm`} />
              <Card title="Risk" value={sensorRisk} />
            </div>

            <div className="glass-card rounded p-4 flex flex-col shadow-inner">
              <div className="flex justify-between items-center mb-2.5 pb-1.5 border-b border-slate-200/30">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  Sensor Control Room Console
                </span>
                <span className="text-[9px] text-slate-400 font-semibold uppercase font-mono">Baud Rate: 9600</span>
              </div>
              <div 
                ref={consoleContainerRef}
                className="bg-[#09090b] rounded p-3 h-28 overflow-y-auto font-mono text-[10px] text-sky-400 space-y-1.5 scrollbar-thin select-none"
              >
                {consoleLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed opacity-95">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FORECAST WORKSPACE */}
          <section className="glass-card rounded p-6 relative overflow-hidden">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-500" />
              Groundwater Forecast Workspace
            </h2>

            {/* PRESETS */}
            <div className="mb-6 flex flex-col gap-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Block Quick Presets</label>
              <div className="flex p-1 rounded-lg bg-slate-200/50 border border-slate-200/80 gap-1 relative overflow-hidden self-start">
                {blockPresetList.map((preset) => {
                  const isActive = block === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleBlockChange(preset)}
                      className={`relative px-4 py-1.5 text-xs font-semibold rounded-md transition-colors duration-150 z-10 ${
                        isActive ? "text-slate-800" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeBlockTab"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          className="absolute inset-0 bg-white rounded shadow-sm -z-10"
                        />
                      )}
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <form onSubmit={handlePredict} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select Block</label>
                  <select 
                    value={block} 
                    onChange={(e) => handleBlockChange(e.target.value)}
                    className="linear-input"
                  >
                    <option value="Depalpur">Depalpur</option>
                    <option value="Sanwer">Sanwer</option>
                    <option value="Indore">Indore</option>
                    <option value="Mhow">Mhow</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Well Configuration</label>
                  <select 
                    value={wellType} 
                    onChange={(e) => setWellType(e.target.value)}
                    className="linear-input"
                  >
                    <option value="Bore Well">Bore Well</option>
                    <option value="Dug Well">Dug Well</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aquifer Classification</label>
                  <select 
                    value={aquifer} 
                    onChange={(e) => setAquifer(e.target.value)}
                    className="linear-input"
                  >
                    <option value="Semi-Confined">Semi-Confined</option>
                    <option value="Unconfined">Unconfined</option>
                    <option value="Confined">Confined</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Season</label>
                  <select 
                    value={seasonOrder} 
                    onChange={(e) => setSeasonOrder(Number(e.target.value))}
                    className="linear-input"
                  >
                    <option value={1}>Pre-Monsoon (May)</option>
                    <option value={2}>Monsoon (August)</option>
                    <option value={3}>Post-Monsoon (Nov)</option>
                    <option value={4}>Recession (Jan)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Water Level (ft)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={currentWaterLevel} 
                    onChange={(e) => setCurrentWaterLevel(e.target.value)}
                    className="linear-input" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Block Avg Depth (m)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={blockAvgDepth} 
                    onChange={(e) => setBlockAvgDepth(e.target.value)}
                    className="linear-input" 
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-3">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Base Block Risk Score (0-100)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={blockRiskScore} 
                    onChange={(e) => setBlockRiskScore(e.target.value)}
                    className="linear-input" 
                  />
                </div>
              </div>

              <button 
                id="predictor-form-submit-btn"
                type="submit" 
                disabled={loading} 
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white rounded font-bold text-xs tracking-wide uppercase transition-all duration-150 border border-sky-500/20 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Calculating Aquifer Projections..." : "Run Forecast Projection"}
              </button>
            </form>
          </section>

          {/* WARD RISK HEATMAP (INTERACTIVE LEAFLET GIS MAP) */}
          <section className="glass-card rounded p-6 text-left">
            <h2 className="text-base font-bold text-slate-800 mb-1.5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-500" />
              Ward Risk Heatmap (Indore Aquifer Zones)
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Real-time interactive GIS map of Indore groundwater regions. Click any aquifer zone circle to sync the workspace.
            </p>

            <InteractiveMap 
              activeBlock={block} 
              onBlockSelect={handleBlockChange} 
              simulatedRiskLevel={simulatedRiskLevel} 
              riskScore={simulatedRiskScore} 
            />
          </section>

        </div>

        {/* RIGHT COMPONENT */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-4 rounded border border-red-200 bg-red-50 text-red-700 text-xs font-semibold flex gap-2.5 items-start shadow-sm"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <div>
                  <div className="font-bold">Projection Failed</div>
                  <div className="text-[11px] opacity-90 font-medium mt-0.5">{error}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ANALYTICS */}
          <section className="glass-card rounded p-6 relative text-left">
            
            <AnimatePresence>
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded"
                >
                  <RefreshCw className="w-5 h-5 text-sky-500 animate-spin" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-3.5">
                    Analyzing Aquifer Stress Columns...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              Groundwater Forecast Analysis
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              
              <div className="flex flex-col items-center justify-center p-4 rounded border border-slate-100 bg-white/40">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-3">
                  Aquifer Stress Score
                </span>
                
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      stroke="rgba(15,23,42,0.03)"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      stroke={gaugeStroke}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      fill="transparent"
                      strokeLinecap="square"
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-slate-800">{simulatedRiskScore}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Points</span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded border ${riskColorClass}`}>
                    {simulatedRiskLevel} RISK
                  </span>
                </div>
              </div>

              <div className="flex flex-col p-4 rounded border border-slate-100 bg-white/40 min-h-[195px] justify-between text-left">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-3">
                  Community Water Security Outlook
                </span>
                
                <div className="space-y-2.5">
                  {/* Metric 1: Population Dependent */}
                  <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100/80 bg-white/60">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded bg-sky-50 text-sky-600">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[8px] text-slate-400 font-bold uppercase">Population Dependent</div>
                        <div className="text-xs font-extrabold text-slate-700 mt-0.5">{blockPopulation[block] || "280,000 residents"}</div>
                      </div>
                    </div>
                    <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                      Local Aquifer
                    </span>
                  </div>

                  {/* Metric 2: Sustainability Runway */}
                  <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100/80 bg-white/60">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded bg-amber-50 text-amber-600">
                        <Hourglass className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[8px] text-slate-400 font-bold uppercase">Aquifer Runway Outlook</div>
                        <div className="text-xs font-extrabold text-slate-700 mt-0.5">{simulatedRunway.toFixed(1)} Years Remaining</div>
                      </div>
                    </div>
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                      simulatedRunway >= 12 ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                      simulatedRunway >= 6 ? "text-amber-700 bg-amber-50 border-amber-200" :
                      "text-red-700 bg-red-50 border-red-200"
                    }`}>
                      {simulatedRunway >= 12 ? "Sustainable" : simulatedRunway >= 6 ? "Stressed" : "Critical"}
                    </span>
                  </div>

                  {/* Metric 3: Health Score */}
                  <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100/80 bg-white/60">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded bg-emerald-50 text-emerald-600">
                        <Heart className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[8px] text-slate-400 font-bold uppercase">Groundwater Health Index</div>
                        <div className="text-xs font-extrabold text-slate-700 mt-0.5">{groundwaterHealthScore} / 100 Points</div>
                      </div>
                    </div>
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${healthColor}`}>
                      {healthLabel}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: Original ML */}
              <div className="p-3.5 rounded-lg border border-slate-100/80 bg-white/50 hover:bg-white/80 transition-all duration-200 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider pl-1">
                  Original ML
                </span>
                <span className="text-sm font-bold text-slate-700 pl-1 mt-2.5">
                  {predictedWaterLevel} <span className="text-[10px] font-normal text-slate-400">ft</span>
                </span>
              </div>
              
              {/* Card 2: Simulated */}
              <div className="p-3.5 rounded-lg border border-slate-200/80 bg-sky-50/20 hover:bg-sky-50/40 transition-all duration-200 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
                <span className="text-[9px] text-sky-600 font-bold uppercase tracking-wider pl-1">
                  Simulated
                </span>
                <div className="pl-1 mt-2.5 flex flex-col">
                  <span className="text-sm font-bold text-sky-700">
                    {simulatedWaterLevel} <span className="text-[10px] font-normal text-sky-400">ft</span>
                  </span>
                  {/* Delta Indicator */}
                  {simulatedWaterLevel !== predictedWaterLevel ? (
                    <span className={`text-[9px] font-bold mt-1 inline-flex items-center gap-0.5 ${
                      simulatedWaterLevel < predictedWaterLevel ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {simulatedWaterLevel < predictedWaterLevel ? "↓" : "↑"} 
                      {Math.abs(simulatedWaterLevel - predictedWaterLevel).toFixed(2)} ft
                    </span>
                  ) : (
                    <span className="text-[8px] text-slate-400 font-medium mt-1">No policy active</span>
                  )}
                </div>
              </div>

              {/* Card 3: Model Status */}
              <div className="p-3.5 rounded-lg border border-slate-100/80 bg-white/50 hover:bg-white/80 transition-all duration-200 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400 group-hover:bg-emerald-500 transition-colors" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider pl-1">
                  Model Status
                </span>
                <span className="text-sm font-bold pl-1 mt-2.5 text-emerald-600 inline-flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Active
                </span>
              </div>
            </div>

          </section>

          {/* SIMULATOR */}
          <section className="glass-card rounded p-6 text-left">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-500" />
                "What If" Policy Simulator
              </h2>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700">
                Rule-Based Delta
              </span>
            </div>
            <div className="space-y-3">
              {/* Option 1: Recharge Pits (Positive) */}
              <div 
                onClick={() => togglePolicyExpand("recharge")}
                className="flex flex-col gap-1.5 p-2 rounded hover:bg-slate-200/20 transition-colors duration-150 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 pr-4">
                    <span className="text-[8px] text-slate-400 select-none w-3">
                      {expandedPolicies["recharge"] ? "▼" : "▶"}
                    </span>
                    <div className="text-xs font-bold text-slate-800">Recharge Pit Net Program (Positive)</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={rechargeProgram}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setRechargeProgram(e.target.checked)}
                    className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 shrink-0 cursor-pointer"
                  />
                </div>
                <AnimatePresence initial={false}>
                  {expandedPolicies["recharge"] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden pl-5 pr-8"
                    >
                      <p className="text-[10.5px] text-slate-500 leading-normal pb-1">
                        Build specialized gravel-filled pits throughout the city. These capture monsoon rains and guide the water directly down to refill underground layers naturally (reduces water depth by 15% and aquifer stress by 12 points).
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Option 2: Extraction Cap (Positive) */}
              <div 
                onClick={() => togglePolicyExpand("extraction")}
                className="flex flex-col gap-1.5 p-2 rounded hover:bg-slate-200/20 transition-colors duration-150 cursor-pointer pt-3 border-t border-slate-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 pr-4">
                    <span className="text-[8px] text-slate-400 select-none w-3">
                      {expandedPolicies["extraction"] ? "▼" : "▶"}
                    </span>
                    <div className="text-xs font-bold text-slate-800">Strict Pumping Limits / 15% Cap (Positive)</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={extractionCap}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setExtractionCap(e.target.checked)}
                    className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 shrink-0 cursor-pointer"
                  />
                </div>
                <AnimatePresence initial={false}>
                  {expandedPolicies["extraction"] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden pl-5 pr-8"
                    >
                      <p className="text-[10.5px] text-slate-500 leading-normal pb-1">
                        Set clear, enforceable limits on how much water public and private tube wells can extract daily. This directly slows down the rate of groundwater depletion (reduces water depth by 10% and aquifer stress by 8 points).
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Option 3: Rainwater Harvesting (Positive) */}
              <div 
                onClick={() => togglePolicyExpand("rainwater")}
                className="flex flex-col gap-1.5 p-2 rounded hover:bg-slate-200/20 transition-colors duration-150 cursor-pointer pt-3 border-t border-slate-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 pr-4">
                    <span className="text-[8px] text-slate-400 select-none w-3">
                      {expandedPolicies["rainwater"] ? "▼" : "▶"}
                    </span>
                    <div className="text-xs font-bold text-slate-800">Rainwater Harvesting Mandate (Positive)</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={rainwaterHarvesting}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setRainwaterHarvesting(e.target.checked)}
                    className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 shrink-0 cursor-pointer"
                  />
                </div>
                <AnimatePresence initial={false}>
                  {expandedPolicies["rainwater"] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden pl-5 pr-8"
                    >
                      <p className="text-[10.5px] text-slate-500 leading-normal pb-1">
                        Require buildings and public parks to install systems that catch and store rain falling on roofs. This lessens our daily pull on aquifers by utilizing surface runoff (reduces water depth by 8% and aquifer stress by 6 points).
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Option 4: Industrial Stress (Negative) */}
              <div 
                onClick={() => togglePolicyExpand("industrial")}
                className="flex flex-col gap-1.5 p-2 rounded hover:bg-slate-200/20 transition-colors duration-150 cursor-pointer pt-3 border-t border-slate-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 pr-4">
                    <span className="text-[8px] text-slate-400 select-none w-3">
                      {expandedPolicies["industrial"] ? "▼" : "▶"}
                    </span>
                    <div className="text-xs font-bold text-slate-800">Unregulated Industrial Over-Extraction (Negative)</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={industrialStress}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setIndustrialStress(e.target.checked)}
                    className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 shrink-0 cursor-pointer"
                  />
                </div>
                <AnimatePresence initial={false}>
                  {expandedPolicies["industrial"] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden pl-5 pr-8"
                    >
                      <p className="text-[10.5px] text-slate-500 leading-normal pb-1">
                        Allow heavy commercial factories and construction projects to pump groundwater 24/7 without permits. This sucks local water pockets dry faster than nature can ever replenish them (increases water depth by 25% and aquifer stress by 15 points).
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Option 5: Concrete Cover (Negative) */}
              <div 
                onClick={() => togglePolicyExpand("concrete")}
                className="flex flex-col gap-1.5 p-2 rounded hover:bg-slate-200/20 transition-colors duration-150 cursor-pointer pt-3 border-t border-slate-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 pr-4">
                    <span className="text-[8px] text-slate-400 select-none w-3">
                      {expandedPolicies["concrete"] ? "▼" : "▶"}
                    </span>
                    <div className="text-xs font-bold text-slate-800">Concrete Urban Expansion (Negative)</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={urbanConcreteCover}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setUrbanConcreteCover(e.target.checked)}
                    className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 shrink-0 cursor-pointer"
                  />
                </div>
                <AnimatePresence initial={false}>
                  {expandedPolicies["concrete"] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden pl-5 pr-8"
                    >
                      <p className="text-[10.5px] text-slate-500 leading-normal pb-1">
                        Pave over dirt roads, gardens, and grasslands with concrete and asphalt. Rainwater can no longer seep into the dirt to refill the aquifers, running off instead into garbage drains (increases water depth by 18% and aquifer stress by 10 points).
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* RECOMMENDATIONS */}
          <section className="glass-card rounded p-6 text-left">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              Intervention Recommendations
            </h2>

            <div className="flex flex-col gap-2.5">
              {recommendations.map((rec, index) => {
                let badgeLabel = "INTERVENTION";
                let badgeStyle = "text-sky-700 border-sky-200 bg-sky-50";

                if (rec.toLowerCase().includes("recharge") || rec.toLowerCase().includes("pit")) {
                  badgeLabel = "RECHARGE";
                  badgeStyle = "text-emerald-700 border-emerald-200 bg-emerald-50";
                } else if (rec.toLowerCase().includes("extraction") || rec.toLowerCase().includes("reduce")) {
                  badgeLabel = "DEMAND";
                  badgeStyle = "text-red-700 border-red-200 bg-red-50";
                } else if (rec.toLowerCase().includes("monitor") || rec.toLowerCase().includes("inspect")) {
                  badgeLabel = "MONITOR";
                  badgeStyle = "text-amber-700 border-amber-200 bg-amber-50";
                }

                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.04 }}
                    key={index}
                    className="p-3 rounded border border-slate-100 bg-white/40 hover:border-slate-300 transition-colors duration-100 flex justify-between items-center gap-4"
                  >
                    <span className="text-xs text-slate-700 font-medium">
                      {rec}
                    </span>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase whitespace-nowrap tracking-wider ${badgeStyle}`}>
                      {badgeLabel}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </section>

        </div>

      </main>
    </div>
  );
}

export default App;