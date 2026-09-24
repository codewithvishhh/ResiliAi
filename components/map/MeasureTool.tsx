'use client';

import React from 'react';
import { Ruler, Pentagon, Trash2, Undo, Download, X } from 'lucide-react';
import { MeasurementState } from './types';
import { formatDistance, formatArea, exportToGeoJSON, downloadFile } from './spatialUtils';

interface MeasureToolProps {
  measurement: MeasurementState;
  onSetMode: (mode: 'distance' | 'area') => void;
  onClear: () => void;
  onUndo: () => void;
  onClose: () => void;
}

export const MeasureTool: React.FC<MeasureToolProps> = ({
  measurement,
  onSetMode,
  onClear,
  onUndo,
  onClose,
}) => {
  if (!measurement.active) return null;

  const dist = formatDistance(measurement.totalDistanceKm * 1000);
  const area = formatArea(measurement.totalAreaM2);

  const handleExportGeoJSON = () => {
    const json = exportToGeoJSON([], measurement.points, measurement.mode === 'area');
    downloadFile(json, `measurement_${measurement.mode}.geojson`, 'application/geo+json');
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-md rounded-2xl border border-white/15 bg-slate-900/90 p-3 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95 text-white animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
            <Ruler className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider">Spatial Measurement Tool</span>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Mode switcher & instructions */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-xl bg-white/10 p-1">
          <button
            onClick={() => onSetMode('distance')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              measurement.mode === 'distance'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Ruler className="h-3.5 w-3.5" />
            <span>Ruler (Line)</span>
          </button>
          <button
            onClick={() => onSetMode('area')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              measurement.mode === 'area'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Pentagon className="h-3.5 w-3.5" />
            <span>Polygon (Area)</span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={measurement.points.length === 0}
            title="Undo last point"
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <Undo className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClear}
            disabled={measurement.points.length === 0}
            title="Clear all points"
            className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/20 disabled:opacity-30"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleExportGeoJSON}
            disabled={measurement.points.length < 2}
            title="Export GeoJSON"
            className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-30"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Live Measurement Readouts */}
      <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-2.5 text-xs">
        <div>
          <div className="text-[10px] text-slate-400 font-medium">TOTAL DISTANCE</div>
          <div className="text-sm font-bold text-amber-400">{dist.primary}</div>
          <div className="text-[10px] text-slate-400">{dist.secondary}</div>
        </div>

        {measurement.mode === 'area' ? (
          <div>
            <div className="text-[10px] text-slate-400 font-medium">SURFACE AREA</div>
            <div className="text-sm font-bold text-teal-400">{area.acres}</div>
            <div className="text-[10px] text-slate-400">{area.sqKm}</div>
          </div>
        ) : (
          <div>
            <div className="text-[10px] text-slate-400 font-medium">WAYPOINTS</div>
            <div className="text-sm font-bold text-white">{measurement.points.length} points</div>
            <div className="text-[10px] text-slate-400">Click on map to add</div>
          </div>
        )}
      </div>

      {/* Helper prompt */}
      <div className="mt-1.5 text-center text-[11px] text-slate-400">
        {measurement.points.length === 0
          ? 'Click anywhere on the map to place the first point'
          : measurement.mode === 'area' && measurement.points.length < 3
          ? 'Add at least 3 points to compute polygon area'
          : 'Click anywhere to add another waypoint'}
      </div>
    </div>
  );
};
