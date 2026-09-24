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
  Star, Phone, Settings, Info, CloudRain, Navigation, Crosshair, Sliders,
  Download, Share2, Sun, Moon, FileText, Check, Filter, ArrowUpRight, HelpCircle, Eye,
  Clock, ArrowUp, ArrowDown, RefreshCw
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend
} from "recharts";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, type User as FirebaseUser } from "firebase/auth";
import { firebaseAuth, firebaseConfigured } from "@/lib/firebase";
import { api } from "@/lib/api";
import { LanguageProvider, useTranslation, Language } from "@/lib/i18n";
import dynamic from "next/dynamic";

const InteractiveMapApp = dynamic(() => import("./map/InteractiveMapApp"), {
  ssr: false,
  loading: () => (
    <div className="h-[640px] w-full rounded-2xl border border-white/10 bg-[#0d1420] flex flex-col items-center justify-center text-white/60 gap-3">
      <LoaderCircle className="h-8 w-8 animate-spin text-sky-400" />
      <span className="text-sm font-medium">Initializing 3D Vector Terrain Engine...</span>
    </div>
  ),
});

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
  { id: "wakad", name: "Lonavala", cx: 125, cy: 110, lat: 18.5997, lng: 73.7631, baseRisk: 68, vulnerability: 82, rainfall: 110, reports: 14, shelter: "1.2 km", hospital: "2.4 km", elevation: 620 },
  { id: "baner", name: "Baner", cx: 215, cy: 175, lat: 18.559, lng: 73.7868, baseRisk: 42, vulnerability: 58, rainfall: 74, reports: 6, shelter: "0.8 km", hospital: "1.6 km", elevation: 565 },
  { id: "aundh", name: "Aundh", cx: 290, cy: 155, lat: 18.5587, lng: 73.8077, baseRisk: 30, vulnerability: 44, rainfall: 55, reports: 3, shelter: "1.5 km", hospital: "2.0 km", elevation: 552 },
  { id: "katraj", name: "Katraj", cx: 345, cy: 305, lat: 18.4529, lng: 73.8652, baseRisk: 58, vulnerability: 71, rainfall: 88, reports: 9, shelter: "2.1 km", hospital: "3.0 km", elevation: 590 },
  { id: "hadapsar", name: "Hadapsar", cx: 450, cy: 235, lat: 18.5089, lng: 73.926, baseRisk: 47, vulnerability: 55, rainfall: 66, reports: 5, shelter: "1.0 km", hospital: "1.8 km", elevation: 558 },
  { id: "kothrud", name: "Kothrud", cx: 200, cy: 260, lat: 18.5074, lng: 73.8077, baseRisk: 38, vulnerability: 48, rainfall: 62, reports: 4, shelter: "1.1 km", hospital: "1.4 km", elevation: 570 },
  { id: "hinjewadi", name: "Hinjewadi", cx: 90, cy: 150, lat: 18.5913, lng: 73.7389, baseRisk: 64, vulnerability: 76, rainfall: 95, reports: 11, shelter: "1.8 km", hospital: "2.2 km", elevation: 560 },
  { id: "shivajinagar", name: "Shivajinagar", cx: 280, cy: 210, lat: 18.5314, lng: 73.8446, baseRisk: 52, vulnerability: 65, rainfall: 78, reports: 8, shelter: "0.6 km", hospital: "0.9 km", elevation: 555 },
  { id: "pimpri", name: "Pimpri-Chinchwad", cx: 210, cy: 90, lat: 18.6279, lng: 73.8009, baseRisk: 59, vulnerability: 68, rainfall: 84, reports: 7, shelter: "1.4 km", hospital: "1.7 km", elevation: 550 },
  { id: "vimannagar", name: "Viman Nagar", cx: 410, cy: 160, lat: 18.5679, lng: 73.9143, baseRisk: 35, vulnerability: 42, rainfall: 50, reports: 3, shelter: "1.0 km", hospital: "1.5 km", elevation: 575 },
];

/* ---------------------------------------------------------------------
   MOCK DATA: Connected to real endpoints in production
--------------------------------------------------------------------- */
// Mock community report photo pins (In production: GET /api/reports)
const REPORT_PINS = [
  { id: "pin-1", zoneId: "wakad", cx: 105, cy: 135, emoji: "🌊", type: "Flash Flood", time: "6m ago", status: "Verified" },
  { id: "pin-2", zoneId: "baner", cx: 240, cy: 200, emoji: "🚧", type: "Road Submerged", time: "12m ago", status: "Reported" },
  { id: "pin-3", zoneId: "aundh", cx: 315, cy: 135, emoji: "🌳", type: "Fallen Tree", time: "19m ago", status: "Resolved" },
  { id: "pin-4", zoneId: "katraj", cx: 375, cy: 285, emoji: "⚡", type: "Live Wire Hazard", time: "27m ago", status: "Reported" },
  { id: "pin-5", zoneId: "hadapsar", cx: 475, cy: 260, emoji: "🏚️", type: "Wall Collapse", time: "38m ago", status: "Verified" },
];

// Mock emergency shelters (In production: GET /api/emergency-locations?type=shelter)
const SHELTERS = [
  { id: "sh-1", name: "Lonavala High Relief Shelter", cx: 155, cy: 80, capacityPct: 78, distance: "1.2 km", zoneId: "wakad" },
  { id: "sh-2", name: "Baner Sports Complex Safe Zone", cx: 185, cy: 210, capacityPct: 45, distance: "0.8 km", zoneId: "baner" },
  { id: "sh-3", name: "Aundh Municipal Relief Center", cx: 330, cy: 120, capacityPct: 52, distance: "1.5 km", zoneId: "aundh" },
  { id: "sh-4", name: "Katraj Hill Community Hall", cx: 310, cy: 330, capacityPct: 91, distance: "2.1 km", zoneId: "katraj" },
  { id: "sh-5", name: "Hadapsar Magarpatta Safe Center", cx: 480, cy: 205, capacityPct: 62, distance: "1.0 km", zoneId: "hadapsar" },
];

// Mock emergency hospitals (In production: GET /api/emergency-locations?type=hospital)
const HOSPITALS = [
  { id: "hosp-1", name: "Sancheti Trauma Care", cx: 325, cy: 185, capacityPct: 88, distance: "2.4 km" },
  { id: "hosp-2", name: "Jupiter Emergency Hospital", cx: 245, cy: 145, capacityPct: 62, distance: "1.6 km" },
  { id: "hosp-3", name: "Noble Multi-Speciality", cx: 435, cy: 275, capacityPct: 39, distance: "1.8 km" },
  { id: "hosp-4", name: "Bharati Hospital & Trauma", cx: 375, cy: 340, capacityPct: 74, distance: "3.0 km" },
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
  { id: 1, icon: "🌊", type: "Waterlogging", area: "Lonavala", time: "4 min ago", status: "Reported", lat: 18.7546, lng: 73.4062, severity: "Critical", description: "Water level rose above 2.5 ft near main market" },
  { id: 2, icon: "🚧", type: "Road blocked", area: "Baner", time: "9 min ago", status: "Verified", lat: 18.559, lng: 73.7868, severity: "High", description: "Underpass submerged, traffic diverted to highway" },
  { id: 3, icon: "🌳", type: "Fallen tree", area: "Aundh", time: "15 min ago", status: "Resolved", lat: 18.5587, lng: 73.8077, severity: "Moderate", description: "Large banyan branch cleared by municipal staff" },
  { id: 4, icon: "🏚️", type: "Flooding", area: "Katraj", time: "22 min ago", status: "Verified", lat: 18.4529, lng: 73.8652, severity: "High", description: "Low-lying residential area water ingress reported" },
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

function Intro({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      onClick={onDone}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black cursor-pointer select-none"
      exit={{ opacity: 0, transition: { duration: 0.32, ease: "easeInOut" } }}
    >
      <div className="absolute top-6 right-6 z-40 text-xs font-semibold text-white/50 hover:text-white border border-white/10 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md">
        Skip intro ➔
      </div>
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

function LoginPage({ onLogin, onGuestLogin, loading, error }: { onLogin: () => void; onGuestLogin: () => void; loading: boolean; error: string }) {
  const [sceneTilt, setSceneTilt] = useState({ x: 0, y: 0 });
  const [panelTilt, setPanelTilt] = useState({ x: 0, y: 0 });
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPrivacyOpen(false);
        setEmergencyOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
            
            {/* Primary Google Login */}
            <button disabled={loading || !firebaseConfigured} onClick={onLogin} className="mt-5 flex w-full items-center justify-center gap-3 rounded-[10px] border border-white/80 bg-[#f3f7f8] px-4 py-3 text-[12px] font-bold text-[#16242c] shadow-[0_0_0_2px_rgba(255,255,255,.15),0_8px_24px_rgba(0,0,0,.18)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#4285f4] shadow-sm">G</span>}{loading ? "Connecting to Google..." : "Continue with Google"}</button>

            {/* Instant Demo / Guest Bypass Button */}
            <button type="button" onClick={onGuestLogin} className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-sky-400/40 bg-sky-500/20 px-4 py-3 text-[12px] font-bold text-sky-200 shadow-sm transition hover:bg-sky-500/30">
              <Sparkles className="h-4 w-4 text-sky-300" />
              Explore Dashboard (Guest / Demo Mode)
            </button>

            {!firebaseConfigured && <p className="mt-3 text-center text-[10px] text-amber-200/70">Firebase not configured or pending domain authorization. Click above to explore as guest.</p>}
            <div className="mt-4 flex gap-4 text-[10px]">
              <button type="button" onClick={() => setPrivacyOpen(true)} className="text-white/45 hover:text-white/80 underline-offset-2 hover:underline">Privacy Policy</button>
              <button type="button" onClick={() => setEmergencyOpen(true)} className="text-amber-300/80 hover:text-amber-200 underline-offset-2 hover:underline">Emergency Resources</button>
            </div>
            <p className="mt-5 max-w-[250px] text-[10px] leading-4 text-white/35">Built for citizens, responders, volunteers,<br />and command-center administrators.</p>
          </GlassPanel>
        </motion.div>
      </div>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {privacyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setPrivacyOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1420] p-6 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-semibold">Privacy Policy & Data Security</h3>
                <button type="button" onClick={() => setPrivacyOpen(false)} className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 space-y-3 text-xs leading-5 text-white/70">
                <p><strong className="text-white">Emergency Location Access:</strong> ResiliAI only uses your geolocation locally in-memory during active sessions to map nearby flood hazards, shelters, and medical response units. Your live telemetry is never sold or shared with commercial third parties.</p>
                <p><strong className="text-white">Community Reports:</strong> When contributing crowdsourced hazard reports, uploaded descriptions and coordinates are sanitized and timestamped for open disaster coordination across municipal services.</p>
                <p><strong className="text-white">Local Storage:</strong> ResiliAI caches user-selected regional filters, offline checklists, and demo credentials on this device for zero-latency response during connectivity blackouts.</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button type="button" onClick={() => setPrivacyOpen(false)} className="rounded-lg bg-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-200 border border-sky-400/40 hover:bg-sky-500/30">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Emergency Resources Modal */}
      <AnimatePresence>
        {emergencyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setEmergencyOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-2xl border border-amber-400/30 bg-[#0d1420] p-6 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-amber-400/20 pb-3">
                <div className="flex items-center gap-2 text-amber-300">
                  <Siren className="h-4 w-4" />
                  <h3 className="text-base font-semibold">24/7 Emergency Helplines</h3>
                </div>
                <button type="button" onClick={() => setEmergencyOpen(false)} className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs text-white/80">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-[11px] text-white/40">National Emergency Unified</div>
                  <div className="text-base font-bold text-red-300">112</div>
                  <p className="text-[10px] text-white/50 mt-1">Police, Fire & Ambulance dispatch</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-[11px] text-white/40">Disaster Management Cell</div>
                  <div className="text-base font-bold text-amber-300">1077 / 1070</div>
                  <p className="text-[10px] text-white/50 mt-1">State & District Emergency Ops</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-[11px] text-white/40">Medical & Ambulance</div>
                  <div className="text-base font-bold text-emerald-300">108 / 102</div>
                  <p className="text-[10px] text-white/50 mt-1">Direct hospital emergency dispatch</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-[11px] text-white/40">Pune Flood Control Room</div>
                  <div className="text-base font-bold text-sky-300">020-25501269</div>
                  <p className="text-[10px] text-white/50 mt-1">Municipal drainage & water level</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button type="button" onClick={() => setEmergencyOpen(false)} className="rounded-lg bg-amber-400/20 px-4 py-2 text-xs font-semibold text-amber-200 border border-amber-400/40 hover:bg-amber-400/30">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

function ProfilePage({ user, onSignOut }: { user: FirebaseUser | null; onSignOut: () => void }) {
  const [role, setRole] = useState(() => typeof window === "undefined" ? "Citizen" : localStorage.getItem("resiliai-role") || "Citizen");
  const [region, setRegion] = useState(() => typeof window === "undefined" ? "Pune - Lonavala" : localStorage.getItem("resiliai-region") || "Pune - Lonavala");
  const [emergencyContact, setEmergencyContact] = useState(() => typeof window === "undefined" ? "" : localStorage.getItem("resiliai-emergency-contact") || "Disaster Ops (+91 98765 43210)");
  const [smsAlerts, setSmsAlerts] = useState(() => typeof window === "undefined" ? true : localStorage.getItem("resiliai-sms") !== "false");
  const { lang, setLang, t } = useTranslation();
  const [emailAlerts, setEmailAlerts] = useState(() => typeof window === "undefined" ? true : localStorage.getItem("resiliai-email") !== "false");
  const [pushAlerts, setPushAlerts] = useState(() => typeof window === "undefined" ? true : localStorage.getItem("resiliai-push") !== "false");
  const [threshold, setThreshold] = useState(() => typeof window === "undefined" ? "High" : localStorage.getItem("resiliai-threshold") || "High");
  const [saved, setSaved] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSignOutOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const saveProfile = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("resiliai-role", role);
      localStorage.setItem("resiliai-region", region);
      localStorage.setItem("resiliai-emergency-contact", emergencyContact);
      localStorage.setItem("resiliai-sms", String(smsAlerts));
      localStorage.setItem("resiliai-email", String(emailAlerts));
      localStorage.setItem("resiliai-push", String(pushAlerts));
      localStorage.setItem("resiliai-threshold", threshold);
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const currentLangLabel = lang === "HI" ? "Hindi" : lang === "MR" ? "Marathi" : "English";

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>{t("profileTitle")}</h2>
        <p className="mt-1 text-[13px] text-white/40">{t("profileSubtitle")}</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <GlassPanel className="p-5">
          <div className="flex items-center gap-4 border-b border-white/[0.07] pb-5">
            <img src={user?.photoURL || "/resiliai-symbol.svg"} alt="" className="h-16 w-16 rounded-full border border-white/10 object-cover" />
            <div>
              <h3 className="text-lg font-semibold text-white">{user?.displayName || "ResiliAI user"}</h3>
              <p className="text-[13px] text-white/45">{user?.email || "demo@resiliai.local"}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified responder profile
              </span>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <label className="block text-[12px] text-white/45">
              {t("roleDesignation")}
              <select value={role} onChange={(event) => setRole(event.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1420] px-3 py-2 text-[13px] text-white/80 outline-none">
                <option>Field Responder</option>
                <option>Command Center Admin</option>
                <option>Community Volunteer</option>
                <option>Citizen</option>
              </select>
            </label>
            <label className="block text-[12px] text-white/45">
              {t("preferredRegion")}
              <select value={region} onChange={(event) => setRegion(event.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1420] px-3 py-2 text-[13px] text-white/80 outline-none">
                <option>Pune - Wakad</option>
                <option>Pune - Baner</option>
                <option>Pune - Aundh</option>
                <option>Pune - Hadapsar</option>
                <option>Pune - Katraj</option>
                <option>Lonavala - Western Ghats</option>
              </select>
            </label>
            <label className="block text-[12px] text-white/45">
              {t("emergencyContact")}
              <input
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Name · phone number"
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-white/80 outline-none placeholder:text-white/25 focus:border-sky-400/50"
              />
            </label>
            <button type="button" onClick={saveProfile} className="flex items-center gap-2 rounded-lg bg-sky-400/90 px-4 py-2 text-[12px] font-semibold text-[#04101a] hover:bg-sky-400 transition">
              {saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              {saved ? t("preferencesSaved") : t("savePreferences")}
            </button>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h3 className="text-[13px] font-medium text-white/75">Notifications & access</h3>
          <div className="mt-4 space-y-3 text-[13px] text-white/65">
            <label className="flex items-center justify-between cursor-pointer">
              <span>{t("smsAlerts")}</span>
              <input type="checkbox" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} className="accent-sky-400 h-4 w-4" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>{t("emailAlerts")}</span>
              <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} className="accent-sky-400 h-4 w-4" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>{t("pushAlerts")}</span>
              <input type="checkbox" checked={pushAlerts} onChange={(e) => setPushAlerts(e.target.checked)} className="accent-sky-400 h-4 w-4" />
            </label>
            <label className="block pt-2 text-[12px] text-white/45">
              {t("alertThreshold")}
              <select value={threshold} onChange={(event) => setThreshold(event.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1420] px-3 py-2 text-[13px] text-white/80 outline-none">
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </label>
            <label className="block text-[12px] text-white/45">
              {t("languageLabel")}
              <select
                value={currentLangLabel}
                onChange={(event) => {
                  const val = event.target.value;
                  const mapped: Language = val === "Hindi" ? "HI" : val === "Marathi" ? "MR" : "EN";
                  setLang(mapped);
                }}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1420] px-3 py-2 text-[13px] text-white/80 outline-none"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Marathi</option>
              </select>
            </label>
          </div>
          <div className="mt-6 border-t border-white/[0.07] pt-4">
            <h4 className="text-[12px] text-white/55">Saved zones</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-200">
                <Star className="h-3 w-3" /> Wakad
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/55">
                <Star className="h-3 w-3" /> Lonavala
              </span>
            </div>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="flex items-center justify-between gap-4 border-red-400/20 p-4">
        <div>
          <p className="text-[13px] font-medium text-white/80">Sign out of ResiliAI</p>
          <p className="mt-0.5 text-[12px] text-white/40">You can sign back in with Google or Demo mode at any time.</p>
        </div>
        <button type="button" onClick={() => setSignOutOpen(true)} className="flex items-center gap-2 rounded-lg border border-red-400/30 px-3 py-2 text-[12px] text-red-200 hover:bg-red-400/10 transition">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </GlassPanel>

      {/* Sign-out Modal Dialog */}
      <AnimatePresence>
        {signOutOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setSignOutOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <GlassPanel className="p-5 border-red-400/30">
                <h3 className="font-semibold text-white">Sign out?</h3>
                <p className="mt-2 text-[13px] text-white/50">Your saved preferences and submitted reports remain safely cached on this device.</p>
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={() => setSignOutOpen(false)} className="rounded-lg px-3 py-2 text-[12px] text-white/55 hover:text-white">Cancel</button>
                  <button type="button" onClick={onSignOut} className="rounded-lg bg-red-400/90 px-3 py-2 text-[12px] font-semibold text-[#1a0404] hover:bg-red-400 transition">Confirm sign out</button>
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AuthGate({ children }: { children: React.ReactElement<any> }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [guestUser, setGuestUser] = useState<any>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("resiliai-guest") === "true"
        ? { displayName: "Demo Responder", email: "demo@resiliai.local", uid: "demo-guest" }
        : null;
    }
    return null;
  });
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseAuth) { setChecking(false); return; }

    const timeout = window.setTimeout(() => {
      setChecking(false);
    }, 2500);

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

  const handleGuestLogin = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("resiliai-guest", "true");
    }
    setGuestUser({ displayName: "Demo Responder", email: "demo@resiliai.local", uid: "demo-guest" });
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("resiliai-guest");
    }
    setGuestUser(null);
    if (firebaseAuth) {
      signOut(firebaseAuth);
    }
  };

  if (checking && !guestUser) {
    return <div className="flex min-h-screen items-center justify-center bg-[#080B12] text-white/50"><LoaderCircle className="h-5 w-5 animate-spin" /></div>;
  }

  const activeUser = user || guestUser;

  if (!activeUser) {
    return <LoginPage onLogin={login} onGuestLogin={handleGuestLogin} loading={loading} error={error} />;
  }

  return React.cloneElement(children, { user: activeUser, onSignOut: handleSignOut });
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
  const { lang, setLang, t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Pune");
  const [langOpen, setLangOpen] = useState(false);

  const cities = ["Pune", "Lonavala", "Mumbai", "Pimpri"];
  const languages: { code: Language; label: string; short: string }[] = [
    { code: "EN", label: "English", short: "EN" },
    { code: "HI", label: "हिन्दी (Hindi)", short: "HI" },
    { code: "MR", label: "मराठी (Marathi)", short: "MR" },
  ];

  const navItemKeyMap: Record<string, any> = {
    overview: "navOverview",
    map: "navMap",
    alerts: "navAlerts",
    community: "navCommunity",
    command: "navCommand",
    assistant: "navAssistant",
    about: "navAbout",
  };

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
                  active === n.id ? "text-white font-semibold" : "text-white/50 hover:text-white/80"
                )}
              >
                {t(navItemKeyMap[n.id] || "navOverview")}
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
              {demoMode ? t("demoBadge") : t("liveBadge")}
            </button>

            {/* Location Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setLocationOpen((o) => !o); setLangOpen(false); }}
                className="flex items-center gap-1.5 text-white/70 hover:text-white text-[13px] px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] transition"
              >
                <MapPin className="w-3.5 h-3.5 text-sky-400" /> {selectedCity}
                <ChevronDown className="w-3 h-3 text-white/40" />
              </button>
              {locationOpen && (
                <div className="absolute left-0 mt-2 w-36 rounded-xl border border-white/10 bg-[#0d1420] p-1.5 shadow-xl z-50">
                  {cities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => { setSelectedCity(city); setLocationOpen(false); }}
                      className={cx(
                        "flex w-full items-center justify-between px-2.5 py-1.5 text-[12px] rounded-lg transition",
                        selectedCity === city ? "bg-sky-500/20 text-sky-200 font-semibold" : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                      )}
                    >
                      {city}
                      {selectedCity === city && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setLangOpen((o) => !o); setLocationOpen(false); }}
                className="text-white/70 hover:text-white text-[13px] px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] flex items-center gap-1.5 transition"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" /> {lang}
                <ChevronDown className="w-3 h-3 text-white/40" />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-[#0d1420] p-1.5 shadow-xl z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={cx(
                        "flex w-full items-center justify-between px-2.5 py-2 text-[12px] rounded-lg transition",
                        lang === l.code ? "bg-sky-500/20 text-sky-200 font-semibold" : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                      )}
                    >
                      <span>{l.label}</span>
                      {lang === l.code && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Live Alerts Bell */}
            <button
              type="button"
              aria-label="View active alerts"
              onClick={() => setActive("alerts")}
              className="relative w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
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
                      active === n.id ? "bg-white/[0.07] text-white font-semibold" : "text-white/55"
                    )}
                  >
                    <n.icon className="w-4 h-4" /> {t(navItemKeyMap[n.id] || "navOverview")}
                  </button>
                ))}
                <button onClick={() => { setActive("profile"); setMobileOpen(false); }} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/55"><User className="h-4 w-4" /> {t("profileTitle")}</button>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-white/50">{t("languageLabel")}</span>
                <div className="flex gap-1">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLang(l.code)}
                      className={cx(
                        "px-2 py-1 rounded text-xs transition",
                        lang === l.code ? "bg-sky-500/20 text-sky-200 font-semibold" : "text-white/60 hover:text-white"
                      )}
                    >
                      {l.short}
                    </button>
                  ))}
                </div>
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
            <span className={cx("text-[10px]", active === n.id ? "text-sky-300" : "text-white/40")}>{t(navItemKeyMap[n.id] || "navOverview")}</span>
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
  const { t } = useTranslation();
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
          {t("greeting")}
        </h1>
        <div className="flex items-center gap-2 mt-1.5 text-[13px] text-white/45">
          <span>{t("regionPune")}</span><span className="text-white/20">•</span><LiveDot /><span className="tabular-nums">{t("updatedSecAgo", { sec: updatedSeconds })}</span>
        </div>
      </motion.div>

      {insightVisible && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 rounded-xl border border-red-400/25 border-l-2 border-l-red-400 bg-red-400/[0.07] px-4 py-2.5 shadow-[0_0_24px_rgba(228,87,79,0.07)]"><div className="flex min-w-0 items-center gap-3"><motion.span animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 1.8, repeat: Infinity }} className="h-2 w-2 shrink-0 rounded-full bg-red-400 shadow-[0_0_10px_rgba(228,87,79,.8)]" /><p className="truncate text-[12px] text-white/75"><span className="font-semibold text-red-300">AI Alert</span> {t("aiAlertBanner")}</p><button onClick={() => { onSelectZone("wakad"); onNavigate("map"); }} className="shrink-0 text-[12px] text-sky-300 hover:text-sky-200">{t("viewDetails")} <ChevronRight className="inline h-3.5 w-3.5" /></button></div><button aria-label="Dismiss insight" onClick={() => setInsightVisible(false)} className="shrink-0 text-white/35 hover:text-white"><X className="h-3.5 w-3.5" /></button></motion.div>}

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
            {t("viewArea")} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassPanel className="lg:col-span-1 p-6 flex flex-col items-center justify-center gap-4">
          <div className="w-full flex items-center justify-between text-[11px] uppercase tracking-wider text-white/40">
            <span>{t("currentRegionalRisk")}</span>
            <RiskBadge level={level} size="sm" />
          </div>
          <RiskGauge value={liveRisk} level={level} size={184} />
          <div className="grid grid-cols-2 gap-3 w-full text-[13px]">
            <div className="flex items-center gap-2 text-white/55"><Droplets strokeWidth={1.8} className="w-3.5 h-3.5 text-sky-300/70" /> {t("rainfall")} <span className="ml-auto text-white/85">{weather.rainfall} mm <small className="text-emerald-300">↑ 12%</small></span></div>
            <div className="flex items-center gap-2 text-white/55"><Wind strokeWidth={1.8} className="w-3.5 h-3.5 text-sky-300/70" /> {t("humidity")} <span className="ml-auto text-white/85">{weather.humidity}% <small className="text-emerald-300">↑ 4%</small></span></div>
            <div className="flex items-center gap-2 text-white/55"><Activity strokeWidth={1.8} className="w-3.5 h-3.5 text-sky-300/70" /> {t("incidents")} <span className="ml-auto text-white/85">{weather.incidents} <small className="text-red-300">↑ 9%</small></span></div>
            <div className="flex items-center gap-2 text-white/55"><TrendingUp className="w-3.5 h-3.5 text-red-300/70" /> {t("trend")} <span className="ml-auto text-red-300">↑ 14%</span></div>
          </div>
        </GlassPanel>

        <GlassPanel className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-white/70">{t("riskTrend")}</span>
            <div className="flex gap-1 rounded-lg border border-white/[0.07] p-0.5">{["Today", "7 Days", "30 Days"].map((option) => (
              <button
                key={option}
                onClick={() => setRange(option)}
                className={cx("rounded-md px-2 py-1 text-[10px]", range === option ? "bg-white/[0.09] text-white/80 font-semibold" : "text-white/35 hover:text-white/65")}
              >
                {option === "Today" ? t("timeRangeToday") : option === "7 Days" ? t("timeRange7Days") : t("timeRange30Days")}
              </button>
            ))}</div>
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
              <ReferenceLine y={70} stroke="#E4574F" strokeDasharray="5 5" strokeOpacity={0.65} label={{ value: t("dangerThreshold"), fill: "#E4574F", fontSize: 10, position: "insideTopRight" }} />
              <Tooltip contentStyle={{ background: "#0E1320", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }} labelStyle={{ color: "rgba(255,255,255,0.6)" }} />
              <Area type="monotone" dataKey="risk" stroke="#E38A46" strokeWidth={2} fill="url(#riskFill)" animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Siren} label={t("criticalZones")} value={4} delay={0.05} tone="red" delta="14%" />
        <StatCard icon={AlertTriangle} label={t("highRiskZones")} value={8} delay={0.12} tone="amber" delta="8%" />
        <StatCard icon={MessageSquare} label={t("activeReports")} value={27} delay={0.19} tone="sky" delta="21%" />
        <StatCard icon={Building2} label={t("emergencyShelters")} value={12} delay={0.26} tone="emerald" delta="3%" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <GlassPanel className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[13px] font-medium text-white/70">{t("hyperlocalSnapshot")}</span>
          <button onClick={() => onNavigate("map")} className="text-[12px] text-sky-300/80 hover:text-sky-200 flex items-center gap-1">
            {t("openFullMap")} <ChevronRight className="w-3.5 h-3.5" />
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
   ADVANCED RISK MAP & MATRIX TYPES & DATA
