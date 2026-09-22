"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Shield, MapPin, Bell, User, Globe, Menu, X, ChevronRight, Droplets,
  Wind, Thermometer, Activity, TrendingUp, AlertTriangle, CheckCircle2,
  Upload, Send, Bot, Home, Map as MapIcon, Users, Radio, MessageSquare,
  Siren, Building2, Truck, Stethoscope, TrafficCone, Play, Pause, RotateCcw,
  ChevronDown, Circle, Dot, Sparkles, Zap, Search, Layers, Satellite,
  Mountain, Hospital, LocateFixed, Plus, Minus, LoaderCircle, LogOut, Save,
  Star, Phone, Settings, Info
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from "recharts";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, type User as FirebaseUser } from "firebase/auth";
import { firebaseAuth, firebaseConfigured } from "@/lib/firebase";

/* ---------------------------------------------------------------------
   DESIGN TOKENS
--------------------------------------------------------------------- */
const RISK = {
  low: { label: "Low", color: "#3FC98A", bg: "rgba(63,201,138,0.12)", ring: "rgba(63,201,138,0.35)" },
  moderate: { label: "Moderate", color: "#E7B94C", bg: "rgba(231,185,76,0.12)", ring: "rgba(231,185,76,0.35)" },
  high: { label: "High", color: "#E38A46", bg: "rgba(227,138,70,0.12)", ring: "rgba(227,138,70,0.35)" },
  critical: { label: "Critical", color: "#E4574F", bg: "rgba(228,87,79,0.14)", ring: "rgba(228,87,79,0.4)" },
};
const riskFromScore = (s) => (s < 35 ? "low" : s < 60 ? "moderate" : s < 80 ? "high" : "critical");

const ZONES = [
  { id: "wakad", name: "Lonavala", lat: 18.5997, lng: 73.7631, baseRisk: 68, vulnerability: 82, rainfall: 110, reports: 14, shelter: "1.2 km", hospital: "2.4 km" },
  { id: "baner", name: "Baner", lat: 18.559, lng: 73.7868, baseRisk: 42, vulnerability: 58, rainfall: 74, reports: 6, shelter: "0.8 km", hospital: "1.6 km" },
  { id: "aundh", name: "Aundh", lat: 18.5587, lng: 73.8077, baseRisk: 30, vulnerability: 44, rainfall: 55, reports: 3, shelter: "1.5 km", hospital: "2.0 km" },
  { id: "katraj", name: "Katraj", lat: 18.4529, lng: 73.8652, baseRisk: 58, vulnerability: 71, rainfall: 88, reports: 9, shelter: "2.1 km", hospital: "3.0 km" },
  { id: "hadapsar", name: "Hadapsar", lat: 18.5089, lng: 73.926, baseRisk: 47, vulnerability: 55, rainfall: 66, reports: 5, shelter: "1.0 km", hospital: "1.8 km" },
];

const LOCALITIES = [
  { name: "Kothrud", lat: 18.5074, lng: 73.8077 },
  { name: "Hinjewadi", lat: 18.5913, lng: 73.7389 },
  { name: "Viman Nagar", lat: 18.5679, lng: 73.9143 },
  { name: "Lonavala", lat: 18.7546, lng: 73.4062 },
];

const FACILITIES = [
  { name: "Aundh relief centre", type: "Relief centre", lat: 18.565, lng: 73.807, icon: "R" },
  { name: "Sancheti hospital", type: "Hospital", lat: 18.5267, lng: 73.856, icon: "H" },
  { name: "Lonavala shelter", type: "Shelter", lat: 18.603, lng: 73.752, icon: "S" },
  { name: "Katraj shelter", type: "Shelter", lat: 18.45, lng: 73.872, icon: "S" },
];

const DEMO_STEPS = [
  { label: "Normal", risk: 24, rainfall: 18, reports: 6 },
  { label: "Heavy rain", risk: 52, rainfall: 61, reports: 11 },
  { label: "Waterlogging reports", risk: 73, rainfall: 88, reports: 19 },
  { label: "Critical", risk: 87, rainfall: 118, reports: 27 },
];

const TREND_DATA = [
  { t: "6 AM", risk: 22 }, { t: "8 AM", risk: 34 }, { t: "10 AM", risk: 51 },
  { t: "12 PM", risk: 68 }, { t: "2 PM", risk: 87 },
];

const FEED_ITEMS = [
  { id: 1, icon: "🌊", type: "Waterlogging", area: "Lonavala", time: "4 min ago", status: "Reported" },
  { id: 2, icon: "🚧", type: "Road blocked", area: "Baner", time: "9 min ago", status: "Verified" },
  { id: 3, icon: "🌳", type: "Fallen tree", area: "Aundh", time: "15 min ago", status: "Resolved" },
  { id: 4, icon: "🏚️", type: "Flooding", area: "Katraj", time: "22 min ago", status: "Verified" },
];

const ACTIONS = [
  "Move to higher ground if flooding occurs.",
  "Avoid walking or driving through moving water.",
  "Follow official evacuation instructions.",
  "Keep essential documents and medicines accessible.",
  "Contact emergency services if trapped or in immediate danger.",
];

function cx(...c) { return c.filter(Boolean).join(" "); }

