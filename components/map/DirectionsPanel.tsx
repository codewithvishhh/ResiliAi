'use client';

import React, { useState } from 'react';
import {
  Car,
  Train,
  Bike,
  Footprints,
  ArrowUpDown,
  Plus,
  Trash2,
  X,
  Navigation,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  Clock,
  ArrowRight,
  CornerDownRight,
  CornerDownLeft,
  CircleDot,
  CheckCircle2,
} from 'lucide-react';
import { TransitMode, RouteOption, POI, RouteStep } from './types';
import { MOCK_ROUTES } from './mockData';

interface DirectionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  destinationPoi: POI | null;
  selectedRoute: RouteOption | null;
  onSelectRoute: (route: RouteOption) => void;
  currentMode: TransitMode;
  onSelectMode: (mode: TransitMode) => void;
}

export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  isOpen,
  onClose,
  destinationPoi,
  selectedRoute,
  onSelectRoute,
  currentMode,
  onSelectMode,
}) => {
  const [origin, setOrigin] = useState('Current Location (Civic Center)');
  const [destination, setDestination] = useState(
    destinationPoi ? destinationPoi.name : 'Ferry Building Marketplace'
  );
  const [intermediateStops, setIntermediateStops] = useState<string[]>([]);
  const [isStepsExpanded, setIsStepsExpanded] = useState(false);

  if (!isOpen) return null;

  const modeTabs: { id: TransitMode; label: string; icon: any }[] = [
    { id: 'driving', label: 'Drive', icon: Car },
    { id: 'transit', label: 'Transit', icon: Train },
    { id: 'cycling', label: 'Cycle', icon: Bike },
    { id: 'walking', label: 'Walk', icon: Footprints },
  ];

  // Get available routes for current mode
  const getRoutesForMode = (mode: TransitMode): RouteOption[] => {
    switch (mode) {
      case 'driving':
        return MOCK_ROUTES.sf_primary;
      case 'transit':
        return MOCK_ROUTES.sf_transit;
      case 'cycling':
        return MOCK_ROUTES.sf_cycling;
      case 'walking':
        return MOCK_ROUTES.sf_walking;
    }
  };

  const routes = getRoutesForMode(currentMode);
  const activeRoute = selectedRoute || routes[0];

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const addIntermediateStop = () => {
    if (intermediateStops.length < 3) {
      setIntermediateStops([...intermediateStops, '']);
    }
  };

  const updateIntermediateStop = (index: number, val: string) => {
    const updated = [...intermediateStops];
    updated[index] = val;
    setIntermediateStops(updated);
  };

  const removeIntermediateStop = (index: number) => {
    setIntermediateStops(intermediateStops.filter((_, i) => i !== index));
  };

  const getStepIcon = (maneuver: RouteStep['maneuver']) => {
    switch (maneuver) {
      case 'turn-left':
      case 'slight-left':
        return <CornerDownLeft className="h-4 w-4 text-blue-400" />;
      case 'turn-right':
      case 'slight-right':
        return <CornerDownRight className="h-4 w-4 text-blue-400" />;
      case 'arrive':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      default:
        return <ArrowRight className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <aside aria-label="Route Planning and Directions" className="absolute top-4 left-4 z-35 w-full max-w-md rounded-3xl border border-white/15 bg-slate-900/90 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] text-white animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/30">
            <Navigation className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-white">Route Directions</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Transit Mode Selector Tabs */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 gap-1">
        {modeTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onSelectMode(tab.id);
                const newRoutes = getRoutesForMode(tab.id);
                onSelectRoute(newRoutes[0]);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Inputs: Origin, Stops, Destination */}
      <div className="p-4 space-y-2">
        <div className="relative flex items-center gap-2">
          <div className="flex flex-col items-center">
            <CircleDot className="h-3.5 w-3.5 text-blue-400" />
            <div className="h-6 w-0.5 bg-white/20 my-0.5" />
            <div className="h-3.5 w-3.5 rounded-full border-2 border-emerald-400 bg-slate-950" />
          </div>

          <div className="flex-1 space-y-2">
            {/* Origin Input */}
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Choose starting point..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />

            {/* Intermediate Stops */}
            {intermediateStops.map((stop, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <input
                  type="text"
                  value={stop}
                  onChange={(e) => updateIntermediateStop(idx, e.target.value)}
                  placeholder={`Stop ${idx + 1}`}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={() => removeIntermediateStop(idx)}
                  className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {/* Destination Input */}
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Choose destination..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            title="Swap Origin & Destination"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white transition-all active:scale-95"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        {/* Add Stop Button */}
        <div className="flex justify-end pt-0.5">
          <button
            onClick={addIntermediateStop}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>Add stop</span>
          </button>
        </div>
      </div>

      {/* Route Options List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5 no-scrollbar">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Suggested Routes
        </div>

        {routes.map((rt) => {
          const isSelected = activeRoute.id === rt.id;
          return (
            <div
              key={rt.id}
              onClick={() => onSelectRoute(rt)}
              className={`cursor-pointer rounded-2xl border p-3 transition-all ${
                isSelected
                  ? 'border-blue-500/60 bg-blue-600/15 shadow-md shadow-blue-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">
                      {rt.durationMin} min
                    </span>
                    <span className="text-xs text-slate-400">({rt.distanceKm} km)</span>
                    {rt.isRecommended && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[10px] font-semibold text-emerald-400">
                        Fastest
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-slate-200 mt-0.5">{rt.title}</div>
                  <div className="text-[11px] text-slate-400">{rt.subtitle}</div>
                </div>

                {/* Badges / Metrics */}
                <div className="text-right space-y-1">
                  {rt.trafficDelayMin ? (
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 justify-end">
                      <AlertTriangle className="h-3 w-3" />
                      <span>+{rt.trafficDelayMin}m traffic</span>
                    </div>
                  ) : null}
                  {rt.elevationGainM ? (
                    <div className="flex items-center gap-1 text-[11px] text-teal-400 justify-end">
                      <TrendingUp className="h-3 w-3" />
                      <span>+{rt.elevationGainM}m gain</span>
                    </div>
                  ) : null}
                  {rt.calories ? (
                    <div className="flex items-center gap-1 text-[11px] text-rose-400 justify-end">
                      <Flame className="h-3 w-3" />
                      <span>{rt.calories} kcal</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Turn-by-turn expandable toggle */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsStepsExpanded(!isStepsExpanded);
                    }}
                    className="flex w-full items-center justify-between text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    <span>{rt.steps.length} Turn-by-Turn Steps</span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isStepsExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {isStepsExpanded && (
                    <div className="mt-2.5 space-y-2 animate-in fade-in duration-200">
                      {rt.steps.map((step, idx) => (
                        <div
                          key={step.id}
                          className="flex items-start gap-2.5 rounded-xl bg-white/5 p-2 text-xs"
                        >
                          <div className="mt-0.5 shrink-0">{getStepIcon(step.maneuver)}</div>
                          <div className="flex-1">
                            <div className="text-slate-200">{step.instruction}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{step.distance}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {step.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