--------------------------------------------------------------------- */
export interface RiskControl {
  id: string;
  name: string;
  completed: boolean;
  owner: string;
}

export interface RiskComment {
  id: string;
  author: string;
  time: string;
  text: string;
}

export interface RiskItem {
  id: string;
  name: string;
  category: "Hydrological" | "Infrastructure" | "Geological" | "Health" | "Logistical";
  owner: string;
  likelihood: number; // 1.0 to 5.0
  impact: number; // 1.0 to 5.0
  affectedAssets: string;
  assetCount: number;
  status: "Open" | "In Progress" | "Mitigated" | "Accepted";
  lastUpdated: string;
  trend: number[]; // e.g. 4 quarterly scores
  previousPosition: { likelihood: number; impact: number };
  location: { cx: number; cy: number; zoneId: string; zoneName: string };
  description: string;
  controls: RiskControl[];
  comments: RiskComment[];
}

// Initial mock dataset (In production: GET /api/risks)
const INITIAL_RISKS: RiskItem[] = [
  {
    id: "risk-1",
    name: "Lonavala Expressway Flash Inundation",
    category: "Hydrological",
    owner: "Municipal Drainage Taskforce",
    likelihood: 4.4,
    impact: 4.6,
    affectedAssets: "50,000 commuters / 12 transit hubs",
    assetCount: 50000,
    status: "Open",
    lastUpdated: "Today, 14:20",
    trend: [62, 68, 75, 88],
    previousPosition: { likelihood: 3.6, impact: 4.0 },
    location: { cx: 125, cy: 110, zoneId: "wakad", zoneName: "Lonavala" },
    description: "Rapid hydrological catchment saturation along Western Ghats causing localized 2.5ft roadway flooding and complete arterial disruption.",
    controls: [
      { id: "c-1", name: "Deploy high-flow submersible storm pumps", completed: true, owner: "Drainage Ops" },
      { id: "c-2", name: "Traffic diversion to northern expressway bypass", completed: true, owner: "Highway Police" },
      { id: "c-3", name: "Pre-stage emergency recovery tow vehicles", completed: false, owner: "Civil Defense" },
    ],
    comments: [
      { id: "m-1", author: "Eng. Deshmukh", time: "10m ago", text: "Water level rose 8 inches in past 40 minutes near Chhatrapati Shivaji Chowk." },
      { id: "m-2", author: "Chief Kulkarni", time: "1h ago", text: "Pump battalion #3 on site; continuous clearance underway." },
    ],
  },
  {
    id: "risk-2",
    name: "Mula-Mutha Drainage Siphon Surge Failure",
    category: "Infrastructure",
    owner: "Civil Defense Directorate",
    likelihood: 3.8,
    impact: 4.8,
    affectedAssets: "Aundh residential belt, 2 relief camps",
    assetCount: 38000,
    status: "In Progress",
    lastUpdated: "Yesterday",
    trend: [78, 82, 85, 82],
    previousPosition: { likelihood: 4.2, impact: 4.8 },
    location: { cx: 290, cy: 155, zoneId: "aundh", zoneName: "Aundh" },
    description: "Structural blockage in main gravity siphons threatening reverse surcharge into low-lying residential sub-wards.",
    controls: [
      { id: "c-4", name: "Hydraulic gate pressure relief activation", completed: true, owner: "Municipal Engineering" },
      { id: "c-5", name: "Sandbag wall fortification at riverbank junction", completed: false, owner: "Civil Defense" },
    ],
    comments: [
      { id: "m-3", author: "Dr. Patil", time: "3h ago", text: "Auxiliary discharge channels opened; pressure decreased by 14%." },
    ],
  },
  {
    id: "risk-3",
    name: "Katraj Ghat Slope Debris Landslide",
    category: "Geological",
    owner: "Geological Survey & NHAI",
    likelihood: 3.2,
    impact: 4.2,
    affectedAssets: "NH-48 corridor & southern fiber lines",
    assetCount: 28000,
    status: "Open",
    lastUpdated: "2 days ago",
    trend: [45, 52, 58, 67],
    previousPosition: { likelihood: 2.6, impact: 3.9 },
    location: { cx: 345, cy: 305, zoneId: "katraj", zoneName: "Katraj" },
    description: "Heavy subsurface moisture saturation causing unstable rock and earth displacement along the old tunnel pass.",
    controls: [
      { id: "c-6", name: "Geotechnical acoustic slip sensors monitoring", completed: true, owner: "Geotech Team" },
      { id: "c-7", name: "Catch-fence structural reinforcement", completed: false, owner: "Highways Infra" },
    ],
    comments: [
      { id: "m-4", author: "Observer Joshi", time: "5h ago", text: "Minor stonefall detected at km marker 42.1." },
    ],
  },
  {
    id: "risk-4",
    name: "Hospital Sub-Station Transformer Ingress",
    category: "Infrastructure",
    owner: "Health Directorate",
    likelihood: 2.0,
    impact: 4.9,
    affectedAssets: "Sancheti Trauma Center, 1,200 ICU beds",
    assetCount: 12000,
    status: "Mitigated",
    lastUpdated: "Sep 18",
    trend: [72, 65, 50, 39],
    previousPosition: { likelihood: 3.4, impact: 4.9 },
    location: { cx: 325, cy: 185, zoneId: "aundh", zoneName: "Aundh" },
    description: "Basement level electrical switchgear exposure to rising groundwater table during sustained cloudbursts.",
    controls: [
      { id: "c-8", name: "Install watertight containment bulkhead doors", completed: true, owner: "Facility Ops" },
      { id: "c-9", name: "Elevate backup diesel generators to Level +2", completed: true, owner: "Hospital Eng" },
    ],
    comments: [
      { id: "m-5", author: "Admin Shinde", time: "2 days ago", text: "Bulkhead pressure inspection passed; generator elevation 100% verified." },
    ],
  },
  {
    id: "risk-5",
    name: "Contaminated Urban Runoff Infiltration",
    category: "Health",
    owner: "Public Health Department",
    likelihood: 3.6,
    impact: 3.7,
    affectedAssets: "220,000 residents across Katraj & Baner",
    assetCount: 65000,
    status: "Open",
    lastUpdated: "3 days ago",
    trend: [35, 42, 51, 62],
    previousPosition: { likelihood: 2.9, impact: 3.2 },
    location: { cx: 215, cy: 175, zoneId: "baner", zoneName: "Baner" },
    description: "Flooding mixing storm runoff with municipal sewer overflows near secondary distribution pumping chambers.",
    controls: [
      { id: "c-10", name: "Automated chlorine dosing ramp-up", completed: true, owner: "Water Board" },
      { id: "c-11", name: "Issue precautionary boil-water advisory via SMS", completed: false, owner: "Health Dept" },
    ],
    comments: [
      { id: "m-6", author: "Chief Medical Officer", time: "1 day ago", text: "Mobile water testing units dispatched across Sector 4." },
    ],
  },
  {
    id: "risk-6",
    name: "Emergency Response Fleet Fuel Chokepoint",
    category: "Logistical",
    owner: "Emergency Operations Hub",
    likelihood: 1.8,
    impact: 3.9,
    affectedAssets: "42 ambulances, 18 heavy pump trucks",
    assetCount: 8500,
    status: "Accepted",
    lastUpdated: "Sep 15",
    trend: [36, 36, 36, 35],
    previousPosition: { likelihood: 1.8, impact: 3.9 },
    location: { cx: 450, cy: 235, zoneId: "hadapsar", zoneName: "Hadapsar" },
    description: "Depot access delays during submerged arterial routes leading to 25-minute response lag for logistics tankers.",
    controls: [
      { id: "c-12", name: "Contract private elevated fuel storage depots", completed: true, owner: "Fleet Logistics" },
    ],
    comments: [
      { id: "m-7", author: "Fleet Director", time: "Sep 15", text: "Contingency reserve maintained at 15,000 liters." },
    ],
  },
  {
    id: "risk-7",
    name: "Hinjewadi IT Cluster Surface Drainage Backflow",
    category: "Hydrological",
    owner: "Municipal Drainage",
    likelihood: 4.1,
    impact: 3.2,
    affectedAssets: "Tech park sub-stations, 85,000 workers",
    assetCount: 45000,
    status: "In Progress",
    lastUpdated: "Today, 09:10",
    trend: [74, 72, 68, 65],
    previousPosition: { likelihood: 4.6, impact: 3.5 },
    location: { cx: 215, cy: 175, zoneId: "baner", zoneName: "Baner" },
    description: "Culvert capacity deficit during peak rainfall resulting in localized campus parking and feeder road inundation.",
    controls: [
      { id: "c-13", name: "Temporary storm diversion trenches", completed: true, owner: "Tech Park Infra" },
      { id: "c-14", name: "Remote work advisory triggered for non-essential staff", completed: true, owner: "Corporate Liaison" },
    ],
    comments: [
      { id: "m-8", author: "Infra Lead Rao", time: "Today", text: "Phase 1 trenching operational; water receding steadily." },
    ],
  },
  {
    id: "risk-8",
    name: "Highway Underpass Automated Sump Tripping",
    category: "Infrastructure",
    owner: "Civil Defense Directorate",
    likelihood: 4.5,
    impact: 2.7,
    affectedAssets: "Baner Highway underpass freight flow",
    assetCount: 22000,
    status: "Open",
    lastUpdated: "Today, 11:45",
    trend: [48, 54, 58, 61],
    previousPosition: { likelihood: 3.8, impact: 2.7 },
    location: { cx: 215, cy: 175, zoneId: "baner", zoneName: "Baner" },
    description: "Electrical trip on dual high-capacity sump motors due to stormwater silt accumulation at pump intake screens.",
    controls: [
      { id: "c-15", name: "Deploy manual diesel suction pump truck", completed: false, owner: "Drainage Ops" },
    ],
    comments: [
      { id: "m-9", author: "Ops Dispatch", time: "2h ago", text: "Emergency diesel unit en route to Baner underpass." },
    ],
  },
  {
    id: "risk-9",
    name: "Bridge Pier Foundation Hydrodynamic Scour",
    category: "Geological",
    owner: "Highways Authority",
    likelihood: 2.2,
    impact: 4.6,
    affectedAssets: "Sangam Bridge regional connector",
    assetCount: 31000,
    status: "Mitigated",
    lastUpdated: "Sep 12",
    trend: [66, 60, 50, 42],
    previousPosition: { likelihood: 3.1, impact: 4.6 },
    location: { cx: 290, cy: 155, zoneId: "aundh", zoneName: "Aundh" },
    description: "High-velocity river vortices scouring stone apron foundations of historical masonry bridge piers.",
    controls: [
      { id: "c-16", name: "Underwater sonar foundation scan", completed: true, owner: "Marine Survey" },
      { id: "c-17", name: "Rip-rap boulder placement along pier noses", completed: true, owner: "Highways Infra" },
    ],
    comments: [
      { id: "m-10", author: "Chief Inspector", time: "Sep 12", text: "Rip-rap placement reinforced; scour depth stabilized." },
    ],
  },
  {
    id: "risk-10",
    name: "Disaster Supply Chain Staging Depot Congestion",
    category: "Logistical",
    owner: "Emergency Operations Hub",
    likelihood: 2.8,
    impact: 3.3,
    affectedAssets: "Warehouse cluster 4B & distribution fleet",
    assetCount: 15000,
    status: "Open",
    lastUpdated: "4 days ago",
    trend: [30, 36, 42, 46],
    previousPosition: { likelihood: 2.1, impact: 2.9 },
    location: { cx: 450, cy: 235, zoneId: "hadapsar", zoneName: "Hadapsar" },
    description: "Incoming relief trucks bottlenecks along single-lane access roads during heightened flood response cycles.",
    controls: [
      { id: "c-18", name: "Open secondary warehouse staging bay", completed: false, owner: "Logistics Hub" },
      { id: "c-19", name: "Stagger truck delivery schedule slots", completed: true, owner: "Logistics Hub" },
    ],
    comments: [
      { id: "m-11", author: "Depot Manager", time: "2 days ago", text: "Staggered dispatch has reduced line wait times by 30%." },
    ],
  },
];

