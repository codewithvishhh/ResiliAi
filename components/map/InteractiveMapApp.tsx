'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { Map } from 'maplibre-gl';
import {
  POI,
  MapStyleId,
  POICategory,
  TransitMode,
  RouteOption,
  MeasurementState,
  CustomPin,
  LayerToggles,
  CityPreset,
} from './types';
import { MOCK_POIS, CITY_PRESETS, MOCK_ROUTES } from './mockData';
import {
  calculatePolylineDistanceMeters,
  calculatePolygonAreaMeters,
} from './spatialUtils';
import { MapContainer } from './MapContainer';
import { MapHUD } from './MapHUD';
import { Omnibox } from './Omnibox';
import { LayerPanel } from './LayerPanel';
import { PoiDetailDrawer } from './PoiDetailDrawer';
import { DirectionsPanel } from './DirectionsPanel';
import { MeasureTool } from './MeasureTool';
import { CustomPinModal } from './CustomPinModal';

export default function InteractiveMapApp() {
  // Theme state: dark-mode first
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Map style state (default: midnight)
  const [currentStyle, setCurrentStyle] = useState<MapStyleId>('midnight');

  // Active Metro Area / City
  const [currentCity, setCurrentCity] = useState<CityPreset>(CITY_PRESETS[0]);

  // Camera Pitch & Bearing
  const [pitch, setPitch] = useState(50);
  const [bearing, setBearing] = useState(-20);
  const [is3D, setIs3D] = useState(true);

  // Map instance ref for direct imperative controls (flyTo, easeTo, zoom)
  const mapInstanceRef = useRef<Map | null>(null);

  // Discovery / POIs
  const [pois] = useState<POI[]>(MOCK_POIS);
  const [selectedCategory, setSelectedCategory] = useState<POICategory>('all');
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [savedPoiIds, setSavedPoiIds] = useState<string[]>(['poi-sf-1', 'poi-sf-4']);

  // Map Overlays
  const [layers, setLayers] = useState<LayerToggles>({
    traffic: false,
    weather: false,
    aqi: false,
    transit: false,
  });
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);

  // Directions & Routing Engine
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  const [directionsDestination, setDirectionsDestination] = useState<POI | null>(null);
  const [transitMode, setTransitMode] = useState<TransitMode>('driving');
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(
    MOCK_ROUTES.sf_primary[0]
  );

  // Spatial Measurement Tool
  const [measurement, setMeasurement] = useState<MeasurementState>({
    active: false,
    mode: 'distance',
    points: [],
    totalDistanceKm: 0,
    totalAreaM2: 0,
  });

  // Custom Dropped Pins
  const [customPins, setCustomPins] = useState<CustomPin[]>([]);
  const [pendingPinCoords, setPendingPinCoords] = useState<[number, number] | null>(null);
  const [isCustomPinModalOpen, setIsCustomPinModalOpen] = useState(false);

  // Geolocation state
  const [isLocating, setIsLocating] = useState(false);

  // Camera change listener from MapContainer
  const handleCameraChange = (p: number, b: number) => {
    setPitch(p);
    setBearing(b);
    setIs3D(p > 25);
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn({ duration: 300 });
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut({ duration: 300 });
    }
  };

  // 3D Pitch Toggle
  const handleToggle3D = () => {
    if (!mapInstanceRef.current) return;
    const nextIs3D = !is3D;
    setIs3D(nextIs3D);
    mapInstanceRef.current.easeTo({
      pitch: nextIs3D ? 60 : 0,
      duration: 800,
    });
  };

  // Compass Reset to North
  const handleResetNorth = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.easeTo({
      bearing: 0,
      pitch: 0,
      duration: 800,
    });
  };

  // Geolocation Handler
  const handleLocateMe = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
              center: [pos.coords.longitude, pos.coords.latitude],
              zoom: 15.5,
              essential: true,
              duration: 2000,
            });
          }
        },
        () => {
          // Fallback if denied or unavailable: fly to iconic downtown coordinates with smooth animation
          setIsLocating(false);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
              center: currentCity.coordinates,
              zoom: 16,
              essential: true,
              duration: 1800,
            });
          }
        },
        { timeout: 4000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Measurement Tool triggers
  const handleToggleMeasure = () => {
    setMeasurement((prev) => ({
      ...prev,
      active: !prev.active,
      points: !prev.active ? [] : prev.points,
      totalDistanceKm: 0,
      totalAreaM2: 0,
    }));
  };

  const handleAddMeasurementPoint = (coord: [number, number]) => {
    setMeasurement((prev) => {
      const newPoints: [number, number][] = [...prev.points, coord];
      const distMeters = calculatePolylineDistanceMeters(newPoints);
      const areaM2 =
        prev.mode === 'area' && newPoints.length >= 3
          ? calculatePolygonAreaMeters(newPoints)
          : 0;

      return {
        ...prev,
        points: newPoints,
        totalDistanceKm: distMeters / 1000,
        totalAreaM2: areaM2,
      };
    });
  };

  const handleSetMeasureMode = (mode: 'distance' | 'area') => {
    setMeasurement((prev) => {
      const areaM2 =
        mode === 'area' && prev.points.length >= 3
          ? calculatePolygonAreaMeters(prev.points)
          : 0;
      return { ...prev, mode, totalAreaM2: areaM2 };
    });
  };

  const handleClearMeasurement = () => {
    setMeasurement((prev) => ({
      ...prev,
      points: [],
      totalDistanceKm: 0,
      totalAreaM2: 0,
    }));
  };

  const handleUndoMeasurementPoint = () => {
    setMeasurement((prev) => {
      if (prev.points.length === 0) return prev;
      const newPoints = prev.points.slice(0, -1);
      const distMeters = calculatePolylineDistanceMeters(newPoints);
      const areaM2 =
        prev.mode === 'area' && newPoints.length >= 3
          ? calculatePolygonAreaMeters(newPoints)
          : 0;

      return {
        ...prev,
        points: newPoints,
        totalDistanceKm: distMeters / 1000,
        totalAreaM2: areaM2,
      };
    });
  };

  // Custom Pin right-click
  const handleMapRightClick = (coords: [number, number]) => {
    setPendingPinCoords(coords);
    setIsCustomPinModalOpen(true);
  };

  const handleSavePin = (pinData: Omit<CustomPin, 'id' | 'createdAt'>) => {
    const newPin: CustomPin = {
      ...pinData,
      id: `pin-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomPins((prev) => [newPin, ...prev]);
    setPendingPinCoords(null);
  };

  const handleDeletePin = (id: string) => {
    setCustomPins((prev) => prev.filter((p) => p.id !== id));
  };

  const handleFocusPin = (pin: CustomPin) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: pin.coordinates,
        zoom: 16,
        essential: true,
        duration: 1200,
      });
    }
  };

  // Toggle Save POI Bookmark
  const handleToggleSavePoi = (poiId: string) => {
    setSavedPoiIds((prev) =>
      prev.includes(poiId) ? prev.filter((id) => id !== poiId) : [...prev, poiId]
    );
  };

  // Open Directions Modal
  const handleOpenDirections = (destinationPoi?: POI) => {
    if (destinationPoi) {
      setDirectionsDestination(destinationPoi);
    }
    setSelectedPoi(null);
    setIsDirectionsOpen(true);
  };

  // Select POI
  const handleSelectPoi = (poi: POI) => {
    setSelectedPoi(poi);
    setIsDirectionsOpen(false);
  };

  // Layer toggle
  const handleToggleLayer = (layer: keyof LayerToggles) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Style change
  const handleSelectStyle = (style: MapStyleId) => {
    setCurrentStyle(style);
    if (style === 'light') {
      setIsDarkMode(false);
    } else {
      setIsDarkMode(true);
    }
  };

  return (
    <main
      className={`relative h-screen w-screen overflow-hidden select-none ${
        isDarkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Map Canvas */}
      <MapContainer
        currentStyle={currentStyle}
        pois={pois}
        selectedCategory={selectedCategory}
        selectedPoi={selectedPoi}
        onSelectPoi={handleSelectPoi}
        layers={layers}
        activeRoute={isDirectionsOpen ? selectedRoute : null}
        measurement={measurement}
        onAddMeasurementPoint={handleAddMeasurementPoint}
        customPins={customPins}
        onMapRightClick={handleMapRightClick}
        currentCity={currentCity}
        onCameraChange={handleCameraChange}
        mapInstanceRef={mapInstanceRef}
      />

      {/* Floating Omnibox Search */}
      {!isDirectionsOpen && (
        <Omnibox
          pois={pois}
          selectedPoi={selectedPoi}
          onSelectPoi={handleSelectPoi}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onOpenDirections={handleOpenDirections}
          currentCity={currentCity}
          onSelectCity={setCurrentCity}
          savedPoiIds={savedPoiIds}
          onToggleSavePoi={handleToggleSavePoi}
        />
      )}

      {/* Floating HUD Controls (bottom-right) */}
      <MapHUD
        currentStyle={currentStyle}
        onSelectStyle={handleSelectStyle}
        pitch={pitch}
        bearing={bearing}
        is3D={is3D}
        onToggle3D={handleToggle3D}
        onResetNorth={handleResetNorth}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
        isMeasuring={measurement.active}
        onToggleMeasure={handleToggleMeasure}
        isLayerPanelOpen={isLayerPanelOpen}
        onToggleLayerPanel={() => setIsLayerPanelOpen(!isLayerPanelOpen)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Overlays / Layers Popover Panel */}
      <LayerPanel
        isOpen={isLayerPanelOpen}
        onClose={() => setIsLayerPanelOpen(false)}
        layers={layers}
        onToggleLayer={handleToggleLayer}
      />

      {/* Slide-over POI Detail Drawer */}
      <PoiDetailDrawer
        poi={selectedPoi}
        onClose={() => setSelectedPoi(null)}
        onGetDirections={(poi) => handleOpenDirections(poi)}
        isSaved={selectedPoi ? savedPoiIds.includes(selectedPoi.id) : false}
        onToggleSave={handleToggleSavePoi}
      />

      {/* Multi-modal Directions Modal */}
      <DirectionsPanel
        isOpen={isDirectionsOpen}
        onClose={() => setIsDirectionsOpen(false)}
        destinationPoi={directionsDestination}
        selectedRoute={selectedRoute}
        onSelectRoute={setSelectedRoute}
        currentMode={transitMode}
        onSelectMode={setTransitMode}
      />

      {/* Measurement Tool HUD */}
      <MeasureTool
        measurement={measurement}
        onSetMode={handleSetMeasureMode}
        onClear={handleClearMeasurement}
        onUndo={handleUndoMeasurementPoint}
        onClose={() =>
          setMeasurement((prev) => ({ ...prev, active: false, points: [] }))
        }
      />

      {/* Custom Pin Right-Click Modal */}
      <CustomPinModal
        isOpen={isCustomPinModalOpen}
        onClose={() => {
          setIsCustomPinModalOpen(false);
          setPendingPinCoords(null);
        }}
        pendingCoordinates={pendingPinCoords}
        onSavePin={handleSavePin}
        pins={customPins}
        onDeletePin={handleDeletePin}
        onFocusPin={handleFocusPin}
      />
    </main>
  );
}
