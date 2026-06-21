import { motion } from "framer-motion";
import { Droplet, Activity, ShieldAlert, Award } from "lucide-react";

function Card({ title, value }) {
  let icon = <Droplet className="w-4 h-4 text-slate-400" />;

  if (title === "Water Level") {
    icon = <Droplet className="w-4 h-4 text-sky-500" />;
  } else if (title === "pH") {
    icon = <Activity className="w-4 h-4 text-teal-500" />;
  } else if (title === "TDS") {
    icon = <Award className="w-4 h-4 text-amber-500" />;
  } else if (title === "Risk") {
    if (value === "HIGH") {
      icon = <ShieldAlert className="w-4 h-4 text-red-500" />;
    } else if (value === "MEDIUM") {
      icon = <ShieldAlert className="w-4 h-4 text-amber-500" />;
    } else if (value === "LOW") {
      icon = <ShieldAlert className="w-4 h-4 text-emerald-500" />;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="glass-card rounded p-4 flex items-center justify-between transition-colors duration-150 hover:bg-white/60 border border-white/60"
    >
      <div>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
          {title}
        </div>
        <div className="text-xl font-bold tracking-tight text-slate-800">
          {value}
        </div>
      </div>
      
      <div className="p-2 rounded bg-slate-50 border border-slate-200/60">
        {icon}
      </div>
    </motion.div>
  );
}

export default Card;