export interface RiskThresholds {
  medium: number; // default: 25
  high: number; // default: 50
  critical: number; // default: 75
}

function calculateExposure(likelihood: number, impact: number): number {
  return Math.round(likelihood * impact * 4); // Scaled 4 - 100
}

function getRiskSeverity(
  likelihood: number,
  impact: number,
  thresholds: RiskThresholds
): "low" | "moderate" | "high" | "critical" {
  const exposure = calculateExposure(likelihood, impact);
  if (exposure >= thresholds.critical) return "critical";
  if (exposure >= thresholds.high) return "high";
  if (exposure >= thresholds.medium) return "moderate";
  return "low";
}

/* ---------------------------------------------------------------------
   MINI SPARKLINE COMPONENT
--------------------------------------------------------------------- */
function MiniSparkline({ data, color = "#5EA8E0", width = 72, height = 24 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = (max - min) === 0 ? 1 : (max - min);
  const pts = data.map((val, idx) => {
    const rawX = (idx / Math.max(1, data.length - 1)) * (width - 4) + 2;
    const rawY = height - 4 - ((val - min) / range) * (height - 8);
    const x = isNaN(rawX) ? 0 : Number(rawX.toFixed(1));
    const y = isNaN(rawY) ? height / 2 : Number(rawY.toFixed(1));
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((val, idx) => {
        const rawX = (idx / Math.max(1, data.length - 1)) * (width - 4) + 2;
        const rawY = height - 4 - ((val - min) / range) * (height - 8);
        const x = isNaN(rawX) ? 0 : Number(rawX.toFixed(1));
        const y = isNaN(rawY) ? height / 2 : Number(rawY.toFixed(1));
        return <circle key={idx} cx={x} cy={y} r="2" fill={color} />;
      })}
    </svg>
  );
}

/* ---------------------------------------------------------------------
   AI EMERGING RISKS SUMMARY PANEL
--------------------------------------------------------------------- */
function EmergingRisksAiPanel({ risks }: { risks: RiskItem[] }) {
  const [open, setOpen] = useState(true);

  // Derive top 3 by highest exposure and positive velocity
  const topRisks = useMemo(() => {
    return [...risks]
      .sort((a, b) => calculateExposure(b.likelihood, b.impact) - calculateExposure(a.likelihood, a.impact))
      .slice(0, 3);
  }, [risks]);

  return (
    <div className="rounded-2xl border border-sky-400/20 bg-gradient-to-r from-sky-400/[0.06] via-indigo-500/[0.04] to-transparent p-4 backdrop-blur-xl transition-all">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-sky-400/15 border border-sky-400/30 flex items-center justify-center text-sky-300 shadow-sm">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-semibold text-white tracking-wide">
                AI Executive Intelligence: Top 3 Emerging Risks This Month
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-400/20 text-sky-200 border border-sky-400/30">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-white/45">
              Synthesized from watershed sensors, municipal maintenance tickets, and hazard reports.
            </p>
          </div>
        </div>

        <button className="text-white/40 hover:text-white transition p-1">
          <ChevronDown className={cx("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden pt-3 border-t border-white/[0.06] mt-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {topRisks.map((risk, idx) => {
                const exposure = calculateExposure(risk.likelihood, risk.impact);
                const prevExp = calculateExposure(risk.previousPosition.likelihood, risk.previousPosition.impact);
                const delta = exposure - prevExp;

                return (
                  <div
                    key={risk.id}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 hover:border-white/20 transition space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-[11px] font-mono text-sky-400 font-bold">#0{idx + 1}</span>
                      <span className={cx(
                        "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                        exposure >= 75 ? "bg-red-400/20 text-red-300 border border-red-400/30" : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                      )}>
                        Exposure {exposure}
                      </span>
                    </div>

                    <h4 className="text-[12px] font-semibold text-white/95 leading-snug line-clamp-1">
                      {risk.name}
                    </h4>

                    <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2">
                      {risk.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-white/45 pt-1 border-t border-white/[0.04]">
                      <span>{risk.owner}</span>
                      <span className={delta >= 0 ? "text-amber-300 font-medium" : "text-emerald-300 font-medium"}>
                        {delta >= 0 ? `+${delta}% Q-o-Q` : `${delta}% Q-o-Q`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------------------------
   INTERACTIVE MATRIX HEATMAP COMPONENT
--------------------------------------------------------------------- */
function RiskMatrixView({
  risks,
  selectedRisk,
  onSelectRisk,
  onUpdateRiskPosition,
  thresholds,
  comparisonMode,
  colorblindMode,
  lightTheme,
}: {
  risks: RiskItem[];
  selectedRisk: RiskItem | null;
  onSelectRisk: (risk: RiskItem | null) => void;
  onUpdateRiskPosition: (riskId: string, likelihood: number, impact: number) => void;
  thresholds: RiskThresholds;
  comparisonMode: boolean;
  colorblindMode: boolean;
  lightTheme: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredRisk, setHoveredRisk] = useState<RiskItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // 5x5 cells layout: rows = Impact 5 down to 1, cols = Likelihood 1 up to 5
  const impactLevels = [5, 4, 3, 2, 1];
  const impactLabels = ["5 · Catastrophic", "4 · Major", "3 · Moderate", "2 · Minor", "1 · Negligible"];
  const likelihoodLevels = [1, 2, 3, 4, 5];
  const likelihoodLabels = ["1 · Rare", "2 · Unlikely", "3 · Possible", "4 · Likely", "5 · Almost Certain"];

  const handleDragEnd = (riskId: string, info: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Map pixel drop coordinates to Likelihood (1-5) and Impact (1-5)
    const clientX = info.point.x;
    const clientY = info.point.y;

    const relX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const relY = Math.max(0, Math.min(rect.height, clientY - rect.top));

    // X: left = 1.0, right = 5.0
    const newLikelihood = Math.round((1 + (relX / rect.width) * 4) * 10) / 10;
    // Y: top = 5.0, bottom = 1.0
    const newImpact = Math.round((5 - (relY / rect.height) * 4) * 10) / 10;

    onUpdateRiskPosition(riskId, Math.max(1, Math.min(5, newLikelihood)), Math.max(1, Math.min(5, newImpact)));
  };

  return (
    <div className={cx(
      "rounded-2xl border p-5 relative overflow-hidden transition-colors select-none",
      lightTheme
        ? "bg-slate-50 border-slate-200 text-slate-900"
        : "bg-[#0A0E18] border-white/[0.08] text-white"
    )}>
      {/* Accessible SVG Pattern Definitions */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <pattern id="pattern-low" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 0 8 L 8 0" stroke="rgba(63,201,138,0.35)" strokeWidth="1.2" />
          </pattern>
          <pattern id="pattern-moderate" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="1.5" fill="rgba(231,185,76,0.4)" />
          </pattern>
          <pattern id="pattern-high" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 0 0 L 8 8 M 8 0 L 0 8" stroke="rgba(227,138,70,0.35)" strokeWidth="1" />
          </pattern>
          <pattern id="pattern-critical" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="rgba(228,87,79,0.18)" />
            <path d="M 0 0 L 8 8 M 8 0 L 0 8" stroke="rgba(228,87,79,0.5)" strokeWidth="1.2" />
          </pattern>
        </defs>
      </svg>

      {/* Matrix Header & Instructions */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <span className="text-xs font-bold tracking-wider uppercase opacity-50 font-mono">
            Enterprise Likelihood vs. Impact Risk Matrix (5×5)
          </span>
          <p className="text-[12px] opacity-70 mt-0.5">
            Interactive drag-and-drop bubbles to recalibrate risk coordinates live. Bubble diameter reflects exposure volume.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] opacity-70">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3FC98A]" /> Low</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E7B94C]" /> Medium</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E38A46]" /> High</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E4574F]" /> Critical</span>
        </div>
      </div>

      {/* Matrix Grid Container */}
      <div className="flex">
        {/* Y-Axis Label */}
        <div className="w-7 flex flex-col items-center justify-center pr-2">
          <span className="text-[11px] font-bold uppercase tracking-widest -rotate-90 whitespace-nowrap opacity-60">
            Impact →
          </span>
        </div>

        {/* Y-Axis Scale Ticks */}
        <div className="w-28 flex flex-col justify-between py-4 pr-3 text-[11px] font-medium opacity-60 text-right shrink-0">
          {impactLabels.map((lbl, idx) => (
            <div key={idx} className="h-10 flex items-center justify-end">
              {lbl}
            </div>
          ))}
        </div>

        {/* Main 5x5 Heat-Map Grid with Plotted Bubbles */}
        <div className="flex-1 flex flex-col">
          <div
            ref={containerRef}
            className={cx(
              "relative rounded-xl border overflow-hidden min-h-[420px] h-[460px] grid grid-cols-5 grid-rows-5",
              lightTheme ? "border-slate-300" : "border-white/10"
            )}
          >
            {/* 25 Matrix Cells */}
            {impactLevels.map((impact) =>
              likelihoodLevels.map((likelihood) => {
                const cellSeverity = getRiskSeverity(likelihood, impact, thresholds);
                const colorToken = RISK[cellSeverity];

                return (
                  <div
                    key={`cell-${likelihood}-${impact}`}
                    className={cx(
                      "relative border-r border-b transition-colors flex items-end justify-end p-1 text-[10px] font-mono select-none",
                      lightTheme ? "border-slate-200" : "border-white/[0.04]"
                    )}
                    style={{
                      backgroundColor: lightTheme
                        ? cellSeverity === "critical"
                          ? "rgba(239, 68, 68, 0.15)"
                          : cellSeverity === "high"
                          ? "rgba(249, 115, 22, 0.12)"
                          : cellSeverity === "moderate"
                          ? "rgba(234, 179, 8, 0.12)"
                          : "rgba(34, 197, 94, 0.10)"
                        : colorToken.bg,
                    }}
                  >
                    {/* Colorblind Pattern Overlay */}
                    {colorblindMode && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage: `url(#pattern-${cellSeverity})`,
                        }}
                      />
                    )}

                    <span className="opacity-30 relative z-10 text-[9px]">
                      {colorblindMode ? cellSeverity[0].toUpperCase() : `${likelihood * impact}`}
                    </span>
                  </div>
                );
              })
            )}

            {/* Comparison Mode Ghost Vectors & Markers */}
            {comparisonMode && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {risks.map((r) => {
                  if (!r.previousPosition) return null;
                  const fromX = ((r.previousPosition.likelihood - 1) / 4) * 100;
                  const fromY = ((5 - r.previousPosition.impact) / 4) * 100;
                  const toX = ((r.likelihood - 1) / 4) * 100;
                  const toY = ((5 - r.impact) / 4) * 100;

                  return (
                    <g key={`ghost-line-${r.id}`}>
                      {/* Movement vector arrow */}
                      <line
                        x1={`${fromX}%`}
                        y1={`${fromY}%`}
                        x2={`${toX}%`}
                        y2={`${toY}%`}
                        stroke="#5EA8E0"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity="0.65"
                      />
                      {/* Ghost node */}
                      <circle
                        cx={`${fromX}%`}
                        cy={`${fromY}%`}
                        r="11"
                        fill="rgba(94, 168, 224, 0.15)"
                        stroke="#5EA8E0"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Plotted Risk Bubbles */}
            {risks.map((r) => {
              const exposure = calculateExposure(r.likelihood, r.impact);
              const severity = getRiskSeverity(r.likelihood, r.impact, thresholds);
              const color = RISK[severity].color;
              const isSelected = selectedRisk?.id === r.id;

              // Size: 26px to 54px based on exposure
              const size = Math.round(26 + (exposure / 100) * 28);

              // Percentage coordinates on the 5x5 grid
              const leftPct = ((r.likelihood - 1) / 4) * 100;
              const topPct = ((5 - r.impact) / 4) * 100;

              return (
                <motion.div
                  key={r.id}
                  drag
                  dragConstraints={containerRef}
                  dragElastic={0.08}
                  onDragEnd={(e, info) => handleDragEnd(r.id, info)}
                  whileHover={{ scale: 1.15, zIndex: 50 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectRisk(r)}
                  onMouseEnter={(e) => {
                    setHoveredRisk(r);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
                  }}
                  onMouseLeave={() => setHoveredRisk(null)}
                  className={cx(
                    "absolute cursor-grab active:cursor-grabbing rounded-full flex items-center justify-center transition-shadow select-none z-20",
                    isSelected ? "ring-4 ring-white shadow-2xl z-40" : "shadow-lg"
                  )}
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    transform: "translate(-50%, -50%)",
                    backgroundColor: color,
                    boxShadow: isSelected
                      ? `0 0 24px ${color}, 0 8px 30px rgba(0,0,0,0.6)`
                      : `0 0 14px ${color}55, 0 4px 16px rgba(0,0,0,0.4)`,
                  }}
                >
                  <span className="text-[10px] font-extrabold text-[#05111b] pointer-events-none tabular-nums">
                    {exposure}
                  </span>

                  {/* Pulsing ring for critical risks */}
                  {severity === "critical" && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping opacity-35 pointer-events-none"
                      style={{ backgroundColor: color }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* X-Axis Scale Ticks */}
          <div className="grid grid-cols-5 pt-2 text-[11px] font-medium opacity-60 text-center">
            {likelihoodLabels.map((lbl, idx) => (
              <div key={idx} className="truncate px-1">
                {lbl}
              </div>
            ))}
          </div>

          {/* X-Axis Label */}
          <div className="text-center pt-2">
            <span className="text-[11px] font-bold uppercase tracking-widest opacity-60">
              Likelihood →
            </span>
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      <AnimatePresence>
        {hoveredRisk && tooltipPos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 6 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full rounded-xl border border-white/20 bg-[#080E18]/95 p-3 shadow-2xl backdrop-blur-xl text-white text-xs max-w-[280px]"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-1.5 mb-1.5">
              <span className="font-bold text-white truncate">{hoveredRisk.name}</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                style={{
                  backgroundColor: RISK[getRiskSeverity(hoveredRisk.likelihood, hoveredRisk.impact, thresholds)].bg,
                  color: RISK[getRiskSeverity(hoveredRisk.likelihood, hoveredRisk.impact, thresholds)].color,
                }}
              >
                {getRiskSeverity(hoveredRisk.likelihood, hoveredRisk.impact, thresholds)}
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-white/70">
              <div className="flex justify-between">
                <span>Owner:</span>
                <span className="text-white font-medium truncate max-w-[150px]">{hoveredRisk.owner}</span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="text-sky-300">{hoveredRisk.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Coordinates:</span>
                <span className="font-mono text-white/90 font-medium">L: {hoveredRisk.likelihood} | I: {hoveredRisk.impact}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-amber-300 font-medium">{hoveredRisk.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Exposure:</span>
                <span className="text-white font-bold">{calculateExposure(hoveredRisk.likelihood, hoveredRisk.impact)} / 100</span>
              </div>
            </div>

            <div className="mt-2 pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-white/40">
              <span>Updated: {hoveredRisk.lastUpdated}</span>
              <span className="text-sky-400 font-medium">Click to inspect →</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------------------------
   RISK DETAIL DRAWER / SLIDE-OVER PANEL
--------------------------------------------------------------------- */
function RiskDetailDrawer({
  risk,
  onClose,
  onUpdateRisk,
  thresholds,
  lightTheme,
}: {
  risk: RiskItem;
  onClose: () => void;
  onUpdateRisk: (updated: RiskItem) => void;
  thresholds: RiskThresholds;
  lightTheme: boolean;
}) {
  const [commentText, setCommentText] = useState("");
  const exposure = calculateExposure(risk.likelihood, risk.impact);
  const severity = getRiskSeverity(risk.likelihood, risk.impact, thresholds);
  const color = RISK[severity].color;

  const handleToggleControl = (controlId: string) => {
    const updatedControls = risk.controls.map((c) =>
      c.id === controlId ? { ...c, completed: !c.completed } : c
    );
    onUpdateRisk({ ...risk, controls: updatedControls });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment: RiskComment = {
      id: `comm-${Date.now()}`,
      author: "Risk Director",
      time: "Just now",
      text: commentText.trim(),
    };
    onUpdateRisk({ ...risk, comments: [newComment, ...risk.comments] });
    setCommentText("");
  };

  const completedCount = risk.controls.filter((c) => c.completed).length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={cx(
          "w-full max-w-lg h-full overflow-y-auto border-l p-6 shadow-2xl flex flex-col justify-between",
          lightTheme ? "bg-white border-slate-200 text-slate-900" : "bg-[#090E17] border-white/10 text-white"
        )}
      >
        <div className="space-y-5">
          {/* Header Bar */}
          <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: lightTheme ? "#e2e8f0" : "rgba(255,255,255,0.08)" }}>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-400/15 text-sky-400 border border-sky-400/30">
                  {risk.category}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-bold uppercase"
                  style={{ backgroundColor: RISK[severity].bg, color }}
                >
                  {severity} Tier
                </span>
                <span className="text-[11px] opacity-40">#{risk.id}</span>
              </div>

              <h2 className="text-lg font-bold leading-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
                {risk.name}
              </h2>
              <p className="text-[12px] opacity-60 mt-1 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Owner: <strong className="opacity-90">{risk.owner}</strong>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:bg-white/10 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Exposure Score & Trend Sparkline Card */}
          <div className={cx(
            "p-4 rounded-xl border flex items-center justify-between gap-4",
            lightTheme ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/[0.07]"
          )}>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold opacity-50 block">
                Risk Exposure Index
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold tabular-nums" style={{ color }}>
                  {exposure}
                </span>
                <span className="text-xs opacity-50 font-medium">/ 100</span>
              </div>
              <span className="text-[11px] opacity-60 block mt-0.5">
                Impact: {risk.affectedAssets}
              </span>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="text-[10px] uppercase font-semibold opacity-50 mb-1">
                Quarterly Trajectory
              </span>
              <MiniSparkline data={risk.trend} color={color} width={80} height={28} />
              <span className="text-[10px] text-amber-400 font-semibold mt-1">
                {risk.trend[3] >= risk.trend[0] ? "↑ Escalating trend" : "↓ Mitigating trend"}
              </span>
            </div>
          </div>

          {/* Live Recalibration Sliders */}
          <div className={cx(
            "p-4 rounded-xl border space-y-3",
            lightTheme ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/[0.07]"
          )}>
            <span className="text-xs font-bold uppercase tracking-wider opacity-60 block">
              Live Coordinate Recalibration
            </span>

            {/* Likelihood Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>Likelihood</span>
                <span className="font-mono font-bold" style={{ color }}>{risk.likelihood} / 5.0</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={0.1}
                value={risk.likelihood}
                onChange={(e) => onUpdateRisk({ ...risk, likelihood: Number(e.target.value) })}
                className="w-full h-1.5 rounded-lg appearance-none bg-white/10 accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Impact Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>Impact</span>
                <span className="font-mono font-bold" style={{ color }}>{risk.impact} / 5.0</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={0.1}
                value={risk.impact}
                onChange={(e) => onUpdateRisk({ ...risk, impact: Number(e.target.value) })}
                className="w-full h-1.5 rounded-lg appearance-none bg-white/10 accent-sky-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-60 block mb-1">
              Scenario Diagnostic
            </span>
            <p className="text-[12px] opacity-80 leading-relaxed bg-white/[0.01] p-3 rounded-xl border border-white/[0.05]">
              {risk.description}
            </p>
          </div>

          {/* Linked Controls Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                Linked Mitigation Controls ({completedCount}/{risk.controls.length})
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {Math.round((completedCount / (risk.controls.length || 1)) * 100)}% Complete
              </span>
            </div>

            <div className="space-y-1.5">
              {risk.controls.map((ctrl) => (
                <div
                  key={ctrl.id}
                  onClick={() => handleToggleControl(ctrl.id)}
                  className={cx(
                    "flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors text-xs",
                    ctrl.completed
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white/80"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cx(
                      "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                      ctrl.completed ? "bg-emerald-400 border-emerald-400 text-black" : "border-white/30"
                    )}>
                      {ctrl.completed && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className={ctrl.completed ? "line-through opacity-70" : ""}>{ctrl.name}</span>
                  </div>
                  <span className="text-[10px] opacity-50 shrink-0">{ctrl.owner}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Comments Log */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider opacity-60 block">
              Operational Audit Log & Notes ({risk.comments.length})
            </span>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Log operational status or update..."
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-sky-400/50"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-3 py-2 rounded-xl bg-sky-400/20 border border-sky-400/40 text-sky-200 text-xs font-semibold hover:bg-sky-400/30 disabled:opacity-40 transition"
              >
                Log
              </button>
            </form>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {risk.comments.map((comm) => (
                <div key={comm.id} className="p-2.5 rounded-xl border border-white/[0.05] bg-white/[0.01] text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px] opacity-50">
                    <span className="font-semibold text-sky-400">{comm.author}</span>
                    <span>{comm.time}</span>
                  </div>
                  <p className="opacity-80 text-[11px] leading-snug">{comm.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-6 border-t border-white/[0.08] flex items-center justify-between gap-2">
          <button
            onClick={() => onUpdateRisk({ ...risk, status: risk.status === "Mitigated" ? "Open" : "Mitigated" })}
            className={cx(
              "flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1.5",
              risk.status === "Mitigated"
                ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
                : "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{risk.status === "Mitigated" ? "Re-open Risk" : "Mark Mitigated"}</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-white/10 text-xs font-medium opacity-70 hover:opacity-100 hover:bg-white/5 transition"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   EXECUTIVE BOARD SUMMARY VIEW
--------------------------------------------------------------------- */
function ExecutiveSummaryView({ risks }: { risks: RiskItem[] }) {
  const totalAssets = risks.reduce((acc, r) => acc + r.assetCount, 0);
  const avgExposure = Math.round(
    risks.reduce((acc, r) => acc + calculateExposure(r.likelihood, r.impact), 0) / (risks.length || 1)
  );
  const criticalCount = risks.filter((r) => calculateExposure(r.likelihood, r.impact) >= 75).length;
  const highCount = risks.filter((r) => {
    const e = calculateExposure(r.likelihood, r.impact);
    return e >= 50 && e < 75;
  }).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-xl">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-white/50 block">
          Portfolio Risk Index
        </span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold text-sky-400">{avgExposure}</span>
          <span className="text-xs text-white/40">/ 100 aggregate</span>
        </div>
        <p className="text-[11px] text-white/60 mt-1">Weighted exposure across 10 strategic assets</p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-xl">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-white/50 block">
          Critical & High Threats
        </span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold text-red-400">{criticalCount + highCount}</span>
          <span className="text-xs text-red-300">({criticalCount} Critical, {highCount} High)</span>
        </div>
        <p className="text-[11px] text-white/60 mt-1">Requiring immediate executive intervention</p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-xl">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-white/50 block">
          Total Exposed Population
        </span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold text-amber-300">{(totalAssets / 1000).toFixed(0)}k</span>
          <span className="text-xs text-white/40">citizens / assets</span>
        </div>
        <p className="text-[11px] text-white/60 mt-1">Across Lonavala, Aundh, Baner & Katraj corridors</p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-xl">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-white/50 block">
          Controls Completion Rate
        </span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold text-emerald-400">68%</span>
          <span className="text-xs text-emerald-300">+8% this month</span>
        </div>
        <p className="text-[11px] text-white/60 mt-1">16 of 23 active mitigation tasks verified</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   THRESHOLD SETTINGS MODAL
--------------------------------------------------------------------- */
function LegendThresholdModal({
  thresholds,
  onChange,
  onClose,
}: {
  thresholds: RiskThresholds;
  onChange: (t: RiskThresholds) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#090E17] p-5 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sliders className="h-4 w-4 text-sky-400" />
            <span>Customize Severity Thresholds</span>
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-white/60">
          Redefine matrix boundary scores. Modifying thresholds dynamically shifts quadrant colors and risk tiers.
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between font-medium mb-1">
              <span className="text-amber-300">Medium Cutoff:</span>
              <span className="font-mono font-bold text-white">{thresholds.medium}</span>
            </div>
            <input
              type="range"
              min={15}
              max={40}
              value={thresholds.medium}
              onChange={(e) => onChange({ ...thresholds, medium: Number(e.target.value) })}
              className="w-full h-1.5 rounded-lg appearance-none bg-white/10 accent-amber-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium mb-1">
              <span className="text-orange-300">High Cutoff:</span>
              <span className="font-mono font-bold text-white">{thresholds.high}</span>
            </div>
            <input
              type="range"
              min={41}
              max={70}
              value={thresholds.high}
              onChange={(e) => onChange({ ...thresholds, high: Number(e.target.value) })}
              className="w-full h-1.5 rounded-lg appearance-none bg-white/10 accent-orange-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium mb-1">
              <span className="text-red-400">Critical Cutoff:</span>
              <span className="font-mono font-bold text-white">{thresholds.critical}</span>
            </div>
            <input
              type="range"
              min={71}
              max={90}
              value={thresholds.critical}
              onChange={(e) => onChange({ ...thresholds, critical: Number(e.target.value) })}
              className="w-full h-1.5 rounded-lg appearance-none bg-white/10 accent-red-400 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={() => onChange({ medium: 25, high: 50, critical: 75 })}
            className="px-3 py-1.5 rounded-xl border border-white/10 text-xs text-white/60 hover:text-white"
          >
            Reset Defaults
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-sky-400/20 border border-sky-400/40 text-sky-200 text-xs font-semibold hover:bg-sky-400/30"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

const TIMELINE_STEPS = [
  { label: "Now", hourOffset: 0, mult: 0 },
  { label: "+1h", hourOffset: 1, mult: 0.08 },
  { label: "+2h", hourOffset: 2, mult: 0.17 },
  { label: "+3h", hourOffset: 3, mult: 0.28 },
  { label: "+6h", hourOffset: 6, mult: 0.44 },
];

function TimelineScrubber({
  currentStep,
  onChange,
}: {
  currentStep: number;
  onChange: (step: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
      <span className="text-[11px] font-medium text-white/40 px-2 flex items-center gap-1">
        <Activity className="h-3 w-3" />
        Forecast
      </span>
      {TIMELINE_STEPS.map((step, index) => (
        <button
          key={index}
          className={`px-3 py-1 text-[11px] font-medium rounded-lg transition ${
            currentStep === index
              ? "bg-sky-400/20 text-sky-200 border border-sky-400/30"
              : "text-white/60 hover:bg-white/5"
          }`}
          onClick={() => onChange(index)}
        >
          {step.label}
        </button>
      ))}
    </div>
  );
}

function HistoricalFloodOverlay() {
  return (
    <g className="historical-flood-layer" opacity={0.9}>
      <path
        d="M 95 140 C 135 100 195 130 235 170 C 265 200 245 240 205 260 C 155 280 115 240 85 210 C 60 180 65 150 95 140 Z"
        fill="#5EA8E0"
        fillOpacity={0.12}
        stroke="#5EA8E0"
        strokeWidth={1.2}
        strokeDasharray="4 4"
        strokeOpacity={0.35}
      />
      <path
        d="M 310 120 C 350 100 400 110 430 140 C 450 165 430 200 390 210 C 340 220 300 200 290 170 C 280 140 295 125 310 120 Z"
        fill="#5EA8E0"
        fillOpacity={0.12}
        stroke="#5EA8E0"
        strokeWidth={1.2}
        strokeDasharray="4 4"
        strokeOpacity={0.35}
      />
      <path
        d="M 280 270 C 320 250 370 260 390 300 C 410 330 370 360 320 355 C 280 350 250 320 260 290 C 265 275 275 270 280 270 Z"
        fill="#5EA8E0"
        fillOpacity={0.12}
        stroke="#5EA8E0"
        strokeWidth={1.2}
        strokeDasharray="4 4"
        strokeOpacity={0.35}
      />
    </g>
  );
}

function ResourceMarkers({
  shelters,
  hospitals,
}: {
  shelters: typeof SHELTERS;
  hospitals: typeof HOSPITALS;
}) {
  const getCapacityColor = (capPct: number) => {
    if (capPct < 60) return "#3FC98A";
    if (capPct <= 85) return "#E7B94C";
    return "#E4574F";
  };

  return (
    <g className="resources-layer">
      {shelters.map((s) => (
        <circle
          key={`reach-sh-${s.id}`}
          cx={s.cx}
          cy={s.cy}
          r={38}
          fill="rgba(94, 168, 224, 0.03)"
          stroke="rgba(94, 168, 224, 0.22)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      ))}
      {hospitals.map((h) => (
        <circle
          key={`reach-hosp-${h.id}`}
          cx={h.cx}
          cy={h.cy}
          r={44}
          fill="rgba(63, 201, 138, 0.03)"
          stroke="rgba(63, 201, 138, 0.2)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      ))}
      {shelters.map((s) => {
        const color = getCapacityColor(s.capacityPct);
        return (
          <g key={s.id} className="cursor-pointer">
            <title>{`${s.name} · ${s.capacityPct}% capacity`}</title>
            <circle cx={s.cx} cy={s.cy} r={10} fill="#0b2635" stroke={color} strokeWidth={1.5} />
            <path
              d={`M ${s.cx - 4} ${s.cy + 3} L ${s.cx - 4} ${s.cy - 1} L ${s.cx} ${s.cy - 5} L ${s.cx + 4} ${s.cy - 1} L ${s.cx + 4} ${s.cy + 3} Z`}
              fill={color}
            />
            <text x={s.cx} y={s.cy + 17} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7.5" fontWeight="600">
              Shelter ({s.capacityPct}%)
            </text>
          </g>
        );
      })}
      {hospitals.map((h) => {
        const color = getCapacityColor(h.capacityPct);
        return (
          <g key={h.id} className="cursor-pointer">
            <title>{`${h.name} · ${h.capacityPct}% capacity`}</title>
            <circle cx={h.cx} cy={h.cy} r={10} fill="#181f28" stroke={color} strokeWidth={1.5} />
            <path
              d={`M ${h.cx - 1.5} ${h.cy - 4} H ${h.cx + 1.5} V ${h.cy - 1.5} H ${h.cx + 4} V ${h.cy + 1.5} H ${h.cx + 1.5} V ${h.cy + 4} H ${h.cx - 1.5} V ${h.cy + 1.5} H ${h.cx - 4} V ${h.cy - 1.5} H ${h.cx - 1.5} Z`}
              fill={color}
            />
            <text x={h.cx} y={h.cy + 17} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7.5" fontWeight="600">
              Hospital ({h.capacityPct}%)
            </text>
          </g>
        );
      })}
    </g>
  );
}

/* ---------------------------------------------------------------------
   FRONTEND AI PREDICTION MODEL & SPATIAL ENGINE
--------------------------------------------------------------------- */
interface ZoneModelItem {
  id: string;
  name: string;
  cx?: number;
  cy?: number;
  lat: number;
  lng: number;
  baseRisk: number;
  vulnerability: number;
  rainfall: number;
  reports: number;
  shelter: string;
  hospital: string;
  elevation?: number;
}

/**
 * Pure JavaScript Multi-factor AI Flood Risk Prediction Algorithm
 * Inputs: rainfall (forecasted), vulnerability, reports, month (monsoon index), elevation
 */
function computeRiskScore(zone: ZoneModelItem, forecastStep = 0, zoneIndex = 0): number {
  const month = new Date().getMonth(); // 0-11
  const monsoon = month >= 5 && month <= 8 ? 1.0 : 0.3; // June-Sept high monsoon
  const rainForecast = Math.max(
    0,
    zone.rainfall * (1 + 0.04 * forecastStep + 0.02 * Math.sin(forecastStep + zoneIndex))
  );
  const elevation = zone.elevation ?? 560; // Pune elevation range ~540 - 620m
  const elevationFactor = Math.max(0, Math.min(1, (620 - elevation) / 80)); // lower elevation = higher flood risk

  const score =
    (Math.min(rainForecast, 120) / 120) * 35 +
    (zone.vulnerability / 100) * 25 +
    (Math.min(zone.reports, 30) / 30) * 20 +
    monsoon * 10 +
    elevationFactor * 10;

  return Math.round(Math.max(0, Math.min(100, score)));
}

function computeConfidence(zone: ZoneModelItem): number {
  return Math.min(
    100,
    Math.round(60 + (Math.min(zone.reports, 30) / 30) * 25 + (zone.rainfall > 50 ? 15 : 0))
  );
}

function getForecastData(zone: ZoneModelItem, zoneIndex = 0): Array<{ t: string; risk: number; rainfall: number }> {
  const timeSteps = [
    { t: "Now", step: 0 },
    { t: "+3h", step: 1 },
    { t: "+6h", step: 2 },
    { t: "+12h", step: 4 },
    { t: "+24h", step: 8 },
  ];

  return timeSteps.map(({ t, step }) => {
    const rain = Math.round(
      zone.rainfall * (1 + 0.04 * step + 0.02 * Math.sin(step + zoneIndex))
    );
    return {
      t,
      risk: computeRiskScore(zone, step, zoneIndex),
      rainfall: rain,
    };
  });
}

// Pune Natural Flood Corridors (Mula-Mutha, Pavana, and Katraj drainage channels)
const PUNE_FLOOD_CORRIDORS = [
  {
    id: "mula-mutha",
    name: "Mula-Mutha River Main Drainage Basin",
    severity: "critical",
    color: "#E4574F",
    coordinates: [
      [18.575, 73.745],
      [18.562, 73.785],
      [18.542, 73.825],
      [18.532, 73.855],
      [18.528, 73.882],
      [18.515, 73.935],
    ] as [number, number][],
  },
  {
    id: "pavana",
    name: "Pavana River Overflow Channel",
    severity: "high",
    color: "#E38A46",
    coordinates: [
      [18.645, 73.755],
      [18.625, 73.792],
      [18.595, 73.822],
      [18.565, 73.835],
    ] as [number, number][],
  },
  {
    id: "katraj-ambil",
    name: "Katraj-Ambil Odha Urban Drainage",
    severity: "high",
    color: "#E7B94C",
    coordinates: [
      [18.445, 73.865],
      [18.475, 73.858],
      [18.502, 73.850],
      [18.522, 73.844],
    ] as [number, number][],
  },
];

// Facilities for Pune region
const PUNE_FACILITIES = [
  { id: "sh-1", name: "Lonavala High Relief Shelter", type: "Shelter", lat: 18.5997, lng: 73.7631, capacity: 78, distance: "1.2 km" },
  { id: "sh-2", name: "Baner Sports Complex Safe Zone", type: "Shelter", lat: 18.561, lng: 73.785, capacity: 45, distance: "0.8 km" },
  { id: "sh-3", name: "Aundh Municipal Relief Center", type: "Shelter", lat: 18.557, lng: 73.809, capacity: 52, distance: "1.5 km" },
  { id: "sh-4", name: "Katraj Community Relief Safe Zone", type: "Shelter", lat: 18.455, lng: 73.863, capacity: 91, distance: "2.1 km" },
  { id: "sh-5", name: "Hadapsar Magarpatta Safe Center", type: "Shelter", lat: 18.511, lng: 73.924, capacity: 62, distance: "1.0 km" },
  { id: "sh-6", name: "Hinjewadi Tech Park Flood Refuge", type: "Shelter", lat: 18.592, lng: 73.737, capacity: 35, distance: "1.8 km" },
  { id: "sh-7", name: "Shivajinagar College Relief Camp", type: "Shelter", lat: 18.533, lng: 73.846, capacity: 80, distance: "0.6 km" },
  { id: "hp-1", name: "Lonavala Emergency Trauma Centre", type: "Hospital", lat: 18.598, lng: 73.765, capacity: 88, distance: "2.4 km" },
  { id: "hp-2", name: "Jupiter Emergency Hospital Baner", type: "Hospital", lat: 18.560, lng: 73.788, capacity: 62, distance: "1.6 km" },
  { id: "hp-3", name: "Shashwat Hospital Aundh", type: "Hospital", lat: 18.559, lng: 73.805, capacity: 40, distance: "2.0 km" },
  { id: "hp-4", name: "Bharati Vidyapeeth Hospital Katraj", type: "Hospital", lat: 18.451, lng: 73.867, capacity: 74, distance: "3.0 km" },
  { id: "hp-5", name: "Noble Hospital Hadapsar", type: "Hospital", lat: 18.507, lng: 73.928, capacity: 50, distance: "1.8 km" },
  { id: "hp-6", name: "Sahyadri Hospital Kothrud", type: "Hospital", lat: 18.508, lng: 73.809, capacity: 75, distance: "1.4 km" },
  { id: "hp-7", name: "Sancheti Hospital Shivajinagar", type: "Hospital", lat: 18.530, lng: 73.843, capacity: 85, distance: "0.9 km" },
];

/* ---------------------------------------------------------------------
   ENTERPRISE RISK MATRIX PAGE
--------------------------------------------------------------------- */
function EnterpriseRiskMatrixPage() {
  const { t } = useTranslation();
  const [risks, setRisks] = useState<RiskItem[]>(INITIAL_RISKS);
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [thresholds, setThresholds] = useState<RiskThresholds>({ medium: 25, high: 50, critical: 75 });
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(true);
  const [colorblindMode, setColorblindMode] = useState(false);
  const [lightTheme] = useState(false);

  const categories = [
    { id: "All", label: t("catAll") },
    { id: "Hydrological", label: t("catHydrological") },
    { id: "Infrastructure", label: t("catInfrastructure") },
    { id: "Geological", label: t("catGeological") },
    { id: "Health", label: t("catHealth") },
    { id: "Logistical", label: t("catLogistical") },
  ];

  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      const matchesCategory = categoryFilter === "All" || r.category === categoryFilter;
      const matchesQuery =
        !searchQuery.trim() ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.owner.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [risks, categoryFilter, searchQuery]);

  const handleUpdateRisk = (updated: RiskItem) => {
    setRisks((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (selectedRisk?.id === updated.id) {
      setSelectedRisk(updated);
    }
  };

  const handleUpdateRiskPosition = (riskId: string, likelihood: number, impact: number) => {
    setRisks((prev) =>
      prev.map((r) => (r.id === riskId ? { ...r, likelihood, impact, lastUpdated: "Just now" } : r))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
            {t("matrixTitle")}
          </h2>
          <p className="text-[13px] text-white/40 mt-0.5">
            {t("matrixSub")}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setComparisonMode(!comparisonMode)}
            className={cx(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition",
              comparisonMode ? "bg-amber-400/15 border-amber-400/40 text-amber-200" : "border-white/10 text-white/60 hover:text-white"
            )}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Delta Traces</span>
          </button>
          <button
            type="button"
            onClick={() => setColorblindMode(!colorblindMode)}
            className={cx(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition",
              colorblindMode ? "bg-indigo-400/15 border-indigo-400/40 text-indigo-200" : "border-white/10 text-white/60 hover:text-white"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Pattern Mode</span>
          </button>
          <button
            type="button"
            onClick={() => setThresholdModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-400/30 bg-sky-400/10 text-sky-200 text-xs font-semibold hover:bg-sky-400/20 transition"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>{t("matrixThresholdsLegend")}</span>
          </button>
        </div>
      </div>

      {/* AI Spotlight Panel */}
      <EmergingRisksAiPanel risks={risks} />

      {/* Filter & Search Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={cx(
                "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition",
                categoryFilter === cat.id
                  ? "bg-sky-500/20 border border-sky-400/40 text-sky-200 font-semibold"
                  : "text-white/50 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative flex items-center min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="h-3.5 w-3.5 text-white/40 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("matrixSearchPlaceholder")}
            className="w-full bg-[#0d1420] border border-white/10 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-sky-400/50"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")} className="absolute right-2.5 text-white/40 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 5x5 Matrix Grid */}
      <RiskMatrixView
        risks={filteredRisks}
        selectedRisk={selectedRisk}
        onSelectRisk={setSelectedRisk}
        onUpdateRiskPosition={handleUpdateRiskPosition}
        thresholds={thresholds}
        comparisonMode={comparisonMode}
        colorblindMode={colorblindMode}
        lightTheme={lightTheme}
      />

      {/* Analytics Summary */}
      <ExecutiveSummaryView risks={filteredRisks} />

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedRisk && (
          <RiskDetailDrawer
            risk={selectedRisk}
            onClose={() => setSelectedRisk(null)}
            onUpdateRisk={handleUpdateRisk}
            thresholds={thresholds}
            lightTheme={lightTheme}
          />
        )}
      </AnimatePresence>

      {/* Thresholds Modal */}
      <AnimatePresence>
        {thresholdModalOpen && (
          <LegendThresholdModal
            thresholds={thresholds}
            onChange={setThresholds}
            onClose={() => setThresholdModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------------------------
   MAIN RISK MAP COMPONENT
--------------------------------------------------------------------- */
function RiskMapPage({
  zones: propZones,
  selected,
  setSelected,
  reports = FEED_ITEMS,
  onAddReport,
}: {
  zones: any[];
  selected: string;
  setSelected: (id: string) => void;
  reports?: any[];
  onAddReport?: (report: any) => void;
}) {
  const { t } = useTranslation();
  // Map engine mode: 2D Tactical Flood Simulation vs 3D Vector Terrain (MapLibre)
  const [engineMode, setEngineMode] = useState<"2d" | "3d">("2d");

  // Live mutable simulated zones
  const [liveZones, setLiveZones] = useState<ZoneModelItem[]>(() =>
    (propZones && propZones.length > 0 ? propZones : ZONES).map((z: any, idx: number) => ({
      ...z,
      elevation: z.elevation ?? (550 + ((idx * 17) % 65)),
    }))
  );

  // Synchronize when propZones changes from parent demo mode
  useEffect(() => {
    if (propZones && propZones.length > 0) {
      setLiveZones((prev) =>
        propZones.map((pz: any, idx: number) => {
          const existing = prev.find((p) => p.id === pz.id);
          return {
            ...pz,
            elevation: pz.elevation ?? existing?.elevation ?? (550 + ((idx * 17) % 65)),
          };
        })
      );
    }
  }, [propZones]);

  // Selected Zone state
  const activeZoneId = selected || (liveZones[0]?.id ?? "wakad");
  const activeZone = useMemo(
    () => liveZones.find((z) => z.id === activeZoneId) || liveZones[0],
    [liveZones, activeZoneId]
  );

  // Map layer toggles
  const [activeLayer, setActiveLayer] = useState<
    "rainfall" | "corridors" | "vulnerability" | "reports" | "heatmap"
  >("rainfall");
  const [showFacilities, setShowFacilities] = useState(true);
  const [basemapStyle, setBasemapStyle] = useState<"dark" | "satellite" | "terrain" | "light">("dark");

  // Search query for quick sector search
  const [zoneSearchQuery, setZoneSearchQuery] = useState("");

  // Forecast Horizon Slider: 0=Now, 1=+3h, 2=+6h, 4=+12h, 8=+24h
  const forecastHorizons = [
    { label: "Now", step: 0, sub: "Live" },
    { label: "+3h", step: 1, sub: "Near term" },
    { label: "+6h", step: 2, sub: "Storm peak" },
    { label: "+12h", step: 4, sub: "Runoff max" },
    { label: "+24h", step: 8, sub: "Recession" },
  ];
  const [forecastIndex, setForecastIndex] = useState(0);
  const [isPlayingForecast, setIsPlayingForecast] = useState(false);
  const currentForecastStep = forecastHorizons[forecastIndex].step;

  // Live simulation ticker
  const [countdown, setCountdown] = useState(30);
  const [lastUpdatedSec, setLastUpdatedSec] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Compare mode state
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareZoneIdA, setCompareZoneIdA] = useState<string>(activeZoneId);
  const [compareZoneIdB, setCompareZoneIdB] = useState<string>("katraj");

  // Leaflet map DOM ref & instance ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const pulseRadiusRef = useRef(0);

  // Mutate simulated live sensor feed
  const mutateSensorData = useCallback(() => {
    setIsUpdating(true);
    setLiveZones((prev) =>
      prev.map((zone) => {
        const deltaRain = (Math.random() > 0.45 ? 1 : -1) * Math.floor(Math.random() * 4);
        const deltaReports = Math.random() > 0.65 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        return {
          ...zone,
          rainfall: Math.max(10, Math.min(160, zone.rainfall + deltaRain)),
          reports: Math.max(1, Math.min(35, zone.reports + deltaReports)),
        };
      })
    );
    setLastUpdatedSec(0);
    setCountdown(30);
    setTimeout(() => setIsUpdating(false), 500);
  }, []);

  // Ticker countdown interval
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedSec((sec) => sec + 1);
      setCountdown((prev) => {
        if (prev <= 1) {
          mutateSensorData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [mutateSensorData]);

  // Automated Forecast playback animation
  useEffect(() => {
    if (!isPlayingForecast) return;
    const playInterval = setInterval(() => {
      setForecastIndex((prev) => (prev + 1) % forecastHorizons.length);
    }, 2500);
    return () => clearInterval(playInterval);
  }, [isPlayingForecast, forecastHorizons.length]);

  // Inject animated flood corridor keyframe into document head
  useEffect(() => {
    if (typeof document !== "undefined" && !document.getElementById("flood-polyline-style")) {
      const styleEl = document.createElement("style");
      styleEl.id = "flood-polyline-style";
      styleEl.innerHTML = `
        @keyframes floodDashAnim {
          to { stroke-dashoffset: -40; }
        }
        .flood-dash-path {
          stroke-dasharray: 8, 12;
          animation: floodDashAnim 2.5s linear infinite;
        }
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .custom-zone-marker-container {
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.6));
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .custom-zone-marker-container:hover {
          transform: translate(-50%, -50%) scale(1.15) !important;
          z-index: 9999 !important;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    let cancelled = false;

    if (!mapContainerRef.current) return;

    import("leaflet").then(({ default: L }) => {
      if (cancelled || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [18.545, 73.825],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      const getTileUrl = (style: string) => {
        switch (style) {
          case "satellite":
            return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
          case "terrain":
            return "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
          case "light":
            return "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
          default:
            return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
        }
      };

      const tileLayer = L.tileLayer(getTileUrl(basemapStyle), {
        maxZoom: 18,
        subdomains: "abcd",
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;

      renderLeafletLayers(L, map, layerGroup);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer on basemapStyle change
  useEffect(() => {
    if (!tileLayerRef.current) return;
    const urls: Record<string, string> = {
      dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    };
    tileLayerRef.current.setUrl(urls[basemapStyle] || urls.dark);
  }, [basemapStyle]);

  // Breathing animation loop for risk circle radius
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      pulseRadiusRef.current = (pulseRadiusRef.current + 1) % 10;
      import("leaflet").then(({ default: L }) => {
        if (mapInstanceRef.current && layerGroupRef.current) {
          renderLeafletLayers(L, mapInstanceRef.current, layerGroupRef.current);
        }
      });
    }, 2000);
    return () => clearInterval(pulseInterval);
  }, [liveZones, activeLayer, currentForecastStep, showFacilities, activeZoneId]);

  // Core Render Method for Leaflet Overlays
  const renderLeafletLayers = (L: any, map: any, group: any) => {
    if (!group) return;
    group.clearLayers();

    const pulseDelta = Math.sin(pulseRadiusRef.current) * 90;

    // 1. Draw Flood Corridors (Animated dashed polylines)
    if (activeLayer === "corridors" || activeLayer === "rainfall" || activeLayer === "heatmap") {
      PUNE_FLOOD_CORRIDORS.forEach((corridor) => {
        const polyline = L.polyline(corridor.coordinates, {
          color: corridor.color,
          weight: activeLayer === "corridors" ? 5.5 : 4,
          opacity: 0.9,
          className: "flood-dash-path",
        });

        polyline.bindTooltip(
          `<div style="font-family: Inter, sans-serif; font-size: 11px; padding: 2px;">
            <b style="color: ${corridor.color};">${corridor.name}</b><br/>
            <span style="color: #ccc;">Severity: ${corridor.severity.toUpperCase()}</span>
          </div>`,
          { direction: "top", opacity: 0.95 }
        );

        group.addLayer(polyline);
      });
    }

    // 2. Render Zone Circles & Custom HTML DivIcon Markers
    liveZones.forEach((zone, idx) => {
      const riskScore = computeRiskScore(zone, currentForecastStep, idx);
      const severity = riskFromScore(riskScore);
      const colorToken = RISK[severity];
      const isSelected = zone.id === activeZoneId;

      let baseRadius = 1200;
      if (activeLayer === "rainfall") {
        baseRadius = 600 + zone.rainfall * 18;
      } else if (activeLayer === "vulnerability") {
        baseRadius = 500 + zone.vulnerability * 22;
      } else if (activeLayer === "reports") {
        baseRadius = 600 + zone.reports * 75;
      } else if (activeLayer === "heatmap") {
        baseRadius = 700 + riskScore * 18;
      }

      if (activeLayer === "heatmap" && riskScore >= 50) {
        [2.0, 1.5, 1.0].forEach((multiplier, ringIdx) => {
          const ringCircle = L.circle([zone.lat, zone.lng], {
            radius: (baseRadius + pulseDelta) * multiplier,
            color: colorToken.color,
            fillColor: colorToken.color,
            fillOpacity: 0.05 + (2 - ringIdx) * 0.04,
            weight: 1,
            dashArray: "4, 6",
          });
          group.addLayer(ringCircle);
        });
      } else {
        const circle = L.circle([zone.lat, zone.lng], {
          radius: Math.max(500, baseRadius + pulseDelta),
          color: colorToken.color,
          fillColor: colorToken.color,
          fillOpacity: isSelected ? 0.32 : 0.16,
          weight: isSelected ? 2.5 : 1.5,
        });

        circle.on("click", () => {
          setSelected(zone.id);
          map.flyTo([zone.lat, zone.lng], 13, { duration: 1.2 });
        });

        group.addLayer(circle);
      }

      // Zone Custom Interactive Badge Marker with Ambient Glow
      const markerHtml = `
        <div class="custom-zone-marker-container relative cursor-pointer select-none" style="transform: translate(-50%, -50%);">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            isSelected
              ? "ring-4 ring-sky-400/50 scale-110 z-50"
              : "hover:ring-2 hover:ring-white/40"
          }" style="background: rgba(10, 16, 26, 0.94); border-color: ${colorToken.color}; box-shadow: 0 0 16px ${colorToken.color}45;">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background: ${colorToken.color};"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5" style="background: ${colorToken.color};"></span>
            </span>
            <span class="text-xs font-bold text-white tracking-tight whitespace-nowrap">${zone.name}</span>
            <span class="text-[11px] font-mono px-1.5 py-0.5 rounded font-bold" style="color: ${colorToken.color}; background: ${colorToken.bg};">
              ${riskScore}%
            </span>
          </div>
          ${
            isSelected
              ? `<div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4" style="border-top-color: ${colorToken.color};"></div>`
              : ""
          }
        </div>
      `;

      const divIcon = L.divIcon({
        html: markerHtml,
        className: "custom-zone-marker",
        iconSize: [130, 40],
      });

      const marker = L.marker([zone.lat, zone.lng], { icon: divIcon });
      marker.on("click", () => {
        setSelected(zone.id);
        map.flyTo([zone.lat, zone.lng], 13, { duration: 1.2 });
      });

      group.addLayer(marker);
    });

    // 3. Render Emergency Facilities (Shelters & Hospitals)
    if (showFacilities) {
      PUNE_FACILITIES.forEach((fac) => {
        const isShelter = fac.type === "Shelter";
        const facColor = isShelter ? "#3FC98A" : "#38BDF8";
        const facIcon = isShelter ? "🏠" : "🏥";

        const facHtml = `
          <div class="relative flex items-center justify-center cursor-pointer select-none group" style="transform: translate(-50%, -50%);">
            <div class="flex h-7 w-7 items-center justify-center rounded-full border text-xs shadow-xl backdrop-blur-md transition-transform group-hover:scale-120"
              style="background: rgba(8, 14, 24, 0.9); color: ${facColor}; border-color: ${facColor}; box-shadow: 0 0 10px ${facColor}40;">
              <span>${facIcon}</span>
            </div>
          </div>
        `;

        const facMarker = L.marker([fac.lat, fac.lng], {
          icon: L.divIcon({ html: facHtml, iconSize: [28, 28] }),
        });

        facMarker.bindPopup(`
          <div style="color: #fff; font-family: Inter, sans-serif; font-size: 11px; padding: 4px; min-width: 140px;">
            <b style="color: ${facColor}; font-size: 12px;">${fac.name}</b><br/>
            <div style="margin-top: 4px; color: #ccc;">
              <span>Type: <b>${fac.type}</b></span><br/>
              <span>Capacity: <b>${fac.capacity}%</b></span><br/>
              <span>Proximity: <b>${fac.distance}</b></span>
            </div>
          </div>
        `);

        group.addLayer(facMarker);
      });
    }
  };

  // Recenter map to Pune district center
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([18.545, 73.825], 11.5, { duration: 1.2 });
    }
  };

  // Flying map to active zone when selected changes
  useEffect(() => {
    if (mapInstanceRef.current && activeZone) {
      mapInstanceRef.current.flyTo([activeZone.lat, activeZone.lng], 13, { duration: 1.2 });
    }
  }, [activeZoneId]);

  // Current active zone metrics
  const activeZoneRisk = useMemo(
    () => computeRiskScore(activeZone, currentForecastStep, 0),
    [activeZone, currentForecastStep]
  );
  const activeConfidence = useMemo(() => computeConfidence(activeZone), [activeZone]);
  const activeForecastData = useMemo(() => getForecastData(activeZone, 0), [activeZone]);
  const activeSeverity = riskFromScore(activeZoneRisk);
  const activeColorToken = RISK[activeSeverity];

  // Filtered zones for quick chip switcher
  const filteredZoneChips = useMemo(() => {
    if (!zoneSearchQuery.trim()) return liveZones;
    const q = zoneSearchQuery.toLowerCase();
    return liveZones.filter(
      (z) => z.name.toLowerCase().includes(q) || z.id.toLowerCase().includes(q)
    );
  }, [liveZones, zoneSearchQuery]);

  // Aggregate statistics across Pune
  const totalRainfallPeak = useMemo(
    () => Math.max(...liveZones.map((z) => z.rainfall)),
    [liveZones]
  );
  const peakZone = useMemo(
    () => liveZones.find((z) => z.rainfall === totalRainfallPeak) || liveZones[0],
    [liveZones, totalRainfallPeak]
  );
  const averageRisk = useMemo(
    () =>
      Math.round(
        liveZones.reduce((acc, z) => acc + computeRiskScore(z, currentForecastStep, 0), 0) /
          liveZones.length
      ),
    [liveZones, currentForecastStep]
  );

  // Compare zones lookup
  const zoneA = useMemo(
    () => liveZones.find((z) => z.id === compareZoneIdA) || liveZones[0],
    [liveZones, compareZoneIdA]
  );
  const zoneB = useMemo(
    () => liveZones.find((z) => z.id === compareZoneIdB) || liveZones[1] || liveZones[0],
    [liveZones, compareZoneIdB]
  );

  const compareRiskA = computeRiskScore(zoneA, currentForecastStep, 0);
  const compareRiskB = computeRiskScore(zoneB, currentForecastStep, 1);

  const compareChartData = useMemo(() => {
    const dataA = getForecastData(zoneA, 0);
    const dataB = getForecastData(zoneB, 1);
    return dataA.map((item, idx) => ({
      t: item.t,
      [zoneA.name]: item.risk,
      [zoneB.name]: dataB[idx]?.risk ?? 0,
    }));
  }, [zoneA, zoneB]);

  // Recommended actions based on risk level
  const getActionRecommendation = (level: string) => {
    switch (level) {
      case "critical":
        return {
          title: "Critical Inundation Protocol",
          desc: "Ground floor water ingress detected. Cut power sub-stations, deploy rescue zodiacs, and evacuate to designated elevated community shelter.",
          actionBadge: "IMMEDIATE EVACUATION",
          badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
        };
      case "high":
        return {
          title: "Severe Storm Warning",
          desc: "Arterial culverts exceeding 85% capacity. Divert vehicular transit away from underpasses and stage relief resources.",
          actionBadge: "EVACUATE LOW-LYING",
          badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/40",
        };
      case "moderate":
        return {
          title: "Advisory Precaution",
          desc: "Heavy localized rain anticipated. Inspect storm drains, secure emergency kits, and monitor telemetry updates.",
          actionBadge: "STANDBY ALERT",
          badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        };
      default:
        return {
          title: "Continuous Telemetry",
          desc: "Standard monsoon runoff observed. Natural river basins discharging normally with no urban flash flooding alerts.",
          actionBadge: "ROUTINE PATROL",
          badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        };
    }
  };

  const currentAction = getActionRecommendation(activeSeverity);

  return (
    <div className="w-full space-y-6 text-slate-100">
      {/* 1. Header / Telemetry Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Brand & Context */}
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shadow-inner">
              <CloudRain className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  {t("mapTitle")}
                </h1>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  Pune Grid
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t("mapSub")}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Telemetry Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs">
                <Activity className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-slate-400">Auto-sync:</span>
                <span className="font-mono font-semibold text-sky-300 tabular-nums">{countdown}s</span>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs">
                <Droplets className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-slate-400">Max Rain:</span>
                <span className="font-mono font-semibold text-amber-300 tabular-nums">{totalRainfallPeak} mm</span>
                <span className="text-slate-500">({peakZone.name})</span>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-slate-400">Avg Risk:</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">{averageRisk}%</span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            {/* 2D vs 3D Map Engine Toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/80 p-1 shadow-sm backdrop-blur-md">
              <button
                type="button"
                onClick={() => setEngineMode("2d")}
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-[0.98]",
                  engineMode === "2d" ? "bg-sky-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
                )}
              >
                <MapIcon className="h-3.5 w-3.5" />
                <span>{t("map2dToggle")}</span>
              </button>
              <button
                type="button"
                onClick={() => setEngineMode("3d")}
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-[0.98]",
                  engineMode === "3d" ? "bg-sky-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
                )}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>{t("map3dToggle")}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => mutateSensorData()}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3.5 py-2 text-xs font-semibold text-sky-300 shadow-sm transition-all duration-200 hover:bg-sky-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                <RefreshCw className={cx("h-3.5 w-3.5", isUpdating && "animate-spin")} />
                <span>Recalibrate</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={cx(
                  "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold shadow-sm transition-all duration-200 active:scale-[0.98]",
                  isCompareMode
                    ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                    : "border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/60 hover:text-white"
                )}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Compare</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {engineMode === "3d" ? (
        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#0A0E18] p-1 shadow-2xl">
          <InteractiveMapApp />
        </div>
      ) : (
        <>
          {/* 2. Sector Quick-Selector Pill Rail */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 p-2 shadow-sm backdrop-blur-md no-scrollbar select-none">
        <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 shrink-0">
          <Navigation className="h-3.5 w-3.5 text-sky-400" />
          <span>Sectors</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {filteredZoneChips.map((z, idx) => {
            const rScore = computeRiskScore(z, currentForecastStep, idx);
            const zSev = riskFromScore(rScore);
            const zToken = RISK[zSev];
            const isCurrent = z.id === activeZoneId;

            return (
              <button
                key={z.id}
                type="button"
                onClick={() => {
                  setSelected(z.id);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([z.lat, z.lng], 13, { duration: 1.2 });
                  }
                }}
                className={cx(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-[0.98]",
                  isCurrent
                    ? "border-sky-500/40 bg-sky-500/20 text-white font-semibold ring-1 ring-sky-500/30"
                    : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: zToken.color }}
                />
                <span>{z.name}</span>
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums"
                  style={{ color: zToken.color, background: zToken.bg }}
                >
                  {rScore}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Compare Mode Overlay Panel */}
      <AnimatePresence>
        {isCompareMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-6 space-y-6 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Sliders className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Sector Risk Delta Analysis
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Side-by-side comparative hydraulic exposure metrics</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCompareMode(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sector Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                    Sector A (Primary)
                  </label>
                  <select
                    value={compareZoneIdA}
                    onChange={(e) => setCompareZoneIdA(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-medium cursor-pointer transition-colors focus:border-sky-500/50"
                  >
                    {liveZones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} (Risk: {computeRiskScore(z, currentForecastStep, 0)}% · {z.rainfall}mm)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Sector B (Comparison Target)
                  </label>
                  <select
                    value={compareZoneIdB}
                    onChange={(e) => setCompareZoneIdB(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-medium cursor-pointer transition-colors focus:border-amber-500/50"
                  >
                    {liveZones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} (Risk: {computeRiskScore(z, currentForecastStep, 1)}% · {z.rainfall}mm)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comparison Matrix Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/60">
                      <th className="py-3 px-4">Telemetry Metric</th>
                      <th className="py-3 px-4 text-sky-400 font-bold">{zoneA.name}</th>
                      <th className="py-3 px-4 text-amber-400 font-bold">{zoneB.name}</th>
                      <th className="py-3 px-4 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-3 px-4 text-slate-400 font-medium">AI Predicted Flood Risk</td>
                      <td className={cx("py-3 px-4 font-bold font-mono tabular-nums", compareRiskA > compareRiskB ? "text-rose-400" : "text-emerald-400")}>
                        {compareRiskA}% ({riskFromScore(compareRiskA)})
                      </td>
                      <td className={cx("py-3 px-4 font-bold font-mono tabular-nums", compareRiskB > compareRiskA ? "text-rose-400" : "text-emerald-400")}>
                        {compareRiskB}% ({riskFromScore(compareRiskB)})
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums">
                        {Math.abs(compareRiskA - compareRiskB)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-400">Rainfall Load</td>
                      <td className={cx("py-3 px-4 font-mono tabular-nums", zoneA.rainfall > zoneB.rainfall ? "text-rose-300" : "text-emerald-300")}>
                        {zoneA.rainfall} mm
                      </td>
                      <td className={cx("py-3 px-4 font-mono tabular-nums", zoneB.rainfall > zoneA.rainfall ? "text-rose-300" : "text-emerald-300")}>
                        {zoneB.rainfall} mm
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums">
                        {Math.abs(zoneA.rainfall - zoneB.rainfall)} mm
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-400">Vulnerability Index</td>
                      <td className={cx("py-3 px-4 font-mono tabular-nums", zoneA.vulnerability > zoneB.vulnerability ? "text-amber-300" : "text-emerald-300")}>
                        {zoneA.vulnerability} / 100
                      </td>
                      <td className={cx("py-3 px-4 font-mono tabular-nums", zoneB.vulnerability > zoneA.vulnerability ? "text-amber-300" : "text-emerald-300")}>
                        {zoneB.vulnerability} / 100
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums">
                        {Math.abs(zoneA.vulnerability - zoneB.vulnerability)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-400">Active Incident Reports</td>
                      <td className="py-3 px-4 font-mono tabular-nums">{zoneA.reports} reports</td>
                      <td className="py-3 px-4 font-mono tabular-nums">{zoneB.reports} reports</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums">
                        {Math.abs(zoneA.reports - zoneB.reports)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-400">Basin Elevation</td>
                      <td className="py-3 px-4 font-mono tabular-nums">{zoneA.elevation}m ({zoneA.elevation! < 560 ? "Deep Basin" : "High Ground"})</td>
                      <td className="py-3 px-4 font-mono tabular-nums">{zoneB.elevation}m ({zoneB.elevation! < 560 ? "Deep Basin" : "High Ground"})</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums">
                        {Math.abs((zoneA.elevation ?? 560) - (zoneB.elevation ?? 560))}m
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Dual Forecast Curves LineChart */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Dual 24-Hour AI Prediction Trajectory
                  </span>
                  <span className="text-xs text-amber-400 font-mono">Dynamic Monsoonal Model</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={compareChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="t" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip
                        contentStyle={{
                          background: "#0b1120",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: 8,
                          fontSize: 11,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, color: "#fff", paddingTop: 8 }} />
                      <Line type="monotone" dataKey={zoneA.name} stroke="#38BDF8" strokeWidth={2.5} dot={{ r: 4, fill: "#38BDF8" }} />
                      <Line type="monotone" dataKey={zoneB.name} stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: "#F59E0B" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Main Map & Zone Detail Grid (8:4 Proportions) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Map & Timeline Column (8 cols on desktop) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Leaflet Map Canvas Container with Floating HUD Controls */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-sm">
            {/* Top Floating Bar: Search & Basemap Controls */}
            <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between gap-3 pointer-events-none">
              {/* Search HUD */}
              <div className="pointer-events-auto w-56 sm:w-64">
                <div className="relative flex items-center rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-2 text-xs shadow-md backdrop-blur-md">
                  <Search className="h-4 w-4 text-sky-400 shrink-0 mr-2" />
                  <input
                    type="text"
                    value={zoneSearchQuery}
                    onChange={(e) => setZoneSearchQuery(e.target.value)}
                    placeholder={t("searchSectors")}
                    className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  {zoneSearchQuery && (
                    <button type="button" onClick={() => setZoneSearchQuery("")} className="text-slate-400 hover:text-white">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Basemap Switcher HUD */}
              <div className="pointer-events-auto">
                <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/90 p-1 shadow-md backdrop-blur-md">
                  {[
                    { id: "dark" as const, label: "Dark", icon: Moon },
                    { id: "satellite" as const, label: "Satellite", icon: Satellite },
                    { id: "terrain" as const, label: "Terrain", icon: Mountain },
                    { id: "light" as const, label: "Light", icon: Sun },
                  ].map((b) => {
                    const Icon = b.icon;
                    const isActive = basemapStyle === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBasemapStyle(b.id)}
                        className={cx(
                          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200 active:scale-[0.98]",
                          isActive
                            ? "bg-sky-500 text-white font-semibold shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{b.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Floating Bar: Layers & Map Actions */}
            <div className="absolute bottom-4 inset-x-4 z-20 flex flex-wrap items-end justify-between gap-3 pointer-events-none">
              {/* Visual Layer Switcher HUD */}
              <div className="pointer-events-auto max-w-[calc(100%-80px)] sm:max-w-none overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/90 p-1 shadow-md backdrop-blur-md">
                  {[
                    { id: "rainfall" as const, label: t("layerRainfall"), icon: Droplets },
                    { id: "corridors" as const, label: t("layerCorridors"), icon: Activity },
                    { id: "vulnerability" as const, label: t("layerVulnerability"), icon: Shield },
                    { id: "reports" as const, label: t("layerReports"), icon: MessageSquare },
                    { id: "heatmap" as const, label: t("layerHeatmap"), icon: Sparkles },
                  ].map((l) => {
                    const Icon = l.icon;
                    const isActive = activeLayer === l.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setActiveLayer(l.id)}
                        className={cx(
                          "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs transition-all duration-200 active:scale-[0.98]",
                          isActive
                            ? "bg-sky-500 text-white font-semibold shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{l.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Map Actions & Severity Legend HUD */}
              <div className="pointer-events-auto flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/90 p-1 shadow-md backdrop-blur-md">
                  <button
                    type="button"
                    onClick={handleRecenter}
                    title="Recenter Pune District"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800/60 hover:text-white transition-colors active:scale-95"
                  >
                    <LocateFixed className="h-3.5 w-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-800" />

                  <button
                    type="button"
                    onClick={() => setShowFacilities(!showFacilities)}
                    title="Toggle Shelters & Hospitals"
                    className={cx(
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors active:scale-95",
                      showFacilities
                        ? "bg-emerald-500/15 text-emerald-300 font-semibold"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Hospital className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t("facilitiesLabel")}</span>
                  </button>
                </div>

                {/* Severity Legend Pill */}
                <div className="hidden lg:flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-1.5 text-xs text-slate-400 shadow-md backdrop-blur-md">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#3FC98A]" />Low</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#E7B94C]" />Mod</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#E38A46]" />High</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#E4574F]" />Crit</span>
                </div>
              </div>
            </div>

            {/* Leaflet Map Canvas */}
            <div
              ref={mapContainerRef}
              className="h-[520px] sm:h-[560px] w-full z-10"
              style={{ background: "#060c14" }}
            />
          </div>

          {/* 5. Forecast Horizon Timeline Controller */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlayingForecast(!isPlayingForecast)}
                  title={isPlayingForecast ? "Pause playback" : "Play forecast simulation"}
                  className={cx(
                    "flex h-8 w-8 items-center justify-center rounded-lg shadow-sm transition-all duration-200 active:scale-95",
                    isPlayingForecast
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "bg-sky-500 text-white hover:bg-sky-400"
                  )}
                >
                  {isPlayingForecast ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-xs uppercase tracking-wider">
                    Forecast Timeline:
                  </span>
                  <span className="rounded-lg bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 text-xs font-semibold text-sky-400 font-mono">
                    {forecastHorizons[forecastIndex].label} · {forecastHorizons[forecastIndex].sub}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Simulating drainage dynamics & catchment runoff</span>
              </div>
            </div>

            {/* Step Timeline Grid with Connected Visual Rail */}
            <div className="relative pt-1">
              <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-slate-800 pointer-events-none hidden sm:block" />

              <div className="grid grid-cols-5 gap-2 relative z-10">
                {forecastHorizons.map((f, i) => {
                  const isActive = forecastIndex === i;
                  return (
                    <button
                      key={f.label}
                      type="button"
                      onClick={() => {
                        setForecastIndex(i);
                        setIsPlayingForecast(false);
                      }}
                      className={cx(
                        "flex flex-col items-center justify-center rounded-xl p-3 border transition-all duration-200 active:scale-[0.98] text-center",
                        isActive
                          ? "border-sky-500/40 bg-sky-500/20 text-white font-bold ring-1 ring-sky-500/30"
                          : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:bg-slate-800/40 hover:text-slate-200"
                      )}
                    >
                      <span className={cx("text-xs font-mono font-bold tabular-nums", isActive ? "text-sky-300" : "")}>
                        {f.label}
                      </span>
                      <span className="text-[11px] opacity-70 truncate mt-1">{f.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Zone Detail Column (4 cols on desktop, sticky) */}
        <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5 shadow-sm backdrop-blur-md">
            {/* Zone Header Info */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {activeZone.name}
                  </h2>
                  <RiskBadge level={activeSeverity} size="sm" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-sky-400" />
                    Pune District
                  </span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">Elev: {activeZone.elevation}m</span>
                </div>
              </div>

              {/* Confidence Meter Chip */}
              <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-300 shrink-0">
                {activeConfidence}% Confidence
              </div>
            </div>

            {/* AI Risk Score Hero Gauge Banner */}
            <div
              className="p-5 rounded-xl border shadow-sm relative overflow-hidden flex items-center justify-between"
              style={{
                borderColor: activeColorToken.ring,
                background: `linear-gradient(135deg, ${activeColorToken.bg}, rgba(15, 23, 42, 0.95))`,
              }}
            >
              <div className="relative z-10 space-y-1">
                <span className="text-xs uppercase tracking-wider text-slate-300 font-bold block">
                  AI Flood Risk Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-mono tracking-tight tabular-nums" style={{ color: activeColorToken.color }}>
                    {activeZoneRisk}%
                  </span>
                  <span className="text-xs uppercase font-bold tracking-wider opacity-90" style={{ color: activeColorToken.color }}>
                    {activeSeverity}
                  </span>
                </div>
              </div>

              {/* Trend Rate Badge */}
              <div className="relative z-10 text-right space-y-1.5">
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-mono tabular-nums">+{(activeZoneRisk * 0.08).toFixed(1)}%/hr</span>
                </div>
                <span className="text-xs text-slate-400 block">Peak front at +12h</span>
              </div>
            </div>

            {/* Symmetric Multi-Factor Model Input Bars */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Multi-Factor Model Inputs</span>
                <span className="text-sky-400 font-mono">Weighted Algorithm</span>
              </div>

              {/* Rainfall */}
              <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-2 font-medium">
                    <Droplets className="h-3.5 w-3.5 text-sky-400" />
                    <span>Rainfall Intensity</span>
                  </span>
                  <span className="font-mono text-white font-bold tabular-nums">{activeZone.rainfall} mm</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (activeZone.rainfall / 120) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Vulnerability */}
              <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-2 font-medium">
                    <Shield className="h-3.5 w-3.5 text-amber-400" />
                    <span>Vulnerability Index</span>
                  </span>
                  <span className="font-mono text-white font-bold tabular-nums">{activeZone.vulnerability} / 100</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${activeZone.vulnerability}%` }}
                  />
                </div>
              </div>

              {/* Crowd Incidents */}
              <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-2 font-medium">
                    <MessageSquare className="h-3.5 w-3.5 text-rose-400" />
                    <span>Crowd Reports</span>
                  </span>
                  <span className="font-mono text-white font-bold tabular-nums">{activeZone.reports} active</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (activeZone.reports / 30) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Basin Topography Elevation */}
              <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-2 font-medium">
                    <Mountain className="h-3.5 w-3.5 text-teal-400" />
                    <span>Basin Inundation Risk</span>
                  </span>
                  <span className="font-mono text-white font-bold tabular-nums">
                    {activeZone.elevation}m ({activeZone.elevation! < 560 ? "Deep Basin" : "High Ground"})
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(15, Math.min(100, Math.round(((620 - (activeZone.elevation ?? 560)) / 70) * 100)))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 24-Hour Forecast Sparkline Chart */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 font-semibold">
                <span>24-Hour Predictive Trajectory</span>
                <span className="text-sky-400 font-mono text-[11px]">70% Threshold Alert</span>
              </div>

              <div className="h-28 w-full rounded-xl border border-slate-800 bg-slate-950/60 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeForecastData} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="zoneSparklineFillEnhanced" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={activeColorToken.color} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={activeColorToken.color} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="t" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} hide />
                    <ReferenceLine y={70} stroke="#E4574F" strokeDasharray="3 3" strokeOpacity={0.8} />
                    <Tooltip
                      contentStyle={{
                        background: "#0b1120",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 8,
                        fontSize: 10,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="risk"
                      stroke={activeColorToken.color}
                      strokeWidth={2}
                      fill="url(#zoneSparklineFillEnhanced)"
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Emergency Facilities Proximity Cards */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 flex flex-col justify-between h-full space-y-1.5">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">{t("nearestShelter")}</span>
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 truncate">
                  <span className="text-sm shrink-0">🏠</span>
                  <span className="truncate">{activeZone.shelter}</span>
                </div>
                <div className="text-xs text-slate-500">Capacity ~65%</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 flex flex-col justify-between h-full space-y-1.5">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">{t("nearestHospital")}</span>
                <div className="text-xs font-semibold text-sky-400 flex items-center gap-1.5 truncate">
                  <span className="text-sm shrink-0">🏥</span>
                  <span className="truncate">{activeZone.hospital}</span>
                </div>
                <div className="text-xs text-slate-500">Emergency Ready</div>
              </div>
            </div>

            {/* Mission Critical Action Directive */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-white">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="truncate">{currentAction.title}</span>
                </div>
                <span className={cx("px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0", currentAction.badgeColor)}>
                  {currentAction.actionBadge}
                </span>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed">
                {currentAction.desc}
              </p>

              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setIsCompareMode(true);
                    setCompareZoneIdA(activeZone.id);
                  }}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  Compare with another sector →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}


/* ---------------------------------------------------------------------
  ALERTS PAGE
--------------------------------------------------------------------- */
function AlertsPage({ zones, onNavigate }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("All");
  const [safetyActionZone, setSafetyActionZone] = useState<any>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSafetyActionZone(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const critical = zones.filter((z) => {
    const lvl = riskFromScore(z.baseRisk);
    if (filter === "All") return lvl === "critical" || lvl === "high";
    if (filter === "Critical") return lvl === "critical";
    if (filter === "High") return lvl === "high";
    if (filter === "Moderate") return lvl === "moderate";
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>{t("liveAlerts")}</h2>
        <div className="flex gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {[
            { id: "All", label: t("filterAll") },
            { id: "Critical", label: t("filterCritical") },
            { id: "High", label: t("filterHigh") },
            { id: "Moderate", label: t("filterModerate") },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cx(
                "px-3 py-1 text-xs rounded-lg font-medium transition",
                filter === f.id ? "bg-sky-500/20 text-sky-200 border border-sky-400/30" : "text-white/50 hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {critical.length === 0 ? (
        <GlassPanel className="p-10 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-300/70 mx-auto mb-3" />
          <p className="text-white/80 font-medium">{t("allClearTitle")}</p>
          <p className="text-white/40 text-sm mt-1">{t("allClearDesc")}</p>
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
                          {lvl} {t("floodRisk")}
                        </span>
                        <span className="text-white/40 text-[13px]">· {z.name}</span>
                      </div>
                      <p className="text-white/60 text-[13px] mt-1">
                        {t("alertDescTemplate", { risk: z.baseRisk, rainfall: z.rainfall })}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button type="button" onClick={() => onNavigate("map")} className="text-[12px] px-3 py-1.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 transition">{t("viewArea")}</button>
                        <button type="button" onClick={() => setSafetyActionZone(z)} className="text-[12px] px-3 py-1.5 rounded-lg text-white/90 hover:brightness-125 transition" style={{ background: RISK[lvl].bg, border: `1px solid ${RISK[lvl].ring}` }}>{t("safetyActions")}</button>
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Safety Actions Modal */}
      <AnimatePresence>
        {safetyActionZone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setSafetyActionZone(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-2xl border border-sky-400/30 bg-[#0d1420] p-6 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-sky-400" />
                  <h3 className="text-base font-semibold">{t("safetyProtocolTitle")} · {safetyActionZone.name}</h3>
                </div>
                <button type="button" onClick={() => setSafetyActionZone(null)} className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
              </div>

              <div className="mt-4 space-y-4 text-xs text-white/80">
                <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3.5">
                  <div className="flex items-center gap-2 font-semibold text-amber-200">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {t("highHazardWarning")} ({safetyActionZone.baseRisk}% Risk Score)
                  </div>
                  <p className="mt-1 text-white/70">{t("flashPoolingWarning")}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <span className="text-[10px] text-white/40 uppercase">{t("nearestSafeCamp")}</span>
                    <p className="text-sm font-semibold text-white mt-0.5">{safetyActionZone.shelter} away</p>
                    <p className="text-[11px] text-white/50">Municipal Relief Camp #4</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <span className="text-[10px] text-white/40 uppercase">{t("designatedTraumaCenter")}</span>
                    <p className="text-sm font-semibold text-white mt-0.5">{safetyActionZone.hospital} away</p>
                    <p className="text-[11px] text-white/50">Emergency Ward Ready</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase text-white/50">Responder Checklist</span>
                  <div className="space-y-1.5">
                    {[
                      "Switch off main domestic circuit breakers to prevent electrocution.",
                      "Move documents, essential medicines, and water to upper floors.",
                      "Avoid wading through flowing waters above ankle depth.",
                      "Tune into civil defense broadcast or keep ResiliAI offline telemetry active."
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-white/70">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between gap-3">
                <a href="tel:112" className="flex items-center gap-1.5 rounded-lg bg-red-500/20 border border-red-500/40 px-3.5 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/30 transition">
                  <Phone className="h-3.5 w-3.5" /> Call 112 (Disaster Ops)
                </a>
                <button type="button" onClick={() => setSafetyActionZone(null)} className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition">
                  Acknowledged
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <GlassPanel className="p-5">
        <h3 className="text-[13px] font-medium text-white/70 mb-4">{t("whatShouldYouDo")}</h3>
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
function ReportModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (report: any) => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState("form");
  const [type, setType] = useState("Flood");
  const [area, setArea] = useState("Pune City");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Moderate");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setStep("form");
      setFormError("");
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const types = ["Flood", "Waterlogging", "Road block", "Fallen tree", "Landslide", "Fire", "Medical emergency", "Other"];
  const typeIcons: Record<string, string> = {
    Flood: "🌊",
    Waterlogging: "💧",
    "Road block": "🚧",
    "Fallen tree": "🌳",
    Landslide: "🏚️",
    Fire: "🔥",
    "Medical emergency": "🚑",
    Other: "⚠️",
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Photo exceeds maximum 5MB size limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPhotoPreview(uploadEvent.target?.result as string);
      setFormError("");
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async () => {
    // If both area and description are completely empty, set friendly validation error
    if (!area.trim() && !description.trim()) {
      setFormError("Please provide an area or a short description of the incident.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const payload = {
        id: Date.now(),
        icon: typeIcons[type] || "⚠️",
        type,
        area: area.trim() || "Pune Local",
        time: "Just now",
        status: "Reported" as const,
        lat: 18.5204 + (Math.random() - 0.5) * 0.08,
        lng: 73.8567 + (Math.random() - 0.5) * 0.08,
        severity,
        description,
        photoUrl: photoPreview || undefined,
      };

      // Persist through resilient API service
      await api.submitReport(payload);

      if (onSubmit) {
        onSubmit(payload);
      }

      setStep("done");
    } catch {
      setFormError("Failed to transmit incident report. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <GlassPanel className="p-6 bg-[#0C0F18]/95 max-h-[90vh] overflow-y-auto">
              {step === "form" ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{t("reportModalTitle")}</h3>
                    <button type="button" onClick={onClose} className="p-1 rounded-lg text-white/50 hover:bg-white/10 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {formError && (
                    <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-200">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="text-[12px] text-white/45 mb-1.5 block">{t("incidentType")}</label>
                      <div className="flex flex-wrap gap-1.5">
                        {types.map((tItem) => (
                          <button
                            key={tItem}
                            type="button"
                            onClick={() => setType(tItem)}
                            className={cx(
                              "px-2.5 py-1 rounded-lg text-[12px] border transition",
                              type === tItem
                                ? "bg-sky-400/15 border-sky-400/40 text-sky-200 font-semibold"
                                : "border-white/10 text-white/50 hover:border-white/20"
                            )}
                          >
                            {tItem}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] text-white/45 mb-1.5 block">{t("areaLocality")}</label>
                      <input
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. Wakad Chowk or Baner Road"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-[13px] text-white/80 placeholder-white/25 focus:outline-none focus:border-sky-400/40"
                      />
                    </div>

                    <div>
                      <label className="text-[12px] text-white/45 mb-1.5 block">{t("severityLevel")}</label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0d1420] border border-white/10 text-[13px] text-white/80 focus:outline-none focus:border-sky-400/40"
                      >
                        <option value="Low">Low - Minor nuisance, passable</option>
                        <option value="Moderate">Moderate - Partially blocked or rising</option>
                        <option value="High">High - Impassable, hazard to vehicles</option>
                        <option value="Critical">Critical - Life threat / immediate evacuation</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[12px] text-white/45 mb-1.5 block">{t("description")}</label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what you're seeing…"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-[13px] text-white/80 placeholder-white/25 focus:outline-none focus:border-sky-400/40"
                      />
                    </div>

                    {/* Photo / Media Attachment */}
                    <div>
                      <label className="text-[12px] text-white/45 mb-1.5 block">{t("uploadPhoto")}</label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                      {photoPreview ? (
                        <div className="relative mt-1 h-28 w-full overflow-hidden rounded-xl border border-white/10">
                          <img src={photoPreview} alt="Evidence preview" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => { setPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                            className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-3 text-xs text-white/60 hover:border-white/30 hover:bg-white/[0.04] transition"
                        >
                          <Upload className="h-4 w-4 text-sky-400" />
                          <span>{t("uploadPhoto")}</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleFormSubmit}
                      className="w-full py-2.5 rounded-lg bg-sky-400/90 hover:bg-sky-400 text-[#04101a] font-semibold text-[13px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                      {isSubmitting ? "Submitting to network..." : t("submitReport")}
                    </button>
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-14 h-14 rounded-full bg-emerald-400/15 flex items-center justify-center mb-4"
                  >
                    <CheckCircle2 className="w-7 h-7 text-emerald-300" />
                  </motion.div>
                  <p className="text-white font-semibold">{t("reportReceived")}</p>
                  <p className="text-white/45 text-[13px] mt-1">{t("thankYouMessage")}</p>
                  <button type="button" onClick={onClose} className="mt-5 text-[13px] text-sky-300 hover:text-sky-200">
                    {t("closeBtn")}
                  </button>
                </motion.div>
              )}
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CommunityPage({
  reports = FEED_ITEMS,
  onAddReport,
}: {
  reports?: any[];
  onAddReport?: (report: any) => void;
}) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
            {t("communityIntel")}
          </h2>
          <p className="text-[13px] text-white/40 mt-0.5">{t("communitySubtitle")}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-400/90 hover:bg-red-400 text-[#1a0404] text-[13px] font-semibold transition-colors"
        >
          <Siren className="w-4 h-4" /> {t("reportIncident")}
        </button>
      </div>
      <div className="grid gap-3">
        {reports.map((f, i) => (
          <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassPanel className="p-4 flex items-center gap-4">
              <span className="text-xl">{f.icon}</span>
              <div className="flex-1">
                <p className="text-[13px] text-white/85 font-medium">{f.type}</p>
                <p className="text-[12px] text-white/40 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {f.area} · {f.time}
                </p>
              </div>
              <span
                className={cx(
                  "text-[11px] px-2 py-1 rounded-full border",
                  f.status === "Resolved"
                    ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10"
                    : f.status === "Verified"
                    ? "text-sky-300 border-sky-400/30 bg-sky-400/10"
                    : "text-amber-300 border-amber-400/30 bg-amber-400/10"
                )}
              >
                {f.status}
              </span>
            </GlassPanel>
          </motion.div>
        ))}
      </div>
      <ReportModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={onAddReport} />
    </div>
  );
}


/* ---------------------------------------------------------------------
   COMMAND CENTER PAGE
--------------------------------------------------------------------- */
function CommandCenterPage({ zones }: { zones: any[] }) {
  const { t } = useTranslation();
  const ranked = [...zones].sort((a, b) => b.baseRisk - a.baseRisk);
  const [dispatchStatus, setDispatchStatus] = useState<Record<number, "Standby" | "Mobilizing" | "Dispatched">>({
    0: "Standby",
    1: "Standby",
    2: "Standby",
    3: "Standby",
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedPriorityZone, setSelectedPriorityZone] = useState<any | null>(null);

  const allocations = [
    { icon: Stethoscope, action: t("teamMedical"), target: ranked[0]?.name, code: "MED-01" },
    { icon: Truck, action: t("teamRescue"), target: ranked[1]?.name, code: "RSC-04" },
    { icon: Building2, action: t("teamShelter"), target: ranked[2]?.name, code: "SHL-02" },
    { icon: TrafficCone, action: t("teamTraffic"), target: ranked[3]?.name, code: "TRF-08" },
  ];

  const handleDispatch = (idx: number, action: string, target: string) => {
    setDispatchStatus((prev) => ({
      ...prev,
      [idx]: prev[idx] === "Standby" ? "Mobilizing" : prev[idx] === "Mobilizing" ? "Dispatched" : "Standby",
    }));

    const nextState = dispatchStatus[idx] === "Standby" ? "Mobilizing" : dispatchStatus[idx] === "Mobilizing" ? "On Scene" : "Returned to Standby";
    setToastMessage(`${action} [${allocations[idx].code}] status updated: ${nextState} for ${target}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeDispatchedCount = Object.values(dispatchStatus).filter((s) => s !== "Standby").length;

  const stats = [
    { label: t("criticalAreas"), value: zones.filter((z) => riskFromScore(z.baseRisk) === "critical").length },
    { label: t("activeReports"), value: zones.reduce((s, z) => s + z.reports, 0) },
    { label: t("responseTeams"), value: 9 + activeDispatchedCount },
    { label: t("shelters"), value: 12 },
    { label: t("hospitals"), value: 6 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>{t("commandCenterTitle")}</h2>
          <p className="text-[13px] text-white/40 mt-0.5">{t("commandCenterSub")}</p>
        </div>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-sky-400/30 bg-sky-500/15 px-3 py-1.5 text-xs text-sky-200">
            {toastMessage}
          </motion.div>
        )}
      </div>

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-medium text-white/70">{t("priorityAreas")}</h3>
            <span className="text-[11px] text-white/40">Click area to inspect</span>
          </div>
          <div className="space-y-2.5">
            {ranked.map((z, i) => {
              const lvl = riskFromScore(z.baseRisk);
              return (
                <motion.button
                  key={z.id}
                  type="button"
                  onClick={() => setSelectedPriorityZone(z)}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 transition text-left"
                >
                  <span className="w-6 h-6 rounded-full bg-white/[0.06] text-white/60 text-[11px] font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="flex-1 text-[13px] text-white/85">{z.name}</span>
                  <span className="text-xs text-white/40 mr-2">{z.reports} incidents</span>
                  <span className="text-[13px] font-semibold" style={{ color: RISK[lvl].color }}>{z.baseRisk}%</span>
                </motion.button>
              );
            })}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-medium text-white/70">{t("resourceAllocation")}</h3>
            <span className="text-[11px] text-emerald-300 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live staging
            </span>
          </div>
          <div className="space-y-2.5">
            {allocations.map((a, i) => {
              const currentStatus = dispatchStatus[i];
              return (
                <motion.div key={i} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center shrink-0"><a.icon className="w-4 h-4 text-sky-300" /></div>
                    <div className="min-w-0">
                      <div className="text-[13px] text-white/85 font-medium truncate">{a.action}</div>
                      <div className="text-[11px] text-white/40 flex items-center gap-1">
                        <span>{a.code}</span> · <span>Target: {a.target}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDispatch(i, a.action, a.target)}
                    className={cx(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition shrink-0",
                      currentStatus === "Standby"
                        ? "bg-white/[0.05] border-white/10 text-white/70 hover:bg-sky-500/20 hover:text-sky-200 hover:border-sky-400/40"
                        : currentStatus === "Mobilizing"
                        ? "bg-amber-400/20 border-amber-400/40 text-amber-200"
                        : "bg-emerald-400/20 border-emerald-400/40 text-emerald-200"
                    )}
                  >
                    {currentStatus === "Standby" ? t("dispatchBtn") : currentStatus === "Mobilizing" ? t("mobilizingBtn") : t("onSceneBtn")}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </GlassPanel>
      </div>

      {/* Priority Zone Detail Modal */}
      <AnimatePresence>
        {selectedPriorityZone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setSelectedPriorityZone(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1420] p-6 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-semibold">{selectedPriorityZone.name} Sector Breakdown</h3>
                <button type="button" onClick={() => setSelectedPriorityZone(null)} className="p-1 rounded-lg text-white/50 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <span className="text-white/40 block text-[10px]">Risk Score</span>
                  <span className="text-lg font-bold text-red-400">{selectedPriorityZone.baseRisk}%</span>
                </div>
                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <span className="text-white/40 block text-[10px]">Rainfall Sensor</span>
                  <span className="text-lg font-bold text-sky-400">{selectedPriorityZone.rainfall} mm</span>
                </div>
                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <span className="text-white/40 block text-[10px]">Active Reports</span>
                  <span className="text-lg font-bold text-amber-300">{selectedPriorityZone.reports}</span>
                </div>
                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <span className="text-white/40 block text-[10px]">Elevation</span>
                  <span className="text-lg font-bold text-emerald-300">{selectedPriorityZone.elevation} m</span>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button type="button" onClick={() => setSelectedPriorityZone(null)} className="rounded-lg bg-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-200 border border-sky-400/40 hover:bg-sky-500/30">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AiAssistant() {
  const { lang, setLang, t } = useTranslation();
  const [messages, setMessages] = useState([
    { role: "ai", text: t("assistantGreeting") },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [{ role: "ai", text: t("assistantGreeting") }];
      }
      return prev;
    });
  }, [lang, t]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const respond = useCallback(async (text: string) => {
    setMessages((m) => [...m, { role: "user", text }]);
    setTyping(true);

    try {
      const response = await api.sendChatMessage(text);
      setMessages((m) => [...m, { role: "ai", text: response.text }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: "Stay alert and follow guidance from local civil defense. If this is an active emergency, dial 112 immediately.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  }, []);

  const quick = [t("quickFlood"), t("quickHeatwave"), t("quickLandslide"), t("quickFire"), t("quickMedical")];

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>{t("assistantTitle")}</h2>
        <p className="text-[13px] text-white/40 mt-1">{t("assistantSubtitle")}</p>
        <div className="flex justify-center gap-1.5 mt-3">
          {[
            { code: "EN" as const, label: "English" },
            { code: "HI" as const, label: "हिन्दी" },
            { code: "MR" as const, label: "मराठी" },
          ].map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={cx(
                "px-2.5 py-1 rounded-full text-[11px] border transition",
                lang === l.code ? "bg-sky-400/15 border-sky-400/40 text-sky-200 font-semibold" : "border-white/10 text-white/40 hover:text-white"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <GlassPanel className="p-4 h-[420px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cx("max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px]",
                m.role === "user" ? "bg-sky-400/90 text-[#04101a] rounded-br-sm font-medium" : "bg-white/[0.05] text-white/85 rounded-bl-sm border border-white/[0.06]")}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white/[0.05] border border-white/[0.06] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-sky-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3 mb-2">
          {quick.map((q) => (
            <button key={q} type="button" disabled={typing} onClick={() => respond(q)} className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-white/50 hover:text-white/85 hover:border-sky-400/30 transition disabled:opacity-40">
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            disabled={typing}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && input.trim() && !typing) { respond(input.trim()); setInput(""); } }}
            placeholder={t("askQuestionPlaceholder")}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[13px] text-white/85 placeholder-white/25 focus:outline-none focus:border-sky-400/40 disabled:opacity-50"
          />
          <button
            type="button"
            disabled={!input.trim() || typing}
            onClick={() => { if (input.trim() && !typing) { respond(input.trim()); setInput(""); } }}
            className="w-10 h-10 rounded-xl bg-sky-400/90 hover:bg-sky-400 flex items-center justify-center shrink-0 disabled:opacity-40 transition"
          >
            {typing ? <LoaderCircle className="w-4 h-4 animate-spin text-[#04101a]" /> : <Send className="w-4 h-4 text-[#04101a]" />}
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

const ROADMAP_ITEMS = [
  {
    phase: "Phase 1",
    title: "Real-time Multi-sensor Hydrological Telemetry",
    status: "Active & Deployed",
    statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    description: "Integration of 10 automated river level gauge stations across Pune and Pimpri-Chinchwad municipal bounds with 60-second polling cadence and anomaly filtering."
  },
  {
    phase: "Phase 2",
    title: "High-Resolution 3D Topographic Simulation Engine",
    status: "Live in Production",
    statusColor: "text-sky-400 bg-sky-500/10 border-sky-500/30",
    description: "MapLibre-powered WebGL terrain rendering featuring dynamic contour line overlays, 3D building extrusions, vector rain simulation, and shelter routing."
  },
  {
    phase: "Phase 3",
    title: "Automated Municipal Evacuation Routing & Dispatches",
    status: "Q4 2026",
    statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    description: "Algorithmic routing avoiding waterlogged transit corridors, paired with WhatsApp & SMS early warning broadcast dispatches for vulnerable wards."
  },
  {
    phase: "Phase 4",
    title: "Satellite Synthetic Aperture Radar (SAR) InSAR Cross-validation",
    status: "2027 Roadmap",
    statusColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    description: "Sentinel-1 and NISAR radar backscatter analysis for automated flood extent boundary delineation through thick monsoon cloud cover."
  }
];

function AboutPage() {
  const { t } = useTranslation();
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);
  const [formData, setFormData] = useState({ name: "", email: "", category: "feedback", message: "" });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Full name must be at least 2 characters.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters.";
    } else if (formData.message.trim().length > 500) {
      errors.message = "Message cannot exceed 500 characters.";
    }
    return errors;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({ name: "", email: "", category: "feedback", message: "" });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-sky-300/70">
          <Info className="h-3.5 w-3.5" /> {t("aboutTitle")}
        </div>
        <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>Avengers</h2>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-white/50">
          {t("aboutSubtitle")}
        </p>
      </div>

      <GlassPanel className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
          <div>
            <h3 className="text-[15px] font-medium text-white/90">{t("teamHeader")}</h3>
            <p className="mt-1 text-[12px] text-white/40">{t("teamSubtitle")}</p>
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
              className="flex min-h-[190px] flex-col items-center justify-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-5 text-center transition hover:border-white/15 hover:bg-white/[0.04]"
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

      <GlassPanel className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
          <div>
            <h3 className="text-[15px] font-medium text-white/90">System Architecture & Roadmap</h3>
            <p className="mt-1 text-[12px] text-white/40">Interactive milestone tracking for engineering deployments.</p>
          </div>
          <Activity className="h-5 w-5 shrink-0 text-sky-300/70" />
        </div>
        <div className="space-y-3">
          {ROADMAP_ITEMS.map((item, idx) => {
            const isOpen = activeAccordion === idx;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden transition hover:border-white/15"
              >
                <button
                  type="button"
                  onClick={() => setActiveAccordion(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono tracking-wider text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded border border-sky-400/20">
                      {item.phase}
                    </span>
                    <span className="text-[14px] font-medium text-white/90">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                      {item.status}
                    </span>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="h-4 w-4 text-white/50" />
                    </motion.div>
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-4 pb-4 pt-1 text-[13px] leading-relaxed text-white/60 border-t border-white/[0.04]">
                        {item.description}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
          <div>
            <h3 className="text-[15px] font-medium text-white/90">{t("contactHeader")}</h3>
            <p className="mt-1 text-[12px] text-white/40">{t("contactSubtitle")}</p>
          </div>
          <Send className="h-5 w-5 shrink-0 text-sky-300/70" />
        </div>

        {submitSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col items-center text-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-[16px] font-semibold text-emerald-300">{t("formSuccessTitle")}</h4>
            <p className="text-[13px] text-white/70 max-w-md">
              {t("formSuccessDesc")}
            </p>
            <button
              type="button"
              onClick={() => setSubmitSuccess(false)}
              className="mt-2 px-4 py-2 text-[12px] font-medium rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
            >
              {t("formSendAnother")}
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[12px] font-medium text-white/70 mb-1.5">
                  {t("formName")} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                  }}
                  placeholder="e.g. Vishnu Kumar"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-[13px] bg-white/[0.04] text-white placeholder-white/25 focus:outline-none transition ${
                    formErrors.name ? "border-red-400/60 focus:border-red-400" : "border-white/10 focus:border-sky-400/60"
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-medium text-white/70 mb-1.5">
                  {t("formEmail")} <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                  }}
                  placeholder="name@organization.gov.in"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-[13px] bg-white/[0.04] text-white placeholder-white/25 focus:outline-none transition ${
                    formErrors.email ? "border-red-400/60 focus:border-red-400" : "border-white/10 focus:border-sky-400/60"
                  }`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {formErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-white/70 mb-1.5">
                {t("formTopic")}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#0d1420] px-3.5 py-2.5 text-[13px] text-white focus:border-sky-400/60 focus:outline-none transition"
              >
                <option value="feedback">General Platform Feedback</option>
                <option value="telemetry">Sensor & Telemetry Ingestion</option>
                <option value="municipal">Municipal Emergency Partnership</option>
                <option value="bug">Vulnerability / Bug Report</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-medium text-white/70">
                  {t("formMessage")} <span className="text-red-400">*</span>
                </label>
                <span className={`text-[11px] ${formData.message.length > 500 ? "text-red-400" : "text-white/35"}`}>
                  {formData.message.length}/500
                </span>
              </div>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value });
                  if (formErrors.message) setFormErrors({ ...formErrors, message: "" });
                }}
                placeholder="Describe your inquiry, telemetry observation, or municipal operational request..."
                className={`w-full rounded-xl border px-3.5 py-2.5 text-[13px] bg-white/[0.04] text-white placeholder-white/25 focus:outline-none transition resize-none ${
                  formErrors.message ? "border-red-400/60 focus:border-red-400" : "border-white/10 focus:border-sky-400/60"
                }`}
              />
              {formErrors.message && (
                <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {formErrors.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-400 text-[#04101a] text-[13px] font-semibold hover:bg-sky-300 disabled:opacity-50 transition shadow-lg shadow-sky-500/20 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    {t("formTransmitting")}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {t("formSubmit")}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </GlassPanel>
    </div>
  );
}

/* ---------------------------------------------------------------------
   ROOT APP
--------------------------------------------------------------------- */
function DashboardApp({ user }: { user?: FirebaseUser | null }) {
  const [booted, setBooted] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("resiliai-booted") === "true";
    }
    return false;
  });

  const handleDoneBoot = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("resiliai-booted", "true");
    }
    setBooted(true);
  }, []);

  const [active, setActive] = useState("overview");
  const [selectedZone, setSelectedZone] = useState("wakad");
  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoRunning, setDemoRunning] = useState(false);

  const [zones, setZones] = useState(ZONES);
  const [reports, setReports] = useState(FEED_ITEMS);
  const [weather, setWeather] = useState({ rainfall: 72, humidity: 84, incidents: 17 });

  const handleAddReport = (newReport: any) => {
    setReports((prev) => [newReport, ...prev]);
  };

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

      <AnimatePresence>{!booted && <Intro onDone={handleDoneBoot} />}</AnimatePresence>

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
                {active === "map" && <RiskMapPage zones={zones} selected={selectedZone} setSelected={setSelectedZone} reports={reports} onAddReport={handleAddReport} />}
                {active === "alerts" && <AlertsPage zones={zones} onNavigate={setActive} />}
                {active === "community" && <CommunityPage reports={reports} onAddReport={handleAddReport} />}

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
  return (
    <LanguageProvider>
      <AuthGate>
        <DashboardApp />
      </AuthGate>
    </LanguageProvider>
  );
}