/* ---------------------------------------------------------------------
   PRIMITIVES
--------------------------------------------------------------------- */
function GlassPanel({ className, children, ...rest }) {
  return (
    <div
      className={cx(
        "interactive-panel rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

function RiskBadge({ level, size = "md" }) {
  const r = RISK[level];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      )}
      style={{ color: r.color, background: r.bg, border: `1px solid ${r.ring}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
      {r.label}
    </span>
  );
}

function CountUp({ value, duration = 1.1, decimals = 0, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) { setDisplay(value); return; }
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduce]);
  return <>{display.toFixed(decimals)}{suffix}</>;
}

function RiskGauge({ value, size = 168, level }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const color = RISK[level].color;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (pct / 100) * c }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tabular-nums text-white/95" style={{ fontFamily: "Manrope, sans-serif" }}>
          <CountUp value={pct} decimals={0} suffix="%" />
        </span>
        <span className="text-[11px] uppercase tracking-[0.14em] text-white/40 mt-1">Rainfall risk</span>
      </div>
    </div>
  );
}

function LiveDot() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300/90">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
      </span>
      LIVE
    </span>
  );
}

/* ---------------------------------------------------------------------
   INTRO
--------------------------------------------------------------------- */
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const particles = Array.from({ length: 520 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.45 + Math.random() * 1.2,
      alpha: 0.35 + Math.random() * 0.65,
      quadrant: index % 4,
      spread: Math.random(),
      depth: Math.random(),
    }));
    let frameId;
    const startedAt = performance.now();

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (now) => {
      const elapsed = (now - startedAt) / 1000;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const size = Math.min(width * 0.72, height * 0.7, 760);
      const left = (width - size) / 2;
      const top = (height - size) / 2 - size * 0.06;
      context.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        const side = particle.quadrant % 2 === 0 ? -1 : 1;
        const vertical = particle.quadrant < 2 ? -1 : 1;
        const localX = 0.07 + particle.spread * 0.4;
        const localY = 0.07 + ((particle.spread * 1.73 + particle.depth) % 1) * 0.4;
        const formationX = left + size * (side < 0 ? localX : 1 - localX);
        const formationY = top + size * (vertical < 0 ? localY : 1 - localY);
        const finalX = left + size * (side < 0 ? localX * 0.94 : 1 - localX * 0.94);
        const finalY = top + size * (vertical < 0 ? localY * 0.94 : 1 - localY * 0.94);
        const gather = Math.min(1, Math.max(0, (elapsed - 0.05) / 1.05));
        const assemble = Math.min(1, Math.max(0, (elapsed - 1.1) / 0.95));
        const easedGather = 1 - Math.pow(1 - gather, 3);
        const easedAssemble = 1 - Math.pow(1 - assemble, 3);
        const startX = particle.x * width;
        const startY = particle.y * height;
        const formationCenterX = width / 2 + (formationX - width / 2) * 0.78;
        const formationCenterY = height / 2 + (formationY - height / 2) * 0.78;
        const gatheredX = startX + (formationCenterX - startX) * easedGather;
        const gatheredY = startY + (formationCenterY - startY) * easedGather;
        const x = gatheredX + (finalX - gatheredX) * easedAssemble;
        const y = gatheredY + (finalY - gatheredY) * easedAssemble;
        const trail = Math.min(1, Math.max(0, (elapsed - 1.1) / 0.65));
        const opacity = particle.alpha * (elapsed > 2.12 ? Math.max(0, 1 - (elapsed - 2.12) / 0.5) : Math.min(1, elapsed / 0.25));

        context.fillStyle = `rgba(245,250,255,${opacity})`;
        context.beginPath();
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fill();
        if (trail > 0 && trail < 1) {
          context.strokeStyle = `rgba(245,250,255,${opacity * 0.18})`;
          context.lineWidth = particle.size * 0.7;
          context.beginPath();
          context.moveTo(gatheredX, gatheredY);
          context.lineTo(x, y);
          context.stroke();
        }
      });

      frameId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frameId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-20" aria-hidden="true" />;
}

function Intro({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black"
      exit={{ opacity: 0, transition: { duration: 0.32, ease: "easeInOut" } }}
    >
      <ParticleField />
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        className="relative flex w-full flex-col items-center"
      >
        <motion.div
          className="relative w-[min(30vw,30vh,320px)] aspect-square"
          aria-label="ResiliAI logo"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 0.9, 1.05, 1] }}
          transition={{ delay: 1.72, duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
        >
          {[
            { className: "left-0 top-0", x: -320, y: -260, rotate: -28 },
            { className: "right-0 top-0", x: 320, y: -260, rotate: 28 },
            { className: "left-0 bottom-0", x: -320, y: 260, rotate: 28 },
            { className: "right-0 bottom-0", x: 320, y: 260, rotate: -28 },
          ].map((piece) => (
            <motion.div
              key={piece.className}
              className={`absolute z-10 h-1/2 w-1/2 overflow-hidden ${piece.className}`}
              initial={{ x: piece.x, y: piece.y, rotate: piece.rotate, scale: 0.7, opacity: 0 }}
              animate={{
                x: [piece.x, piece.x * 0.38, 0],
                y: [piece.y, piece.y * 0.38, 0],
                rotate: [piece.rotate, piece.rotate * 0.2, 0],
                scale: [0.7, 0.88, 1],
                opacity: [0, 1, 1],
              }}
              transition={{ delay: 1.08, duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src="/resiliai-symbol.svg"
                alt=""
                className={`absolute h-[200%] w-[200%] max-w-none invert ${piece.className.includes("right") ? "right-0" : "left-0"} ${piece.className.includes("bottom") ? "bottom-0" : "top-0"}`}
              />
            </motion.div>
          ))}
          <motion.span
            className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 11] }}
            transition={{ delay: 2.22, duration: 0.34, ease: "easeOut" }}
            style={{ boxShadow: "0 0 22px 7px rgba(245,250,255,0.3)" }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.42, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="mt-[10px] text-[clamp(1rem,3.75vw,2.1rem)] font-black leading-none text-white"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          RESILI AI
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------------
   AUTH + PROFILE
--------------------------------------------------------------------- */
const AUTH_GMAIL_ONLY = process.env.NEXT_PUBLIC_AUTH_GMAIL_ONLY !== "false";

function avatarUrl(user: FirebaseUser | null | undefined) {
  if (user?.photoURL) return user.photoURL;
  const seed = encodeURIComponent(user?.uid || user?.email || "resiliai-user");
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=0ea5e9,14b8a6,f59e0b&fontFamily=Arial&fontWeight=700`;
}

function LoginPage({ onLogin, loading, error }) {
  const [sceneTilt, setSceneTilt] = useState({ x: 0, y: 0 });
  const [panelTilt, setPanelTilt] = useState({ x: 0, y: 0 });
  const particles = Array.from({ length: 24 }, (_, index) => ({
    left: `${(index * 41) % 100}%`,
    top: `${(index * 67) % 100}%`,
    delay: `${(index % 8) * 0.55}s`,
    size: `${1 + (index % 3) * 0.6}px`,
  }));
  const contourLines = Array.from({ length: 7 }, (_, index) => index);
  const backgroundWaves = Array.from({ length: 11 }, (_, index) => index);
  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setSceneTilt({ x: x * 7, y: y * -5 });
    setPanelTilt({ x: x * 3.5, y: y * -3 });
  };
  return (
    <main className="login-shell relative flex min-h-screen items-center overflow-hidden bg-[#080d14] px-5 py-8 text-white sm:px-10" onPointerMove={handlePointerMove} onPointerLeave={() => { setSceneTilt({ x: 0, y: 0 }); setPanelTilt({ x: 0, y: 0 }); }}>
      <div className="login-atmosphere pointer-events-none absolute inset-0">
        <div className="login-wave-field">{backgroundWaves.map((line) => <span key={line} style={{ "--wave-index": line } as React.CSSProperties} />)}</div><div className="login-noise" /><div className="login-particles">{particles.map((particle, index) => <span key={index} style={{ left: particle.left, top: particle.top, animationDelay: particle.delay, width: particle.size, height: particle.size }} />)}</div>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="login-visual hidden min-h-[540px] lg:block" style={{ transform: `rotateX(${sceneTilt.y}deg) rotateY(${sceneTilt.x}deg)` }}>
          <div className="login-eyebrow"><Activity className="h-3.5 w-3.5" /> RESILIENCE INTELLIGENCE NETWORK</div>
          <div className="terrain-scene"><div className="terrain-ambient" /><div className="terrain-floor" /><div className="terrain-slab"><div className="terrain-contours">{contourLines.map((line) => <span key={line} />)}</div><span className="terrain-marker marker-cyan" /><span className="terrain-marker marker-orange" /><span className="terrain-marker marker-red" /></div></div>
          <div className="login-callout login-callout-top"><span className="status-dot danger" /> Waterlogging watch</div>
          <div className="login-callout login-callout-bottom"><span className="text-[9px] font-bold tracking-[0.18em] text-cyan-300/70">AI RISK MODEL</span><strong>Rainfall anomaly<br />detected near Pune basin</strong></div>
          <div className="login-location"><MapPin className="h-3 w-3 text-cyan-300" /> Pune basin <span>·</span> 18.52°N 73.85°E</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }} className="w-full" style={{ transform: `perspective(900px) rotateX(${panelTilt.y}deg) rotateY(${panelTilt.x}deg)` }}>
          <GlassPanel className="login-card border-cyan-200/15 bg-[#08131c]/95 p-6 shadow-[0_24px_100px_rgba(0,0,0,.58),0_0_42px_rgba(14,165,233,.08)] sm:p-7">
            <div className="mb-7 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10"><Shield className="h-4 w-4 text-cyan-200" /></span><div><div className="text-[15px] font-bold tracking-tight text-white">ResiliAI</div><p className="text-[10px] text-white/40">Disaster resilience intelligence</p></div></div>
            <h1 className="login-headline max-w-[300px] text-[31px] font-bold leading-[0.98] tracking-[-0.04em] text-white sm:text-[34px]">Build resilience<br />before the crisis.</h1>
            <p className="mt-4 max-w-[290px] text-[12px] leading-5 text-white/50">Real-time disaster intelligence<br />for safer, stronger communities.</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-2.5 py-1 text-[10px] font-semibold text-cyan-100/80"><span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(94,234,212,.9)]" /> Live monitoring across Maharashtra</div>
            {error && <motion.div animate={{ x: [0, -5, 5, -3, 3, 0] }} className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-[11px] text-red-200">{error}</motion.div>}
            <button disabled={loading || !firebaseConfigured} onClick={onLogin} className="mt-5 flex w-full items-center justify-center gap-3 rounded-[10px] border border-white/80 bg-[#f3f7f8] px-4 py-3 text-[12px] font-bold text-[#16242c] shadow-[0_0_0_2px_rgba(255,255,255,.15),0_8px_24px_rgba(0,0,0,.18)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#4285f4] shadow-sm">G</span>}{loading ? "Connecting to Google..." : "Continue with Google"}</button>
            {!firebaseConfigured && <p className="mt-3 text-center text-[10px] text-amber-200/70">Add Firebase credentials to `.env.local` to enable Google sign-in.</p>}
            <div className="mt-4 flex gap-4 text-[10px]"><a href="#privacy" className="text-white/45 hover:text-white/80">Privacy Policy</a><a href="#emergency" className="text-amber-300/80 hover:text-amber-200">Emergency Resources</a></div>
            <p className="mt-5 max-w-[250px] text-[10px] leading-4 text-white/35">Built for citizens, responders, volunteers,<br />and command-center administrators.</p>
          </GlassPanel>
        </motion.div>
      </div>
    </main>
  );
}

function ProfilePage({ user, onSignOut }: { user: FirebaseUser | null; onSignOut: () => void }) {
  const [role, setRole] = useState(() => typeof window === "undefined" ? "Citizen" : localStorage.getItem("resiliai-role") || "Citizen");
  const [region, setRegion] = useState(() => typeof window === "undefined" ? "Pune - Lonavala" : localStorage.getItem("resiliai-region") || "Pune - Lonavala");
  const [language, setLanguage] = useState("English");
  const [threshold, setThreshold] = useState("High");
  const [saved, setSaved] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const saveProfile = () => { localStorage.setItem("resiliai-role", role); localStorage.setItem("resiliai-region", region); setSaved(true); window.setTimeout(() => setSaved(false), 1800); };
  return <div className="mx-auto max-w-4xl space-y-5"><div><h2 className="text-xl font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>Your profile</h2><p className="mt-1 text-[13px] text-white/40">Personalize alerts and response context for your account.</p></div><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><GlassPanel className="p-5"><div className="flex items-center gap-4 border-b border-white/[0.07] pb-5"><img src={user?.photoURL || "/resiliai-symbol.svg"} alt="" className="h-16 w-16 rounded-full border border-white/10 object-cover" /><div><h3 className="text-lg font-semibold text-white">{user?.displayName || "ResiliAI user"}</h3><p className="text-[13px] text-white/45">{user?.email}</p><span className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Google account verified</span></div></div><div className="mt-5 space-y-4"><label className="block text-[12px] text-white/45">Role / designation<select value={role} onChange={(event) => setRole(event.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1420] px-3 py-2 text-[13px] text-white/80 outline-none"><option>Field Responder</option><option>Command Center Admin</option><option>Community Volunteer</option><option>Citizen</option></select></label><label className="block text-[12px] text-white/45">Preferred region<select value={region} onChange={(event) => setRegion(event.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1420] px-3 py-2 text-[13px] text-white/80 outline-none"><option>Pune - Wakad</option><option>Pune - Baner</option><option>Pune - Aundh</option><option>Pune - Hadapsar</option><option>Pune - Katraj</option><option>Lonavala - Western Ghats</option></select></label><label className="block text-[12px] text-white/45">Emergency contact<input placeholder="Name · phone number" className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-white/80 outline-none placeholder:text-white/25" /></label><button onClick={saveProfile} className="flex items-center gap-2 rounded-lg bg-sky-400/90 px-4 py-2 text-[12px] font-semibold text-[#04101a]">{saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}{saved ? "Saved" : "Save preferences"}</button></div></GlassPanel><GlassPanel className="p-5"><h3 className="text-[13px] font-medium text-white/75">Notifications & access</h3><div className="mt-4 space-y-3 text-[13px] text-white/65"><label className="flex items-center justify-between">SMS alerts<input type="checkbox" defaultChecked className="accent-sky-400" /></label><label className="flex items-center justify-between">Email alerts<input type="checkbox" defaultChecked className="accent-sky-400" /></label><label className="flex items-center justify-between">Push alerts<input type="checkbox" defaultChecked className="accent-sky-400" /></label><label className="block pt-2 text-[12px] text-white/45">Alert threshold<select value={threshold} onChange={(event) => setThreshold(event.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1420] px-3 py-2 text-[13px] text-white/80 outline-none"><option>Low</option><option>Moderate</option><option>High</option><option>Critical</option></select></label><label className="block text-[12px] text-white/45">Language<select value={language} onChange={(event) => setLanguage(event.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1420] px-3 py-2 text-[13px] text-white/80 outline-none"><option>English</option><option>Hindi</option><option>Marathi</option></select></label></div><div className="mt-6 border-t border-white/[0.07] pt-4"><h4 className="text-[12px] text-white/55">Saved zones</h4><div className="mt-2 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-200"><Star className="h-3 w-3" /> Wakad</span><span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/55"><Star className="h-3 w-3" /> Lonavala</span></div></div><div className="mt-6 border-t border-white/[0.07] pt-4"><h4 className="text-[12px] text-white/55">Recent activity</h4><p className="mt-2 text-[12px] text-white/45">Report acknowledged · Wakad · 12 min ago</p><p className="mt-1 text-[12px] text-white/45">Flood alert viewed · Pune · Yesterday</p></div></GlassPanel></div><GlassPanel className="flex items-center justify-between gap-4 border-red-400/20 p-4"><div><p className="text-[13px] font-medium text-white/80">Sign out of ResiliAI</p><p className="mt-0.5 text-[12px] text-white/40">You can sign back in with Google at any time.</p></div><button onClick={() => setSignOutOpen(true)} className="flex items-center gap-2 rounded-lg border border-red-400/30 px-3 py-2 text-[12px] text-red-200"><LogOut className="h-3.5 w-3.5" /> Sign out</button></GlassPanel>{signOutOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"><GlassPanel className="w-full max-w-sm p-5"><h3 className="font-semibold text-white">Sign out?</h3><p className="mt-2 text-[13px] text-white/50">Your saved preferences remain on this device.</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setSignOutOpen(false)} className="rounded-lg px-3 py-2 text-[12px] text-white/55">Cancel</button><button onClick={onSignOut} className="rounded-lg bg-red-400/90 px-3 py-2 text-[12px] font-semibold text-[#1a0404]">Confirm sign out</button></div></GlassPanel></div>}</div>;
}

function AuthGate({ children }: { children: React.ReactElement<{ user?: FirebaseUser | null }> }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!firebaseAuth) { setChecking(false); return; }

    const timeout = window.setTimeout(() => {
      setChecking(false);
      setError("Authentication is taking too long to respond. You can try signing in again.");
    }, 5000);
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (nextUser) => {
        window.clearTimeout(timeout);
        setUser(nextUser);
        setChecking(false);
      },
      () => {
        window.clearTimeout(timeout);
        setChecking(false);
        setError("Authentication could not be initialized. Please try again.");
      },
    );

    return () => {
      window.clearTimeout(timeout);
      unsubscribe();
    };
  }, []);
  const login = async () => {
    if (!firebaseAuth) return;
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      if (AUTH_GMAIL_ONLY && !result.user.email?.toLowerCase().endsWith("@gmail.com")) {
        await signOut(firebaseAuth);
        throw new Error("Please use a personal @gmail.com account. Workspace access can be enabled in NEXT_PUBLIC_AUTH_GMAIL_ONLY.");
      }
    } catch (authError) {
      const code = authError && typeof authError === "object" && "code" in authError ? authError.code : "";
      if (code === "auth/popup-blocked") {
        await signInWithRedirect(firebaseAuth, new GoogleAuthProvider());
        return;
      }
      setError(authError instanceof Error ? authError.message : "Google sign-in could not be completed.");
    } finally {
      setLoading(false);
    }
  };
  if (checking) return <div className="flex min-h-screen items-center justify-center bg-[#080B12] text-white/50"><LoaderCircle className="h-5 w-5 animate-spin" /></div>;
  if (!user) return <LoginPage onLogin={login} loading={loading} error={error} />;
  return React.cloneElement(children, { user });
}

