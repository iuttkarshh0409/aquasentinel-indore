import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  ShieldAlert, 
  Award, 
  TrendingUp, 
  RefreshCw, 
  MapPin, 
  Compass
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Card from "./components/Card";

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
  const [industrialStress, setIndustrialStress] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Topological Grid Heatmap Data
  const heatmapSectors = [
    { name: "Depalpur Zone A", block: "Depalpur", risk: "HIGH", code: "DP-A" },
    { name: "Depalpur Zone B", block: "Depalpur", risk: "MEDIUM", code: "DP-B" },
    { name: "Sanwer North", block: "Sanwer", risk: "HIGH", code: "SW-N" },
    { name: "Sanwer South", block: "Sanwer", risk: "MEDIUM", code: "SW-S" },
    { name: "Indore Central", block: "Indore", risk: "MEDIUM", code: "ID-C" },
    { name: "Mhow Heights", block: "Mhow", risk: "LOW", code: "MH-H" },
  ];

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

  // Interactive Ward select trigger
  const handleWardClick = (wardBlock) => {
    setBlock(wardBlock);
    if (blockDefaults[wardBlock]) {
      setBlockAvgDepth(blockDefaults[wardBlock].avgDepth);
      setBlockRiskScore(blockDefaults[wardBlock].riskScore);
      setAquifer(blockDefaults[wardBlock].aquifer);
      
      // Auto-trigger prediction
      setTimeout(() => {
        document.getElementById("predictor-form-submit-btn")?.click();
      }, 50);
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
    // Recharge pit programs improve aquifer height (reduces depth below ground level by 15%)
    simulatedWaterLevel = Number((simulatedWaterLevel * 0.85).toFixed(2));
    simulatedRiskScore = Math.max(0, simulatedRiskScore - 12);
  }
  if (extractionCap) {
    // Extraction cap controls drawdowns by 10%
    simulatedWaterLevel = Number((simulatedWaterLevel * 0.90).toFixed(2));
    simulatedRiskScore = Math.max(0, simulatedRiskScore - 8);
  }
  if (industrialStress) {
    // Unchecked drawdown increases mbgl depth by 25%
    simulatedWaterLevel = Number((simulatedWaterLevel * 1.25).toFixed(2));
    simulatedRiskScore = Math.min(100, simulatedRiskScore + 15);
  }

  let simulatedRiskLevel = riskLevel;
  if (rechargeProgram || extractionCap || industrialStress) {
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

  // Prepare chart data for Recharts (showing baseline vs ML forecast vs simulated target)
  const chartData = [
    { name: "Historical", level: Number(currentWaterLevel) * 1.1 },
    { name: "Current Baseline", level: Number(currentWaterLevel) },
    { name: "ML Forecast", level: Number(predictedWaterLevel) },
    { name: "Simulated Model", level: Number(simulatedWaterLevel) }
  ];

  // Determine risk theme colors (Light Mode High-Contrast Pastel / Steel gray borders)
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

  // Calculate circular dial path attributes
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

      {/* HEADER SECTION (PREMIUM LIGHT MUNICIPAL PORTAL) */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200/80 mb-8 gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-white border border-slate-200 text-sky-600 shadow-sm">
            {/* Groundwater Layers Abstraction Logo */}
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
            System Dashboard v2.1
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-16 z-10">
        
        {/* LEFT COMPONENT (GRID 7): CONTROLS, TELEMETRY, MONITORING */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* TELEMETRY CARDS SECTION */}
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

            {/* VIRTUAL SENSOR CONSOLE (REAL-TIME CONSOLE SIMULATOR) */}
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

          {/* CONTROL PANEL WORKSPACE */}
          <section className="glass-card rounded p-6 relative overflow-hidden">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-500" />
              Groundwater Forecast Workspace
            </h2>

            {/* ADVANCED BLOCK PRESET SELECTOR (Segmented Tab Bar) */}
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

          {/* WARD RISK HEATMAP (TOPOLOGICAL GEOMETRIC GRID) */}
          <section className="glass-card rounded p-6 text-left">
            <h2 className="text-base font-bold text-slate-800 mb-1.5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-500" />
              Ward Risk Heatmap (Indore Spatial Matrix)
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Visual risk distribution map of aquifer stress nodes. Click any grid cell to load it.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {heatmapSectors.map((sector, idx) => {
                let riskBg = "bg-emerald-50 border-emerald-200 text-emerald-800";
                if (sector.risk === "HIGH") {
                  riskBg = "bg-rose-50 border-rose-200 text-rose-800";
                } else if (sector.risk === "MEDIUM") {
                  riskBg = "bg-amber-50 border-amber-200 text-amber-800";
                }
                const isSelected = block === sector.block;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleWardClick(sector.block)}
                    className={`p-3.5 rounded border text-left flex flex-col justify-between h-20 transition-all duration-200 select-none ${riskBg} ${
                      isSelected ? "ring-2 ring-sky-500 ring-offset-2 scale-[1.01]" : "hover:brightness-95"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[10px] font-bold tracking-wider">{sector.code}</span>
                      <span className="text-[8px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/60">
                        {sector.risk}
                      </span>
                    </div>
                    <span className="text-xs font-bold truncate mt-2">{sector.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

        </div>

        {/* RIGHT COMPONENT (GRID 5): ANALYTICS & INSIGHTS */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* API ERROR CONTAINER */}
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

          {/* ANALYTICS PANEL */}
          <section className="glass-card rounded p-6 relative text-left">
            
            {/* OVERLAY SKELETON LOADER */}
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

            {/* RADIAL DIAL & RECHARTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              
              {/* RADIAL DIAL */}
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

              {/* TRAJECTORY GRAPH */}
              <div className="flex flex-col p-4 rounded border border-slate-100 bg-white/40 min-h-[140px]">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                  Forecast Trajectory (ft)
                </span>
                
                <div className="w-full flex-grow mt-2">
                  <ResponsiveContainer width="100%" height={80}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLevelLight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={8} tickLine={false} domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "4px" }}
                        labelStyle={{ color: "#475569", fontSize: "10px" }}
                        itemStyle={{ color: "#0284c7", fontSize: "10px" }}
                      />
                      <Area type="monotone" dataKey="level" stroke="#0284c7" strokeWidth={1.5} fillOpacity={1} fill="url(#colorLevelLight)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* KEY DATA BENCHMARKS */}
            <div className="p-4 rounded border border-slate-100 bg-white/40 divide-y divide-slate-100 space-y-3 shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Original ML Projection</span>
                <span className="text-slate-500 font-semibold">{predictedWaterLevel} ft</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-3">
                <span className="text-slate-700 font-bold">Simulated Projection</span>
                <span className="text-sky-600 font-bold">{simulatedWaterLevel} ft</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-3">
                <span className="text-slate-500 font-medium">Model Status</span>
                <span className="text-emerald-600 font-bold uppercase text-[9px] tracking-wider">
                  Active
                </span>
              </div>
            </div>

          </section>

          {/* "WHAT IF" SIMULATOR INTERVENTIONS */}
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Recharge Pit Program</div>
                  <p className="text-[10px] text-slate-400">Simulate building recharge pit nets (depth -15%, stress -12 pts)</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={rechargeProgram}
                  onChange={(e) => setRechargeProgram(e.target.checked)}
                  className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-800">15% Extraction Cap Policy</div>
                  <p className="text-[10px] text-slate-400">Simulate strict groundwater caps (depth -10%, stress -8 pts)</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={extractionCap}
                  onChange={(e) => setExtractionCap(e.target.checked)}
                  className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-800">Industrial Stress Test</div>
                  <p className="text-[10px] text-slate-400">Simulate unmanaged commercial drawdowns (depth +25%, stress +15 pts)</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={industrialStress}
                  onChange={(e) => setIndustrialStress(e.target.checked)}
                  className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                />
              </div>
            </div>
          </section>

          {/* INTERVENTION RECOMMENDATION CENTER */}
          <section className="glass-card rounded p-6 text-left">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
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