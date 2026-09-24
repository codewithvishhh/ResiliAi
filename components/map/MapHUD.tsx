'use client';

import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Compass,
  Navigation,
  Box,
  Maximize2,
  Minimize2,
  Ruler,
  Layers,
  Moon,
  Sun,
  Globe2,
  Building2,
  Check,
} from 'lucide-react';
import { MapStyleId } from './types';

interface MapHUDProps {
  currentStyle: MapStyleId;
  onSelectStyle: (style: MapStyleId) => void;
  pitch: number;
  bearing: number;
  is3D: boolean;
  onToggle3D: () => void;
  onResetNorth: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocateMe: () => void;
  isLocating: boolean;
  isMeasuring: boolean;
  onToggleMeasure: () => void;
  isLayerPanelOpen: boolean;
  onToggleLayerPanel: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const MapHUD: React.FC<MapHUDProps> = ({
  currentStyle,
  onSelectStyle,
  bearing,
  is3D,
  onToggle3D,
  onResetNorth,
  onZoomIn,
  onZoomOut,
  onLocateMe,
  isLocating,
  isMeasuring,
  onToggleMeasure,
  isLayerPanelOpen,
  onToggleLayerPanel,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const styleOptions: { id: MapStyleId; label: string; desc: string; icon: any }[] = [
    {
      id: 'midnight',
      label: 'Midnight Vector',
      desc: 'Dark slate with glowing neon accents',
      icon: Moon,
    },
    {
      id: 'light',
      label: 'Clean Light',
      desc: 'Minimal high-contrast topography',
      icon: Sun,
    },
    {
      id: 'satellite',
      label: 'High-Res Satellite',
      desc: 'Photorealistic imagery with road labels',
      icon: Globe2,
    },
    {
      id: 'isometric3d',
      label: '3D Isometric',
      desc: '3D building extrusions & dynamic pitch',
      icon: Building2,
    },
  ];

  return (
    <aside aria-label="Map Navigation and Controls" className="absolute right-4 bottom-8 z-30 flex flex-col items-end gap-3 pointer-events-none select-none">
      {/* Map Style Selector Popover */}
      {isStyleMenuOpen && (
        <div
          role="dialog"
          aria-label="Map Style Selector"
          className="pointer-events-auto mb-1 w-64 rounded-2xl border border-white/15 bg-slate-900/80 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 transition-all animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Map Style
          </div>
          <div className="space-y-1">
            {styleOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = currentStyle === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSelectStyle(opt.id);
                    setIsStyleMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-medium'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 truncate">
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{opt.desc}</div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Actions Pill: Layers & Map Style Switcher */}
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-white/15 bg-slate-900/80 p-1.5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <button
          onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
          title="Change Map Style"
          className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
            isStyleMenuOpen
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-200 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Box className="h-4 w-4 text-blue-400 group-hover:rotate-12 transition-transform" />
          <span className="capitalize">{currentStyle}</span>
        </button>

        <div className="h-4 w-px bg-white/15" />

        <button
          onClick={onToggleLayerPanel}
          title="Toggle Layers (Traffic, Weather, AQI, Transit)"
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
            isLayerPanelOpen
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-200 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4 text-cyan-400" />
          <span className="hidden sm:inline">Layers</span>
        </button>

        <div className="h-4 w-px bg-white/15" />

        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="rounded-xl p-2 text-slate-200 hover:bg-white/10 hover:text-white transition-all"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
        </button>
      </div>

      {/* Floating Vertical HUD Stack */}
      <div className="pointer-events-auto flex flex-col items-center rounded-2xl border border-white/15 bg-slate-900/80 p-1.5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        {/* Zoom In */}
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="rounded-xl p-2.5 text-slate-200 hover:bg-white/10 hover:text-white transition-all active:scale-90"
        >
          <Plus className="h-4 w-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="rounded-xl p-2.5 text-slate-200 hover:bg-white/10 hover:text-white transition-all active:scale-90"
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="my-1 h-px w-6 bg-white/15" />

        {/* 3D Tilt Toggle */}
        <button
          onClick={onToggle3D}
          title={is3D ? 'Flatten to 2D' : 'Pitch to 3D Isometric View'}
          className={`rounded-xl p-2.5 transition-all active:scale-90 ${
            is3D
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40'
              : 'text-slate-200 hover:bg-white/10 hover:text-white'
          }`}
        >
          <span className="text-[11px] font-bold tracking-tighter">3D</span>
        </button>

        {/* Compass Reset */}
        <button
          onClick={onResetNorth}
          title="Reset to True North"
          className="rounded-xl p-2.5 text-slate-200 hover:bg-white/10 hover:text-white transition-all active:scale-90"
        >
          <Compass
            className="h-4 w-4 transition-transform duration-300"
            style={{ transform: `rotate(${-bearing}deg)` }}
          />
        </button>

        <div className="my-1 h-px w-6 bg-white/15" />

        {/* Locate Me (with pulsing animation) */}
        <button
          onClick={onLocateMe}
          title="Locate My Position"
          className={`relative rounded-xl p-2.5 transition-all active:scale-90 ${
            isLocating
              ? 'bg-blue-500/20 text-blue-400'
              : 'text-slate-200 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Navigation className={`h-4 w-4 ${isLocating ? 'animate-pulse text-blue-400' : ''}`} />
          {isLocating && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          )}
        </button>

        {/* Ruler Measurement Tool */}
        <button
          onClick={onToggleMeasure}
          title={isMeasuring ? 'Close Measurement Tool' : 'Distance & Area Measurement Tool'}
          className={`rounded-xl p-2.5 transition-all active:scale-90 ${
            isMeasuring
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
              : 'text-slate-200 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Ruler className="h-4 w-4" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="rounded-xl p-2.5 text-slate-200 hover:bg-white/10 hover:text-white transition-all active:scale-90"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};
