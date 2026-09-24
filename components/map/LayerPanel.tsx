'use client';

import React from 'react';
import { Layers, Activity, CloudRain, Wind, Train, X } from 'lucide-react';
import { LayerToggles } from './types';

interface LayerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  layers: LayerToggles;
  onToggleLayer: (layer: keyof LayerToggles) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  isOpen,
  onClose,
  layers,
  onToggleLayer,
}) => {
  if (!isOpen) return null;

  const layerItems = [
    {
      key: 'traffic' as const,
      name: 'Live Traffic Flow',
      desc: 'Real-time congestion speeds & incident alerts',
      icon: Activity,
      color: 'text-amber-400',
      activeColor: 'bg-amber-500',
      legend: [
        { label: 'Fast', color: 'bg-emerald-500' },
        { label: 'Moderate', color: 'bg-amber-500' },
        { label: 'Heavy', color: 'bg-rose-500' },
      ],
    },
    {
      key: 'weather' as const,
      name: 'Weather Radar',
      desc: 'Live precipitation Doppler radar & storm cells',
      icon: CloudRain,
      color: 'text-sky-400',
      activeColor: 'bg-sky-500',
      legend: [
        { label: 'Light', color: 'bg-sky-400' },
        { label: 'Moderate', color: 'bg-blue-600' },
        { label: 'Heavy', color: 'bg-purple-600' },
      ],
    },
    {
      key: 'aqi' as const,
      name: 'Air Quality Index (AQI)',
      desc: 'EPA real-time PM2.5 & ozone ground stations',
      icon: Wind,
      color: 'text-emerald-400',
      activeColor: 'bg-emerald-500',
      legend: [
        { label: 'Good (0-50)', color: 'bg-emerald-400' },
        { label: 'Moderate (51-100)', color: 'bg-amber-400' },
        { label: 'Unhealthy (101+)', color: 'bg-rose-400' },
      ],
    },
    {
      key: 'transit' as const,
      name: 'Public Transit Lines',
      desc: 'Subway, light rail, and rapid bus transit corridors',
      icon: Train,
      color: 'text-indigo-400',
      activeColor: 'bg-indigo-500',
      legend: [
        { label: 'BART Subterranean', color: 'bg-cyan-400' },
        { label: 'Muni Metro Streetcar', color: 'bg-rose-500' },
      ],
    },
  ];

  return (
    <div className="absolute right-4 top-20 z-40 w-80 rounded-2xl border border-white/15 bg-slate-900/85 p-4 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/90 transition-all animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Map Overlays</h3>
            <p className="text-[10px] text-slate-400">Toggle live geospatial data layers</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Layer Toggles */}
      <div className="mt-3 space-y-3">
        {layerItems.map((item) => {
          const Icon = item.icon;
          const isActive = layers[item.key];
          return (
            <div
              key={item.key}
              className={`rounded-xl border p-2.5 transition-all ${
                isActive
                  ? 'border-white/20 bg-white/10 shadow-sm'
                  : 'border-white/5 bg-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg bg-white/10 ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{item.name}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{item.desc}</div>
                  </div>
                </div>

                {/* Switch Toggle */}
                <button
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => onToggleLayer(item.key)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isActive ? item.activeColor : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Legend preview if active */}
              {isActive && item.legend && (
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 text-[10px] text-slate-300">
                  <span className="text-slate-400 font-medium">Legend:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.legend.map((leg, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className={`h-2 w-2 rounded-full ${leg.color}`} />
                        <span>{leg.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
