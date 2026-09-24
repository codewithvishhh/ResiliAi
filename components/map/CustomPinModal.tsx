'use client';

import React, { useState } from 'react';
import { MapPin, X, Download, Trash2, Calendar, FileText } from 'lucide-react';
import { CustomPin } from './types';
import { exportToGeoJSON, exportToGPX, downloadFile } from './spatialUtils';

interface CustomPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCoordinates: [number, number] | null;
  onSavePin: (pin: Omit<CustomPin, 'id' | 'createdAt'>) => void;
  pins: CustomPin[];
  onDeletePin: (id: string) => void;
  onFocusPin: (pin: CustomPin) => void;
}

export const CustomPinModal: React.FC<CustomPinModalProps> = ({
  isOpen,
  onClose,
  pendingCoordinates,
  onSavePin,
  pins,
  onDeletePin,
  onFocusPin,
}) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('Waypoint');
  const [color, setColor] = useState('#3B82F6');

  if (!isOpen) return null;

  const colorOptions = [
    { label: 'Blue', hex: '#3B82F6' },
    { label: 'Purple', hex: '#8B5CF6' },
    { label: 'Emerald', hex: '#10B981' },
    { label: 'Rose', hex: '#F43F5E' },
    { label: 'Amber', hex: '#F59E0B' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingCoordinates || !title.trim()) return;

    onSavePin({
      title: title.trim(),
      note: note.trim(),
      category,
      color,
      coordinates: pendingCoordinates,
    });

    setTitle('');
    setNote('');
  };

  const handleExportGeoJSON = () => {
    const geojson = exportToGeoJSON(pins);
    downloadFile(geojson, 'custom_pins.geojson', 'application/geo+json');
  };

  const handleExportGPX = () => {
    const gpx = exportToGPX(pins);
    downloadFile(gpx, 'custom_pins.gpx', 'application/gpx+xml');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95 text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Custom Waypoints & Export</h2>
              <p className="text-xs text-slate-400">Right-click on map to drop pins, then export to GPS/GIS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 no-scrollbar">
          {/* If there are pending coordinates to add */}
          {pendingCoordinates ? (
            <form onSubmit={handleSave} className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-3">
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>New Pin at [{pendingCoordinates[0].toFixed(4)}, {pendingCoordinates[1].toFixed(4)}]</span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scenic Overlook, Secret Spot"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300">Notes / Description</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add notes, access instructions, or field observations..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Color Marker</label>
                  <div className="flex items-center gap-2">
                    {colorOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt.hex}
                        onClick={() => setColor(opt.hex)}
                        style={{ backgroundColor: opt.hex }}
                        className={`h-5 w-5 rounded-full transition-transform ${
                          color === opt.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition-all"
                >
                  Save Pin
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center text-xs text-slate-400">
              Tip: Right-click anywhere on the map to drop a pin at that exact GPS coordinate!
            </div>
          )}

          {/* Dropped Pins List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Saved Custom Pins ({pins.length})
              </span>
            </div>

            {pins.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No custom pins created yet. Right-click on the map to add one.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {pins.map((pin) => (
                  <div
                    key={pin.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-all group"
                  >
                    <div
                      onClick={() => {
                        onFocusPin(pin);
                        onClose();
                      }}
                      className="flex items-start gap-2.5 cursor-pointer flex-1 mr-2"
                    >
                      <div
                        className="mt-0.5 h-3.5 w-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: pin.color }}
                      />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-white truncate">{pin.title}</div>
                        {pin.note && <div className="text-[11px] text-slate-400 truncate">{pin.note}</div>}
                        <div className="text-[10px] text-slate-500">
                          [{pin.coordinates[0].toFixed(4)}, {pin.coordinates[1].toFixed(4)}]
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeletePin(pin.id)}
                      className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/20 opacity-60 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer: Export Buttons */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="text-xs text-slate-400">Export Pins:</div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportGeoJSON}
              disabled={pins.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-30 transition-all"
            >
              <Download className="h-3.5 w-3.5 text-blue-400" />
              <span>GeoJSON</span>
            </button>
            <button
              onClick={handleExportGPX}
              disabled={pins.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-30 transition-all"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>GPX File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