/* ---------------------------------------------------------------------
   NAVBAR
--------------------------------------------------------------------- */
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "map", label: "Risk map", icon: MapIcon },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "community", label: "Community", icon: Users },
  { id: "command", label: "Command center", icon: Radio },
  { id: "assistant", label: "Assistant", icon: Bot },
  { id: "about", label: "About", icon: Info },
];

function Navbar({ active, setActive, demoMode, setDemoMode, alertCount, user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#080B12]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-5">
          <div className="flex items-center gap-2.5 shrink-0">
            <motion.img
              src="/resiliai-symbol.svg"
              alt="ResiliAI logo"
              className="h-10 w-10 object-contain invert"
              initial={{ rotate: -8, scale: 0.92 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
            <span className="text-[19px] font-semibold tracking-tight text-white" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              RESILI AI
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-1 relative">
            {NAV_ITEMS.map((n) => (
              <button
                key={n.id}
                onClick={() => setActive(n.id)}
                  className={cx(
                    "relative px-4 py-2.5 text-[14px] font-medium rounded-lg transition-colors",
                  active === n.id ? "text-white" : "text-white/50 hover:text-white/80"
                )}
              >
                {n.label}
                {active === n.id && (
                  <motion.span layoutId="nav-indicator" className="absolute inset-0 rounded-lg bg-white/[0.06] -z-10" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                )}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setDemoMode((d) => !d)}
              className={cx(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                demoMode ? "border-amber-400/40 text-amber-300 bg-amber-400/10" : "border-white/10 text-white/50 hover:text-white/80"
              )}
            >
              <span className={cx("w-1.5 h-1.5 rounded-full animate-pulse", demoMode ? "bg-amber-400" : "bg-emerald-400")} />
              {demoMode ? "DEMO" : "LIVE"}
            </button>
            <button className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-[13px] px-2 py-1">
              <MapPin className="w-3.5 h-3.5" /> Pune
            </button>
            <button className="text-white/50 hover:text-white/80 text-[13px] px-2 py-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> EN
            </button>
            <button className="relative w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white/90 hover:bg-white/5">
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-red-400" />
              )}
            </button>
            <button aria-label="Open profile" onClick={() => setActive("profile")} className="h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-sky-400/30 to-indigo-500/30 flex items-center justify-center">
                  <img src={avatarUrl(user)} alt="Profile" className="h-full w-full object-cover" />
            </button>
          </div>

          <button className="lg:hidden text-white/70" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-[#0B0E16] border-l border-white/10 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-white font-semibold">Menu</span>
                <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5 text-white/60" /></button>
              </div>
              <div className="flex flex-col gap-1">
                {NAV_ITEMS.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { setActive(n.id); setMobileOpen(false); }}
                    className={cx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
                      active === n.id ? "bg-white/[0.07] text-white" : "text-white/55"
                    )}
                  >
                    <n.icon className="w-4 h-4" /> {n.label}
                  </button>
                ))}
                <button onClick={() => { setActive("profile"); setMobileOpen(false); }} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/55"><User className="h-4 w-4" /> Profile</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.07] bg-[#080B12]/90 backdrop-blur-xl px-2 py-1.5 flex justify-around">
        {NAV_ITEMS.slice(0, 5).map((n) => (
          <button key={n.id} onClick={() => setActive(n.id)} className="flex flex-col items-center gap-1 px-2 py-1.5 min-w-[56px]">
            <n.icon className={cx("w-[18px] h-[18px]", active === n.id ? "text-sky-300" : "text-white/40")} />
            <span className={cx("text-[10px]", active === n.id ? "text-sky-300" : "text-white/40")}>{n.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------
   STAT CARD
--------------------------------------------------------------------- */
function StatCard({ icon: Icon, label, value, suffix = "", delay, tone = "sky", delta = "+8%" }) {
  const toneMap = {
    sky: "from-sky-400/15 to-sky-500/5 text-sky-300",
    red: "from-red-400/15 to-red-500/5 text-red-300",
    amber: "from-amber-400/15 to-amber-500/5 text-amber-300",
    emerald: "from-emerald-400/15 to-emerald-500/5 text-emerald-300",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="group"
    >
      <GlassPanel className={cx("h-full border-l-2 p-3 transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]", tone === "red" ? "border-l-red-400/70" : tone === "amber" ? "border-l-orange-400/70" : tone === "sky" ? "border-l-sky-400/70" : "border-l-emerald-400/70")}>
        <div className={cx("mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br", toneMap[tone])}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-2"><div className="text-xl font-semibold text-white tabular-nums" style={{ fontFamily: "Manrope, sans-serif" }}>
          <CountUp value={value} />{suffix}
        </div><span className="text-[10px] font-medium text-emerald-300">↑ {delta}</span></div>
        <div className="mt-0.5 text-[11px] text-white/45">{label}</div>
      </GlassPanel>
    </motion.div>
  );
}

/* ---------------------------------------------------------------------
   OVERVIEW PAGE
--------------------------------------------------------------------- */
function MiniMapPreview({ zones = [], onNavigate }) {
  const positions = { wakad: [25, 27], baner: [39, 35], aundh: [45, 47], katraj: [64, 79], hadapsar: [81, 63] };
  return (
    <GlassPanel className="overflow-hidden p-5">
      <div className="mb-3 flex items-center justify-between"><span className="text-[13px] font-medium text-white/70">Live zone map</span><button onClick={() => onNavigate("map")} className="flex items-center gap-1 text-[12px] text-sky-300/80 hover:text-sky-200">Open full map <ChevronRight className="h-3.5 w-3.5" /></button></div>
      <div className="relative h-44 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0c1b25]" style={{ backgroundImage: "linear-gradient(rgba(125,211,252,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }}>
        <div className="absolute left-[8%] top-[65%] h-px w-[80%] rotate-[-21deg] bg-sky-300/20" /><div className="absolute left-[12%] top-[45%] h-px w-[70%] rotate-[17deg] bg-white/10" />
        <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.18em] text-white/25">Pune region · Lonavala corridor</span>
        {zones.map((zone) => { const position = positions[zone.id] || [50, 50]; const level = riskFromScore(zone.baseRisk); return <button key={zone.id} onClick={() => { onNavigate("map"); }} title={`${zone.name} · ${zone.baseRisk}% risk`} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70 shadow-[0_0_0_6px_rgba(255,255,255,0.06)] transition-transform hover:scale-125" style={{ left: `${position[0]}%`, top: `${position[1]}%`, width: `${18 + zone.reports / 2}px`, height: `${18 + zone.reports / 2}px`, background: RISK[level].color }}><span className="text-[8px] font-bold text-[#04101a]">{zone.baseRisk}</span></button>; })}
      </div>
    </GlassPanel>
  );
}

function Overview({ globalRisk, weather, onNavigate, onSelectZone, zones }) {
  const [insightVisible, setInsightVisible] = useState(true);
  const [updatedSeconds, setUpdatedSeconds] = useState(34);
  const [range, setRange] = useState("Today");
  useEffect(() => { const timer = window.setInterval(() => setUpdatedSeconds((seconds) => seconds + 1), 1000); return () => window.clearInterval(timer); }, []);
  const liveRisk = Math.max(0, Math.min(100, globalRisk + (updatedSeconds % 11 === 0 ? 1 : 0)));
  const level = riskFromScore(liveRisk);
  const chartData = range === "Today" ? TREND_DATA.map((point, index) => ({ ...point, risk: Math.max(0, point.risk + (updatedSeconds % 7 === index ? 1 : 0)) })) : range === "7 Days" ? [{ t: "Mon", risk: 35 }, { t: "Tue", risk: 42 }, { t: "Wed", risk: 48 }, { t: "Thu", risk: 51 }, { t: "Fri", risk: 58 }, { t: "Sat", risk: 64 }, { t: "Today", risk: liveRisk }] : [{ t: "Week 1", risk: 28 }, { t: "Week 2", risk: 39 }, { t: "Week 3", risk: 52 }, { t: "Today", risk: liveRisk }];
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-[26px] md:text-[30px] font-semibold text-white tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
          Good morning. Here's your community risk overview.
        </h1>
        <div className="flex items-center gap-2 mt-1.5 text-[13px] text-white/45">
          <span>Pune region</span><span className="text-white/20">•</span><LiveDot /><span className="tabular-nums">Updated {updatedSeconds} seconds ago</span>
        </div>
      </motion.div>

      {insightVisible && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 rounded-xl border border-red-400/25 border-l-2 border-l-red-400 bg-red-400/[0.07] px-4 py-2.5 shadow-[0_0_24px_rgba(228,87,79,0.07)]"><div className="flex min-w-0 items-center gap-3"><motion.span animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 1.8, repeat: Infinity }} className="h-2 w-2 shrink-0 rounded-full bg-red-400 shadow-[0_0_10px_rgba(228,87,79,.8)]" /><p className="truncate text-[12px] text-white/75"><span className="font-semibold text-red-300">AI Alert</span> Rainfall trend suggests Wakad may cross critical threshold in ~6 hours.</p><button onClick={() => { onSelectZone("wakad"); onNavigate("map"); }} className="shrink-0 text-[12px] text-sky-300 hover:text-sky-200">View details <ChevronRight className="inline h-3.5 w-3.5" /></button></div><button aria-label="Dismiss insight" onClick={() => setInsightVisible(false)} className="shrink-0 text-white/35 hover:text-white"><X className="h-3.5 w-3.5" /></button></motion.div>}

      {level === "critical" || level === "high" ? (
        <motion.div
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 border"
          style={{ background: RISK[level].bg, borderColor: RISK[level].ring }}
        >
          <div className="flex items-center gap-3">
            <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
              <AlertTriangle className="w-4 h-4" style={{ color: RISK[level].color }} />
            </motion.span>
            <p className="text-[13px] text-white/80">
              <span className="font-medium" style={{ color: RISK[level].color }}>Critical rainfall risk in Lonavala.</span>{" "}
              Estimated risk has risen to {Math.round(globalRisk)}% due to heavy rainfall.
            </p>
          </div>
          <button onClick={() => onNavigate("alerts")} className="shrink-0 text-[12px] text-white/70 hover:text-white flex items-center gap-1">
            View <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassPanel className="lg:col-span-1 p-6 flex flex-col items-center justify-center gap-4">
          <div className="w-full flex items-center justify-between text-[11px] uppercase tracking-wider text-white/40">
            <span>Current regional risk</span>
            <RiskBadge level={level} size="sm" />
          </div>
          <RiskGauge value={liveRisk} level={level} size={184} />
          <div className="grid grid-cols-2 gap-3 w-full text-[13px]">
            <div className="flex items-center gap-2 text-white/55"><Droplets strokeWidth={1.8} className="w-3.5 h-3.5 text-sky-300/70" /> Rainfall <span className="ml-auto text-white/85">{weather.rainfall} mm <small className="text-emerald-300">↑ 12%</small></span></div>
            <div className="flex items-center gap-2 text-white/55"><Wind strokeWidth={1.8} className="w-3.5 h-3.5 text-sky-300/70" /> Humidity <span className="ml-auto text-white/85">{weather.humidity}% <small className="text-emerald-300">↑ 4%</small></span></div>
            <div className="flex items-center gap-2 text-white/55"><Activity strokeWidth={1.8} className="w-3.5 h-3.5 text-sky-300/70" /> Incidents <span className="ml-auto text-white/85">{weather.incidents} <small className="text-red-300">↑ 9%</small></span></div>
            <div className="flex items-center gap-2 text-white/55"><TrendingUp className="w-3.5 h-3.5 text-red-300/70" /> Trend <span className="ml-auto text-red-300">↑ 14%</span></div>
          </div>
        </GlassPanel>

        <GlassPanel className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-white/70">Risk trend</span>
            <div className="flex gap-1 rounded-lg border border-white/[0.07] p-0.5">{["Today", "7 Days", "30 Days"].map((option) => <button key={option} onClick={() => setRange(option)} className={cx("rounded-md px-2 py-1 text-[10px]", range === option ? "bg-white/[0.09] text-white/80" : "text-white/35 hover:text-white/65")}>{option}</button>)}</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E38A46" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#E38A46" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <ReferenceLine y={70} stroke="#E4574F" strokeDasharray="5 5" strokeOpacity={0.65} label={{ value: "Danger threshold", fill: "#E4574F", fontSize: 10, position: "insideTopRight" }} />
              <Tooltip contentStyle={{ background: "#0E1320", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }} labelStyle={{ color: "rgba(255,255,255,0.6)" }} />
              <Area type="monotone" dataKey="risk" stroke="#E38A46" strokeWidth={2} fill="url(#riskFill)" animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Siren} label="Critical zones" value={4} delay={0.05} tone="red" delta="14%" />
        <StatCard icon={AlertTriangle} label="High risk zones" value={8} delay={0.12} tone="amber" delta="8%" />
        <StatCard icon={MessageSquare} label="Active reports" value={27} delay={0.19} tone="sky" delta="21%" />
        <StatCard icon={Building2} label="Emergency shelters" value={12} delay={0.26} tone="emerald" delta="3%" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <GlassPanel className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[13px] font-medium text-white/70">Hyperlocal snapshot</span>
          <button onClick={() => onNavigate("map")} className="text-[12px] text-sky-300/80 hover:text-sky-200 flex items-center gap-1">
            Open full map <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {ZONES.map((z, i) => {
            const lvl = riskFromScore(z.baseRisk);
            return (
              <motion.button
                key={z.id}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }}
                onClick={() => { onSelectZone(z.id); onNavigate("map"); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[13px] text-white/80 hover:bg-white/[0.05] transition-colors"
                style={{ borderColor: RISK[lvl].ring, background: RISK[lvl].bg }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: RISK[lvl].color }} />
                {z.name} <span className="text-white/40">{z.baseRisk}%</span>
              </motion.button>
            );
          })}
        </div>
      </GlassPanel>
      <MiniMapPreview zones={zones} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   RISK MAP PAGE
--------------------------------------------------------------------- */
function RiskMapPage({ zones, selected, setSelected }) {
  const [layer, setLayer] = useState("rainfall");
  const [basemap, setBasemap] = useState("dark");
  const [forecast, setForecast] = useState(0);
  const [showFacilities, setShowFacilities] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [query, setQuery] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const baseRef = useRef(null);
  const overlayRef = useRef(null);
  const facilityRef = useRef(null);
  const active = zones.find((z) => z.id === selected) || null;
  const focusPune = useCallback(() => mapRef.current?.flyTo([18.52, 73.86], 11.3, { duration: 0.45 }), []);

  useEffect(() => {
    let disposed = false;
    import("leaflet").then(({ default: L }) => {
      if (disposed || !mapElement.current || mapRef.current) return;
      const map = L.map(mapElement.current, { zoomControl: false }).setView([18.54, 73.84], 11.45);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      const dark = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", { attribution: "Tiles &copy; Esri", maxZoom: 16 });
      const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { attribution: "Tiles &copy; Esri", maxZoom: 19 });
      const terrain = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenTopoMap", maxZoom: 17 });
      const hybrid = L.layerGroup([satellite, L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}")]);
      baseRef.current = { dark, satellite, terrain, hybrid };
      dark.addTo(map);
      L.geoJSON({ type: "Feature", properties: { name: "Maharashtra" }, geometry: { type: "Polygon", coordinates: [[[72.65,20.0],[73.25,18.0],[72.8,16.1],[74.2,15.6],[75.6,15.6],[77.0,16.2],[80.0,16.5],[80.7,18.2],[80.4,20.4],[78.4,21.9],[76.2,21.8],[74.4,21.1],[72.65,20.0]]] } } as any, { style: { color: "#59b9d3", weight: 1.5, fillColor: "#14313c", fillOpacity: 0.2, dashArray: "5 6" } }).addTo(map);
      mapRef.current = map;
      window.setTimeout(() => { map.flyTo([18.52, 73.86], 11.1, { duration: 0.5 }); setMapReady(true); }, 350);
    });
    return () => { disposed = true; mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const base = baseRef.current?.[basemap];
    if (!map || !base) return;
    (Object.values(baseRef.current) as any[]).forEach((item) => item?.remove?.());
    base.addTo(map);
  }, [basemap]);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then(({ default: L }) => {
      const map = mapRef.current;
      if (!map || cancelled) return;
      overlayRef.current?.clearLayers();
      const group = L.layerGroup().addTo(map);
      overlayRef.current = group;
      if (layer === "flood") {
        L.polyline([[18.64,73.72],[18.61,73.77],[18.56,73.81],[18.53,73.86],[18.5,73.91],[18.47,73.94]], { color: "#ef6c73", weight: 8, opacity: 0.45, lineCap: "round" }).addTo(group);
        L.polyline([[18.74,73.41],[18.68,73.52],[18.62,73.66],[18.58,73.77]], { color: "#f0b44d", weight: 5, opacity: 0.65, dashArray: "7 8" }).addTo(group);
      } else if (layer === "rainfall" || layer === "vulnerability") {
        zones.forEach((zone) => { const value = layer === "rainfall" ? Math.min(100, zone.rainfall * (1 + forecast * 0.08) / 1.2) : zone.vulnerability; const color = RISK[riskFromScore(value)].color; L.circle([zone.lat, zone.lng], { radius: 900 + value * 11, color, fillColor: color, fillOpacity: 0.13, weight: 1 }).addTo(group); });
      } else {
        zones.forEach((zone) => L.circleMarker([zone.lat, zone.lng], { radius: 5 + zone.reports / 2, color: "#7dd3fc", fillColor: "#7dd3fc", fillOpacity: 0.72, weight: 1 }).bindTooltip(`${zone.reports} reports · ${zone.name}`).addTo(group));
      }
      zones.forEach((zone) => {
        const level = riskFromScore(zone.baseRisk);
        const scale = 30 + zone.reports * 1.5;
        const pulsing = level === "high" || level === "critical" ? " risk-pulse" : "";
        const icon = L.divIcon({ className: "resilia-zone-marker", html: `<span class="${pulsing}" style="--marker-color:${RISK[level].color};width:${scale}px;height:${scale}px">${zone.baseRisk}</span>`, iconSize: [scale, scale], iconAnchor: [scale / 2, scale / 2] });
        L.marker([zone.lat, zone.lng], { icon }).on("click", () => { if (compareMode) { setCompareIds((ids) => ids.includes(zone.id) ? ids.filter((id) => id !== zone.id) : [...ids, zone.id]); } else { setSelected(zone.id); } map.flyTo([zone.lat, zone.lng], 13, { duration: 0.4 }); }).bindTooltip(`${zone.name} · ${zone.baseRisk}% risk`, { direction: "top", offset: [0, -scale / 2] }).addTo(group);
      });
      LOCALITIES.forEach((place) => L.circleMarker([place.lat, place.lng], { radius: 3, color: "#b9d8df", fillColor: "#b9d8df", fillOpacity: 0.8, weight: 1 }).bindTooltip(place.name, { direction: "right" }).addTo(group));
    });
    return () => { cancelled = true; };
  }, [compareMode, layer, forecast, zones, setSelected]);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then(({ default: L }) => {
      const map = mapRef.current;
      if (!map || cancelled) return;
      facilityRef.current?.clearLayers();
      if (!showFacilities) return;
      const group = L.layerGroup().addTo(map);
      facilityRef.current = group;
      FACILITIES.forEach((facility) => { const symbol = facility.type === "Hospital" ? "✚" : facility.type === "Shelter" ? "⌂" : "◆"; L.marker([facility.lat, facility.lng], { icon: L.divIcon({ className: "facility-marker", html: `<span aria-label="${facility.type}">${symbol}</span>`, iconSize: [30, 30], iconAnchor: [15, 15] }) }).bindTooltip(`${facility.name} · ${facility.type}`).addTo(group); });
    });
    return () => { cancelled = true; };
  }, [showFacilities]);

  const searchPlace = async (event) => {
    event.preventDefault();
    if (!query.trim() || !mapRef.current) return;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&viewbox=72.5,21.9,80.9,15.5&bounded=1&q=${encodeURIComponent(query.trim() + ", Maharashtra")}`);
    const results = await response.json();
    if (results[0]) mapRef.current.flyTo([Number(results[0].lat), Number(results[0].lon)], 13, { duration: 0.45 });
  };

  const compared = zones.filter((zone) => compareIds.includes(zone.id));
  const legend = layer === "flood" ? ["Drainage corridor", "Ghats corridor"] : layer === "reports" ? ["Community report density"] : layer === "vulnerability" ? ["Low vulnerability", "Moderate vulnerability", "High vulnerability"] : [`Forecast rainfall +${forecast * 3}h`, "Heavy rainfall zones"];
  const basemapOptions: Array<[string, string, React.ElementType]> = [["dark", "Default", Layers], ["satellite", "Satellite", Satellite], ["hybrid", "Hybrid", Layers], ["terrain", "Terrain", Mountain]];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3"><div><h2 className="text-xl font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>Pune rainfall risk map</h2><p className="text-[13px] text-white/40 mt-0.5">Maharashtra overview · Pune region · Lonavala / Western Ghats corridor</p></div><div className="flex gap-1.5 flex-wrap">{[["rainfall", "Rainfall risk"], ["flood", "Flood risk"], ["vulnerability", "Vulnerability"], ["reports", "Community reports"]].map(([id, label]) => <button key={id} onClick={() => setLayer(id)} className={cx("px-3 py-1.5 rounded-lg text-[12px] border transition-colors", layer === id ? "bg-sky-400/15 border-sky-400/40 text-sky-200" : "border-white/10 text-white/45 hover:text-white/75")}>{label}</button>)}<button onClick={() => { setCompareMode((value) => !value); setCompareIds([]); }} className={cx("rounded-lg border px-3 py-1.5 text-[12px]", compareMode ? "border-amber-400/40 bg-amber-400/10 text-amber-200" : "border-white/10 text-white/45 hover:text-white/75")}>Compare{compareMode && compareIds.length ? ` (${compareIds.length})` : ""}</button></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassPanel className="lg:col-span-2 p-3 relative overflow-hidden"><div className="relative h-[520px] overflow-hidden rounded-xl"><div ref={mapElement} className="h-full w-full bg-[#10202b]" />{!mapReady && <div className="absolute inset-0 z-[500] animate-pulse bg-[#0e1a24] p-6"><div className="h-4 w-40 rounded bg-white/10" /><div className="mt-4 h-full rounded-xl bg-white/[0.03]" /></div>}
          <div className="absolute left-3 right-3 top-3 z-[600] flex flex-col gap-2 sm:left-4 sm:right-4 sm:top-4"><form onSubmit={searchPlace} className="flex w-full max-w-[270px] items-center gap-2 rounded-xl border border-white/10 bg-[#080f18]/95 px-3 py-2 shadow-xl backdrop-blur-md"><Search className="h-4 w-4 shrink-0 text-white/45" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Maharashtra locality" className="min-w-0 flex-1 bg-transparent text-[12px] text-white outline-none placeholder:text-white/35" /></form><div className="flex max-w-full flex-wrap gap-1 self-start rounded-xl border border-white/10 bg-[#080f18]/95 p-1 shadow-xl backdrop-blur-md">{basemapOptions.map(([id, label, Icon]) => <button key={id} title={label} onClick={() => setBasemap(id)} className={cx("flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px]", basemap === id ? "bg-sky-400/15 text-sky-200" : "text-white/45 hover:text-white/80")}><Icon className="h-3.5 w-3.5" /><span>{label}</span></button>)}</div></div>
          <button onClick={focusPune} className="absolute bottom-20 right-4 z-[600] flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#080f18]/95 px-2.5 py-2 text-[11px] text-sky-200 shadow-xl backdrop-blur-md"><LocateFixed className="h-3.5 w-3.5" /> Focus: Pune</button><div className="absolute bottom-4 left-4 z-[600] flex max-w-[calc(100%-32px)] flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-[#080f18]/95 px-3 py-2 text-[11px] text-white/55 shadow-xl backdrop-blur-md">{legend.map((item, index) => <span key={item} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: layer === "flood" ? (index ? "#f0b44d" : "#ef6c73") : index === 0 ? "#3fc98a" : index === 1 ? "#e7b94c" : "#e4574f" }} />{item}</span>)}</div></div><div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-3 text-[11px] sm:grid-cols-4"><div className="rounded-lg border-l-2 border-sky-400/60 bg-sky-400/[0.05] px-2.5 py-2"><span className="block text-white/40">Zones tracked</span><strong className="text-white/85">{zones.length}</strong></div><div className="rounded-lg border-l-2 border-red-400/60 bg-red-400/[0.05] px-2.5 py-2"><span className="block text-white/40">Critical zones</span><strong className="text-white/85">{zones.filter((zone) => riskFromScore(zone.baseRisk) === "critical").length}</strong></div><div className="rounded-lg border-l-2 border-amber-400/60 bg-amber-400/[0.05] px-2.5 py-2"><span className="block text-white/40">Avg rainfall</span><strong className="text-white/85">{Math.round(zones.reduce((sum, zone) => sum + zone.rainfall, 0) / Math.max(zones.length, 1))} mm</strong></div><div className="rounded-lg border-l-2 border-sky-400/60 bg-sky-400/[0.05] px-2.5 py-2"><span className="block text-white/40">Active reports</span><strong className="text-white/85">{zones.reduce((sum, zone) => sum + zone.reports, 0)}</strong></div></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-[11px] text-white/50"><input type="checkbox" checked={showFacilities} onChange={(event) => setShowFacilities(event.target.checked)} className="accent-sky-400" /><Hospital className="h-3.5 w-3.5 text-emerald-300" /> Shelters, hospitals & relief centres</label>{layer === "rainfall" && <div className="min-w-[245px]"><div className="flex items-center justify-between text-[11px] text-white/50"><span>Forecast intensity</span><span className="text-sky-200">{["Now", "+3h", "+6h", "+24h"][forecast]}</span></div><input aria-label="Rainfall forecast" type="range" min="0" max="3" value={forecast} onChange={(event) => setForecast(Number(event.target.value))} className="w-full accent-sky-400" /><div className="flex justify-between text-[10px] text-white/30"><span>Now</span><span>+3h</span><span>+6h</span><span>+24h</span></div></div>}</div></GlassPanel>
        <div className="lg:col-span-1">
          {compareMode && compared.length > 1 ? <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{compared.map((zone) => <GlassPanel key={zone.id} className="p-4"><div className="mb-3 flex items-start justify-between gap-2"><div><h3 className="text-base font-semibold text-white">{zone.name}</h3><RiskBadge level={riskFromScore(zone.baseRisk)} size="sm" /></div><span className="text-xl font-semibold text-white">{zone.baseRisk}%</span></div><div className="space-y-2 text-[12px]"><div className="flex justify-between text-white/50"><span>Vulnerability</span><span className="text-white/85">{zone.vulnerability}%</span></div><div className="flex justify-between text-white/50"><span>Rainfall</span><span className="text-white/85">{zone.rainfall} mm</span></div><div className="flex justify-between text-white/50"><span>Active reports</span><span className="text-white/85">{zone.reports}</span></div></div><button onClick={() => { setSelected(zone.id); setCompareMode(false); setCompareIds([]); }} className="mt-3 w-full rounded-lg border border-sky-400/20 py-1.5 text-[11px] text-sky-300">Open detail</button></GlassPanel>)}</motion.div> : <AnimatePresence mode="wait">
            {active ? <motion.div key={active.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.4 }}>
              <GlassPanel className="p-5">
                <div className="flex items-start justify-between mb-4"><div><h3 className="text-lg font-semibold text-white">{active.name}</h3><RiskBadge level={riskFromScore(active.baseRisk)} size="sm" /></div><RiskGauge value={active.baseRisk} level={riskFromScore(active.baseRisk)} size={72} /></div>
                <div className="space-y-3 text-[13px]">{[["Vulnerability", `${active.vulnerability}%`], ["Rainfall", `${active.rainfall} mm`], ["Active reports", active.reports], ["Nearest shelter", active.shelter], ["Nearest hospital", active.hospital]].map(([label, value]) => <div key={label} className="flex items-center justify-between"><span className="text-white/45">{label}</span><span className="font-medium text-white/85">{value}</span></div>)}</div>
                <div className="mt-4 space-y-1.5">{[["Vulnerability", active.vulnerability], ["Rainfall load", Math.min(100, active.rainfall)]].map(([label, value]) => <div key={label}><div className="mb-1 flex justify-between text-[11px] text-white/40"><span>{label}</span><span>{value}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><motion.div className="h-full rounded-full bg-sky-400/70" initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.9 }} /></div></div>)}</div>
                <button className="mt-5 flex w-full items-center justify-center gap-1 rounded-lg border border-sky-400/20 py-2 text-center text-[13px] text-sky-300 hover:bg-sky-400/5 hover:text-sky-200">View full analysis <ChevronRight className="h-3.5 w-3.5" /></button>
              </GlassPanel>
            </motion.div> : <GlassPanel className="p-8 text-center text-sm text-white/35">Select a zone on the map to view details.</GlassPanel>}
          </AnimatePresence>}
        </div>
      </div>
    </div>
  );
}

/* Legacy SVG map retained temporarily for data migration reference.
  const [layer, setLayer] = useState("rainfall");
  const active = zones.find((z) => z.id === selected) || null;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>Pune rainfall risk map</h2>
          <p className="text-[13px] text-white/40 mt-0.5">Pune region - Lonavala corridor - Click a zone for details.</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
              {[["rainfall", "Rainfall risk"], ["flood", "Flood risk"], ["vulnerability", "Vulnerability"], ["reports", "Community reports"]].map(([id, label]) => (
            <button key={id} onClick={() => setLayer(id)}
              className={cx("px-3 py-1.5 rounded-lg text-[12px] border transition-colors",
                layer === id ? "bg-sky-400/15 border-sky-400/40 text-sky-200" : "border-white/10 text-white/45 hover:text-white/75")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassPanel className="lg:col-span-2 p-4 relative overflow-hidden">
          <svg viewBox="0 0 560 380" className="w-full h-[420px]" role="img" aria-label="Pune rainfall risk map">
            <defs>
              <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M28 0H0V28" fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
              </pattern>
              <linearGradient id="mapLand" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#12202a" />
                <stop offset="100%" stopColor="#0b141d" />
              </linearGradient>
            </defs>
            <rect width="560" height="380" rx="18" fill="url(#mapLand)" />
            <path d="M82 42 C142 20 218 34 270 70 C327 109 370 99 421 130 C477 164 493 231 466 290 C430 349 337 350 278 325 C221 301 175 323 120 288 C65 252 47 175 58 111 C64 77 68 54 82 42Z" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            <path d="M56 255 C151 222 214 232 284 205 C354 178 409 139 506 111" fill="none" stroke="rgba(56,189,248,0.24)" strokeWidth="8" strokeLinecap="round" />
            <path d="M75 96 C170 141 221 136 302 145 C381 153 414 198 489 229" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="8 7" />
            <path d="M145 42 C179 116 176 188 211 259 C230 298 270 326 306 350 M387 52 C350 112 330 174 344 232 C351 267 373 296 414 326" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
            <rect width="560" height="380" fill="url(#grid)" opacity="0.55" />
            <text x="280" y="54" textAnchor="middle" fill="rgba(255,255,255,0.88)" fontSize="18" fontWeight="700" letterSpacing="3">PUNE REGION</text>
            <text x="440" y="304" fill="rgba(255,255,255,0.5)" fontSize="12">LONAVALA</text>
            <text x="440" y="320" fill="rgba(255,255,255,0.28)" fontSize="10">Western Ghats</text>
            <circle cx="425" cy="292" r="5" fill="#E4574F" opacity="0.85" />
            {zones.map((z) => {
              const lvl = riskFromScore(z.baseRisk);
              const isActive = selected === z.id;
              const metric = layer === "rainfall" ? z.rainfall : layer === "vulnerability" ? z.vulnerability : layer === "reports" ? z.reports * 4 : z.baseRisk;
              const radius = layer === "reports" ? 16 + z.reports / 2 : 18 + metric / 5;
              return (
                <g key={z.id} className="cursor-pointer" onClick={() => setSelected(z.id)}>
                  <motion.circle
                    cx={z.cx} cy={z.cy} r={radius}
                    fill={RISK[lvl].color} opacity={0.16}
                    animate={isActive ? { r: [radius, radius + 6, radius] } : {}}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  <motion.circle
                    cx={z.cx} cy={z.cy} r={9} fill={RISK[lvl].color}
                    stroke={isActive ? "#fff" : "rgba(255,255,255,0.4)"} strokeWidth={isActive ? 2 : 1}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  />
                  <text x={z.cx} y={z.cy - 18} textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="12" fontWeight={isActive ? 600 : 400}>
                    {z.name}
                  </text>
                  <text x={z.cx} y={z.cy + 3} textAnchor="middle" fill="#04101a" fontSize="8" fontWeight={700} style={{ pointerEvents: "none" }}>
                    {z.baseRisk}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-4 left-4 flex gap-3 text-[11px] text-white/50">
            {Object.entries(RISK).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: v.color }} />{v.label}</span>
            ))}
          </div>
        </GlassPanel>

        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 24, filter: "blur(6px)" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <GlassPanel className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{active.name}</h3>
                      <RiskBadge level={riskFromScore(active.baseRisk)} size="sm" />
                    </div>
                    <RiskGauge value={active.baseRisk} level={riskFromScore(active.baseRisk)} size={72} />
                  </div>
                  <div className="space-y-3 text-[13px]">
                    {[
                      ["Vulnerability", `${active.vulnerability}%`],
                      ["Rainfall", `${active.rainfall} mm`],
                      ["Active reports", active.reports],
                      ["Nearest shelter", active.shelter],
                      ["Nearest hospital", active.hospital],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-white/45">{k}</span>
                        <span className="text-white/85 font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-1.5">
                    {[["Vulnerability", active.vulnerability], ["Rainfall load", Math.min(100, active.rainfall)]].map(([label, val]) => (
                      <div key={label}>
                        <div className="flex justify-between text-[11px] text-white/40 mb-1"><span>{label}</span><span>{val}%</span></div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div className="h-full rounded-full bg-sky-400/70" initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.9 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-5 w-full text-center text-[13px] text-sky-300 hover:text-sky-200 flex items-center justify-center gap-1 py-2 rounded-lg border border-sky-400/20 hover:bg-sky-400/5">
                    View full analysis <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </GlassPanel>
              </motion.div>
            ) : (
              <GlassPanel className="p-8 text-center text-white/35 text-sm">
                Select a zone on the map to view details.
              </GlassPanel>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
*/

/* ---------------------------------------------------------------------
  ALERTS PAGE
--------------------------------------------------------------------- */
function AlertsPage({ zones, onNavigate }) {
  const critical = zones.filter((z) => riskFromScore(z.baseRisk) === "critical" || riskFromScore(z.baseRisk) === "high");
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>Live alerts</h2>
      {critical.length === 0 ? (
        <GlassPanel className="p-10 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-300/70 mx-auto mb-3" />
          <p className="text-white/80 font-medium">You're all clear</p>
          <p className="text-white/40 text-sm mt-1">No critical alerts in your selected region.</p>
        </GlassPanel>
      ) : (
        <div className="space-y-3">
          {critical.map((z, i) => {
            const lvl = riskFromScore(z.baseRisk);
            return (
              <motion.div key={z.id} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <GlassPanel className="p-4 border-l-2" style={{ borderLeftColor: RISK[lvl].color }}>
                  <div className="flex items-start gap-3">
                    <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: RISK[lvl].bg }}>
                      <AlertTriangle className="w-4 h-4" style={{ color: RISK[lvl].color }} />
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-white uppercase tracking-wide" style={{ color: RISK[lvl].color }}>
                          {lvl} flood risk
                        </span>
                        <span className="text-white/40 text-[13px]">· {z.name}</span>
                      </div>
                      <p className="text-white/60 text-[13px] mt-1">
                        Estimated flood risk has increased to {z.baseRisk}% due to heavy rainfall and local conditions.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => onNavigate("map")} className="text-[12px] px-3 py-1.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/5">View area</button>
                        <button className="text-[12px] px-3 py-1.5 rounded-lg text-white/90" style={{ background: RISK[lvl].bg, border: `1px solid ${RISK[lvl].ring}` }}>Safety actions</button>
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            );
          })}
        </div>
      )}

      <GlassPanel className="p-5">
        <h3 className="text-[13px] font-medium text-white/70 mb-4">What should you do?</h3>
        <div className="space-y-2.5">
          {ACTIONS.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="w-5 h-5 rounded-full bg-sky-400/15 text-sky-300 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-[13px] text-white/70">{a}</span>
            </motion.div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}

/* ---------------------------------------------------------------------
   COMMUNITY PAGE
--------------------------------------------------------------------- */
function ReportModal({ open, onClose }) {
  const [step, setStep] = useState("form");
  const [type, setType] = useState("Flood");
  useEffect(() => { if (open) setStep("form"); }, [open]);
  const types = ["Flood", "Waterlogging", "Road block", "Fallen tree", "Landslide", "Fire", "Medical emergency", "Other"];
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md" onClick={(e) => e.stopPropagation()}
          >
            <GlassPanel className="p-6 bg-[#0C0F18]/95">
              {step === "form" ? (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-white">Report an incident</h3>
                    <button onClick={onClose}><X className="w-4 h-4 text-white/50" /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[12px] text-white/45 mb-1.5 block">Incident type</label>
                      <div className="flex flex-wrap gap-1.5">
                        {types.map((t) => (
                          <button key={t} onClick={() => setType(t)}
                            className={cx("px-2.5 py-1 rounded-lg text-[12px] border", type === t ? "bg-sky-400/15 border-sky-400/40 text-sky-200" : "border-white/10 text-white/50")}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[12px] text-white/45 mb-1.5 block">Location</label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-[13px] text-white/60">
                        <MapPin className="w-3.5 h-3.5 text-sky-300/70" /> Using current location
                      </div>
                    </div>
                    <div>
                      <label className="text-[12px] text-white/45 mb-1.5 block">Description</label>
                      <textarea rows={3} placeholder="Describe what you're seeing…" className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-[13px] text-white/80 placeholder-white/25 focus:outline-none focus:border-sky-400/40" />
                    </div>
                    <div className="border-2 border-dashed border-white/10 rounded-lg py-6 flex flex-col items-center gap-1.5 text-white/35 hover:border-sky-400/30 hover:text-white/55 transition-colors cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span className="text-[12px]">Drop a photo or click to upload</span>
                    </div>
                    <button onClick={() => setStep("done")} className="w-full py-2.5 rounded-lg bg-sky-400/90 hover:bg-sky-400 text-[#04101a] font-semibold text-[13px] transition-colors">
                      Submit report
                    </button>
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center py-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-14 h-14 rounded-full bg-emerald-400/15 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-7 h-7 text-emerald-300" />
                  </motion.div>
                  <p className="text-white font-semibold">Report received</p>
                  <p className="text-white/45 text-[13px] mt-1">Thank you for helping your community.</p>
                  <button onClick={onClose} className="mt-5 text-[13px] text-sky-300 hover:text-sky-200">Close</button>
                </motion.div>
              )}
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CommunityPage() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>Community intelligence</h2>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-400/90 hover:bg-red-400 text-[#1a0404] text-[13px] font-semibold transition-colors">
          <Siren className="w-4 h-4" /> Report incident
        </button>
      </div>
      <div className="grid gap-3">
        {FEED_ITEMS.map((f, i) => (
          <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassPanel className="p-4 flex items-center gap-4">
              <span className="text-xl">{f.icon}</span>
              <div className="flex-1">
                <p className="text-[13px] text-white/85 font-medium">{f.type}</p>
                <p className="text-[12px] text-white/40 flex items-center gap-1"><MapPin className="w-3 h-3" /> {f.area} · {f.time}</p>
              </div>
              <span className={cx("text-[11px] px-2 py-1 rounded-full border",
                f.status === "Resolved" ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10" :
                f.status === "Verified" ? "text-sky-300 border-sky-400/30 bg-sky-400/10" :
                "text-amber-300 border-amber-400/30 bg-amber-400/10")}>
                {f.status}
              </span>
            </GlassPanel>
          </motion.div>
        ))}
      </div>
      <ReportModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

/* ---------------------------------------------------------------------
   COMMAND CENTER PAGE
--------------------------------------------------------------------- */
function CommandCenterPage({ zones }) {
  const ranked = [...zones].sort((a, b) => b.baseRisk - a.baseRisk);
  const allocations = [
    { icon: Stethoscope, action: "Medical team", target: ranked[0]?.name },
    { icon: Truck, action: "Rescue team", target: ranked[1]?.name },
    { icon: Building2, action: "Shelter activation", target: ranked[2]?.name },
    { icon: TrafficCone, action: "Traffic control", target: ranked[3]?.name },
  ];
  const stats = [
    { label: "Critical areas", value: zones.filter((z) => riskFromScore(z.baseRisk) === "critical").length },
    { label: "Active incidents", value: zones.reduce((s, z) => s + z.reports, 0) },
    { label: "Response teams", value: 9 },
    { label: "Shelters", value: 12 },
    { label: "Hospitals", value: 6 },
  ];
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>Emergency command center</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <GlassPanel className="p-4 text-center">
              <div className="text-2xl font-semibold text-white tabular-nums"><CountUp value={s.value} /></div>
              <div className="text-[11px] text-white/40 mt-1">{s.label}</div>
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassPanel className="p-5">
          <h3 className="text-[13px] font-medium text-white/70 mb-4">Priority areas</h3>
          <div className="space-y-2.5">
            {ranked.map((z, i) => {
              const lvl = riskFromScore(z.baseRisk);
              return (
                <motion.div key={z.id} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="w-6 h-6 rounded-full bg-white/[0.06] text-white/60 text-[11px] font-semibold flex items-center justify-center">{i + 1}</span>
                  <span className="flex-1 text-[13px] text-white/85">{z.name}</span>
                  <span className="text-[13px] font-semibold" style={{ color: RISK[lvl].color }}>{z.baseRisk}</span>
                </motion.div>
              );
            })}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h3 className="text-[13px] font-medium text-white/70 mb-4">Recommended resource allocation</h3>
          <div className="space-y-2.5">
            {allocations.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center"><a.icon className="w-4 h-4 text-sky-300" /></div>
                <span className="flex-1 text-[13px] text-white/70">{a.action}</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/25" />
                <span className="text-[13px] font-medium text-white/90">{a.target}</span>
              </motion.div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   AI ASSISTANT PAGE
--------------------------------------------------------------------- */
const CANNED = {
  flood: "Move away from moving water and seek higher ground if necessary. Avoid driving or walking through floodwater. Follow official evacuation instructions.",
  heatwave: "Stay indoors during peak heat hours, drink water regularly, and check on elderly neighbors. Avoid strenuous outdoor activity between noon and 4 PM.",
  landslide: "Move away from steep slopes and unstable ground immediately. Watch for cracking sounds or shifting soil, and report the area to local authorities.",
  fire: "Evacuate the area immediately and stay low to avoid smoke inhalation. Call emergency services and avoid using elevators.",
  "medical emergency": "Call emergency services right away. Keep the person still, monitor breathing, and follow dispatcher instructions until help arrives.",
};

function AiAssistant() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi, I'm your ResiliAI assistant. Ask me anything about staying safe, or choose a quick action below." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lang, setLang] = useState("English");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const respond = useCallback((text) => {
    const key = text.toLowerCase();
    const found = Object.keys(CANNED).find((k) => key.includes(k));
    const reply = found ? CANNED[found] : "Stay alert and follow official guidance from local authorities. If this is a life-threatening emergency, contact emergency services immediately.";
    setMessages((m) => [...m, { role: "user", text }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    }, 900);
  }, []);

  const quick = ["Flood", "Heatwave", "Landslide", "Fire", "Medical emergency"];

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>ResiliAI assistant</h2>
        <p className="text-[13px] text-white/40 mt-1">Get clear, location-aware emergency guidance.</p>
        <div className="flex justify-center gap-1.5 mt-3">
          {["English", "Hindi", "Marathi"].map((l) => (
            <button key={l} onClick={() => setLang(l)} className={cx("px-2.5 py-1 rounded-full text-[11px] border", lang === l ? "bg-sky-400/15 border-sky-400/40 text-sky-200" : "border-white/10 text-white/40")}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <GlassPanel className="p-4 h-[420px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cx("max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px]",
                m.role === "user" ? "bg-sky-400/90 text-[#04101a] rounded-br-sm" : "bg-white/[0.05] text-white/85 rounded-bl-sm border border-white/[0.06]")}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white/[0.05] border border-white/[0.06] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-white/40" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3 mb-2">
          {quick.map((q) => (
            <button key={q} onClick={() => respond(q)} className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-white/50 hover:text-white/85 hover:border-sky-400/30">
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) { respond(input.trim()); setInput(""); } }}
            placeholder="Ask a safety question…"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[13px] text-white/85 placeholder-white/25 focus:outline-none focus:border-sky-400/40"
          />
          <button onClick={() => { if (input.trim()) { respond(input.trim()); setInput(""); } }} className="w-10 h-10 rounded-xl bg-sky-400/90 hover:bg-sky-400 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4 text-[#04101a]" />
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}

/* ---------------------------------------------------------------------
   ABOUT PAGE
--------------------------------------------------------------------- */
const TEAM_MEMBERS = [
  { name: "Vishnu Kumar", role: "Team Member", photo: "/team/Vishnu.jpg.jpeg" },
  { name: "Vardhan Sharma", role: "Team Member", photo: "/team/Vardhan.jpg.jpeg" },
  { name: "Pratyush Gangarde", role: "Team Leader", photo: "/team/Pratyush.jpg.jpeg" },
  { name: "Akshat Wankhaede", role: "Team Member", photo: "/team/Akshat.jpg.jpeg" },
  { name: "Himanshu Aalekh", role: "Team Member", photo: "/team/Himanshu.jpg.jpeg" },
];

function MemberAvatar({ member }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = member.name.split(" ").slice(0, 2).map((part) => part[0]).join("");

  if (member.photo && !imageFailed) {
    return <img src={member.photo} alt={member.name} onError={() => setImageFailed(true)} className="h-24 w-24 rounded-full border border-white/10 object-cover" />;
  }

  return <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-sky-300/20 bg-sky-300/10 text-xl font-semibold text-sky-200">{initials}</div>;
}

function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-sky-300/70">
          <Info className="h-3.5 w-3.5" /> About ResiliAI
        </div>
        <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>Avengers</h2>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-white/45">We are the Avengers team behind ResiliAI. This website is currently in its initial stage and is not fully ready yet, so more improvements are coming.</p>
      </div>

      <GlassPanel className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
          <div>
            <h3 className="text-[15px] font-medium text-white/90">Avengers Team Members</h3>
            <p className="mt-1 text-[12px] text-white/40">Meet the members building ResiliAI.</p>
          </div>
          <Users className="h-5 w-5 shrink-0 text-sky-300/70" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex min-h-[190px] flex-col items-center justify-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-5 text-center"
            >
              <MemberAvatar member={member} />
              <div className="min-w-0">
                <p className="text-[15px] font-medium text-white/90">{member.name}</p>
                <p className="mt-1 text-[12px] text-white/40">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}

/* ---------------------------------------------------------------------
   ROOT APP
--------------------------------------------------------------------- */
function DashboardApp({ user }: { user?: FirebaseUser | null }) {
  const [booted, setBooted] = useState(false);
  const [active, setActive] = useState("overview");
  const [selectedZone, setSelectedZone] = useState("wakad");
  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoRunning, setDemoRunning] = useState(false);

  const [zones, setZones] = useState(ZONES);
  const [weather, setWeather] = useState({ rainfall: 72, humidity: 84, incidents: 17 });

  const globalRisk = demoMode ? DEMO_STEPS[demoStep].risk : 24;

  useEffect(() => {
    if (!demoMode) { setZones(ZONES); setWeather({ rainfall: 72, humidity: 84, incidents: 17 }); return; }
    const step = DEMO_STEPS[demoStep];
    setWeather({ rainfall: step.rainfall, humidity: 70 + demoStep * 5, incidents: 8 + demoStep * 5 });
    setZones(ZONES.map((z, i) => ({
      ...z,
      baseRisk: Math.min(97, Math.round(z.baseRisk * (0.5 + demoStep * 0.22) + (i === 0 ? 8 : 0))),
      reports: step.reports - i,
    })));
  }, [demoMode, demoStep]);

  useEffect(() => {
    if (!demoRunning) return;
    if (demoStep >= DEMO_STEPS.length - 1) { setDemoRunning(false); return; }
    const t = setTimeout(() => setDemoStep((s) => s + 1), 2200);
    return () => clearTimeout(t);
  }, [demoRunning, demoStep]);

  const runSimulation = () => { setDemoMode(true); setDemoStep(0); setDemoRunning(true); setActive("overview"); };
  const resetSimulation = () => { setDemoRunning(false); setDemoStep(0); };

  const alertCount = zones.filter((z) => riskFromScore(z.baseRisk) === "critical" || riskFromScore(z.baseRisk) === "high").length;

  return (
    <div className="min-h-screen w-full bg-[#080B12] text-white font-sans antialiased relative" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none opacity-[0.25]" style={{
        backgroundImage: "radial-gradient(circle at 20% 10%, rgba(56,132,255,0.06), transparent 40%), radial-gradient(circle at 80% 90%, rgba(228,87,79,0.05), transparent 40%)",
      }} />

      <AnimatePresence>{!booted && <Intro onDone={() => setBooted(true)} />}</AnimatePresence>

      {booted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <Navbar active={active} setActive={setActive} demoMode={demoMode} setDemoMode={setDemoMode} alertCount={alertCount} user={user} />

          <div className="max-w-7xl mx-auto px-5 py-6 pb-24 lg:pb-10 relative z-10">
            {demoMode && (
              <div className="mb-5 flex items-center justify-between flex-wrap gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3">
                <div className="flex items-center gap-2 text-[13px] text-amber-200/90">
                  <Sparkles className="w-4 h-4" /> Demo mode — simulating: <span className="font-semibold">{DEMO_STEPS[demoStep].label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => (demoRunning ? setDemoRunning(false) : runSimulation())} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/15 text-amber-200 text-[12px] hover:bg-amber-400/25">
                    {demoRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />} {demoRunning ? "Pause" : "Simulate flood event"}
                  </button>
                  <button onClick={resetSimulation} className="p-1.5 rounded-lg text-amber-200/70 hover:bg-amber-400/10"><RotateCcw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                {active === "overview" && <Overview globalRisk={globalRisk} weather={weather} zones={zones} onNavigate={setActive} onSelectZone={setSelectedZone} />}
                {active === "map" && <RiskMapPage zones={zones} selected={selectedZone} setSelected={setSelectedZone} />}
                {active === "alerts" && <AlertsPage zones={zones} onNavigate={setActive} />}
                {active === "community" && <CommunityPage />}
                {active === "command" && <CommandCenterPage zones={zones} />}
                {active === "assistant" && <AiAssistant />}
                {active === "about" && <AboutPage />}
                {active === "profile" && <ProfilePage user={user} onSignOut={() => firebaseAuth && signOut(firebaseAuth)} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <button className="lg:hidden fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-red-400/95 text-[#1a0404] text-[13px] font-semibold shadow-lg shadow-red-500/20"
            onClick={() => setActive("community")}>
            <Siren className="w-4 h-4" /> Report
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function ResiliAI() {
  return <AuthGate><DashboardApp /></AuthGate>;
}
