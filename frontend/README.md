# AquaSentinel Indore — Frontend Portal

This is the React frontend for **AquaSentinel Indore**, a premium, municipal-grade groundwater monitoring and early warning forecast dashboard designed for urban planners, municipal officers, and water resource analysts.

## Visual Design System
The frontend implements a high-fidelity **Light Theme Glassmorphism** design:
- **Translucent Surfaces**: Translucent card backdrops (`backdrop-filter: blur(20px)`) with frosted borders matching a clean, professional climate-tech aesthetic.
- **Ambient Canvas**: A light, soft background gradient with sky blue and mint radial ambient blooms.
- **High-Contrast Slate Typography**: Using deep slates (`#0f172a`, `#334155`) to guarantee WCAG 2.2 AA accessibility against glass backdrops.
- **Micro-Animations**: Framer Motion transitions for cards, alerts, and interactive lists.

## Advanced Components & Features
1. **Interactive Presets segmented control**: An advanced, tabbed preset selector utilizing Framer Motion's layout spring physics. Clicking on quick block options (Depalpur, Sanwer, Indore, Mhow) slides a physical layout pill behind the option and synchronizes defaults.
2. **Groundwater Forecast Graph**: A customized Recharts `AreaChart` with transparent gradients, rendering water column forecast trends.
3. **Circular Stress Gauge**: A vector circular dial indicating composite aquifer risk stress scores using color-coordinated thresholds (emerald, amber, rose, red).
4. **Live Sensor Telemetry**: Continuous simulation baseline cards for regional Water Level, pH, TDS, and Risk Status.
5. **Interactive Reference Grid**: Clicking any row in the *Ward Stress Reference* table instantly populates form parameters and triggers forecast projections.

---

## Tech Stack
- **Framework**: React 19 (Vite 8 compiler environment)
- **Styling**: Tailwind CSS v3 & Vanilla CSS Glassmorphism variables
- **Charts**: Recharts v3
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## Setup & Development

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The application will run locally at **`http://localhost:5173/`**.

### 3. Static Code Analysis (Linting)
Ensure no unused variables or cascading setState warnings exist:
```bash
npm run lint
```

### 4. Build Production Assets
Compiles and minifies assets to the `dist/` directory:
```bash
npm run build
```

---

## Clean Code & Guidelines
- **No Synchronous SetState in Effects**: All asynchronous fetches or initial prediction triggers are wrapped in deferred execution cycles (e.g. deferred microtasks or `setTimeout`) to prevent React 19 render loop warnings.
- **Unused Declarations**: Avoid importing unused Lucide icons or Recharts sub-modules to preserve bundles optimization.
