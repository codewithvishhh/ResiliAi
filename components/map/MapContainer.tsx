'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  POI,
  MapStyleId,
  LayerToggles,
  RouteOption,
  MeasurementState,
  CustomPin,
  CityPreset,
  POICategory,
} from './types';
import {
  MOCK_TRAFFIC_GEOJSON,
  MOCK_TRANSIT_GEOJSON,
  MOCK_AQI_GEOJSON,
  MOCK_3D_BUILDINGS_GEOJSON,
} from './mockData';

interface MapContainerProps {
  currentStyle: MapStyleId;
  pois: POI[];
  selectedCategory: POICategory;
  selectedPoi: POI | null;
  onSelectPoi: (poi: POI) => void;
  layers: LayerToggles;
  activeRoute: RouteOption | null;
  measurement: MeasurementState;
  onAddMeasurementPoint: (coord: [number, number]) => void;
  customPins: CustomPin[];
  onMapRightClick: (coords: [number, number]) => void;
  currentCity: CityPreset;
  onCameraChange: (pitch: number, bearing: number) => void;
  mapInstanceRef: React.MutableRefObject<Map | null>;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  currentStyle,
  pois,
  selectedCategory,
  selectedPoi,
  onSelectPoi,
  layers,
  activeRoute,
  measurement,
  onAddMeasurementPoint,
  customPins,
  onMapRightClick,
  currentCity,
  onCameraChange,
  mapInstanceRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const poiMarkersRef = useRef<Marker[]>([]);
  const customPinMarkersRef = useRef<Marker[]>([]);
  const measurementMarkersRef = useRef<Marker[]>([]);
  const isMeasuringRef = useRef(measurement.active);

  isMeasuringRef.current = measurement.active;

  // Build style spec for MapLibre
  const getStyleSpec = useCallback((styleId: MapStyleId) => {
    switch (styleId) {
      case 'midnight':
      case 'isometric3d':
        return {
          version: 8 as const,
          sources: {
            'carto-dark': {
              type: 'raster' as const,
              tiles: [
                'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              ],
              tileSize: 256,
              attribution: '&copy; CARTO &copy; OpenStreetMap',
            },
          },
          layers: [
            {
              id: 'carto-dark-bg',
              type: 'raster' as const,
              source: 'carto-dark',
              minzoom: 0,
              maxzoom: 20,
            },
          ],
        };

      case 'light':
        return {
          version: 8 as const,
          sources: {
            'carto-light': {
              type: 'raster' as const,
              tiles: [
                'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
                'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
                'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
                'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
              ],
              tileSize: 256,
              attribution: '&copy; CARTO &copy; OpenStreetMap',
            },
          },
          layers: [
            {
              id: 'carto-light-bg',
              type: 'raster' as const,
              source: 'carto-light',
              minzoom: 0,
              maxzoom: 20,
            },
          ],
        };

      case 'satellite':
        return {
          version: 8 as const,
          sources: {
            'esri-imagery': {
              type: 'raster' as const,
              tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
              ],
              tileSize: 256,
              attribution: '&copy; Esri, Maxar, Earthstar Geographics',
            },
            'carto-labels': {
              type: 'raster' as const,
              tiles: [
                'https://a.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}@2x.png',
                'https://b.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}@2x.png',
              ],
              tileSize: 256,
            },
          },
          layers: [
            {
              id: 'esri-imagery-bg',
              type: 'raster' as const,
              source: 'esri-imagery',
              minzoom: 0,
              maxzoom: 19,
            },
            {
              id: 'carto-labels-layer',
              type: 'raster' as const,
              source: 'carto-labels',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        };
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    let mapInstance: Map | null = null;

    const init = () => {

      mapInstance = new maplibregl.Map({
        container: containerRef.current!,
        style: getStyleSpec(currentStyle) as any,
        center: currentCity.coordinates,
        zoom: currentCity.zoom,
        pitch: currentStyle === 'isometric3d' ? 55 : currentCity.pitch,
        bearing: currentStyle === 'isometric3d' ? -25 : currentCity.bearing,
        attributionControl: false,
      });

      mapInstanceRef.current = mapInstance;

      mapInstance.on('load', () => {
        setupSourcesAndLayers(mapInstance!);
      });

      // Track pitch and bearing changes for HUD compass
      const updateCamera = () => {
        if (!mapInstance) return;
        onCameraChange(mapInstance.getPitch(), mapInstance.getBearing());
      };

      mapInstance.on('pitch', updateCamera);
      mapInstance.on('rotate', updateCamera);
      mapInstance.on('move', updateCamera);

      // Map click handler (for measurement)
      mapInstance.on('click', (e) => {
        if (isMeasuringRef.current) {
          onAddMeasurementPoint([e.lngLat.lng, e.lngLat.lat]);
        }
      });

      // Right-click handler for dropping pins
      mapInstance.on('contextmenu', (e) => {
        e.preventDefault();
        onMapRightClick([e.lngLat.lng, e.lngLat.lat]);
      });
    };

    init();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Setup vector and overlay sources/layers
  const setupSourcesAndLayers = (map: Map) => {
    if (!map.isStyleLoaded()) return;

    // 1. Traffic Layer
    if (!map.getSource('traffic-source')) {
      map.addSource('traffic-source', {
        type: 'geojson',
        data: MOCK_TRAFFIC_GEOJSON as any,
      });

      map.addLayer({
        id: 'traffic-casing',
        type: 'line',
        source: 'traffic-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#000000',
          'line-width': 7,
          'line-opacity': 0.6,
        },
      });

      map.addLayer({
        id: 'traffic-lines',
        type: 'line',
        source: 'traffic-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4.5,
          'line-opacity': 0.95,
        },
      });
    }

    // 2. Transit Layer
    if (!map.getSource('transit-source')) {
      map.addSource('transit-source', {
        type: 'geojson',
        data: MOCK_TRANSIT_GEOJSON as any,
      });

      map.addLayer({
        id: 'transit-lines',
        type: 'line',
        source: 'transit-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4,
          'line-dasharray': [2, 1],
          'line-opacity': 0.9,
        },
      });
    }

    // 3. AQI Layer
    if (!map.getSource('aqi-source')) {
      map.addSource('aqi-source', {
        type: 'geojson',
        data: MOCK_AQI_GEOJSON as any,
      });

      map.addLayer({
        id: 'aqi-heat',
        type: 'circle',
        source: 'aqi-source',
        paint: {
          'circle-radius': 45,
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.25,
          'circle-blur': 0.8,
        },
      });

      map.addLayer({
        id: 'aqi-dots',
        type: 'circle',
        source: 'aqi-source',
        paint: {
          'circle-radius': 8,
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
    }

    // 4. 3D Isometric Buildings Layer
    if (!map.getSource('3d-buildings-source')) {
      map.addSource('3d-buildings-source', {
        type: 'geojson',
        data: MOCK_3D_BUILDINGS_GEOJSON as any,
      });

      map.addLayer({
        id: '3d-buildings',
        type: 'fill-extrusion',
        source: '3d-buildings-source',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.9,
        },
      });
    }

    // 5. Active Navigation Route Layer
    if (!map.getSource('route-source')) {
      map.addSource('route-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Route Glow Casing
      map.addLayer({
        id: 'route-casing',
        type: 'line',
        source: 'route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#1E40AF',
          'line-width': 10,
          'line-opacity': 0.5,
          'line-blur': 3,
        },
      });

      // Route Core Line
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#38BDF8',
          'line-width': 5.5,
          'line-opacity': 1.0,
        },
      });
    }

    // 6. Measurement Layer
    if (!map.getSource('measurement-source')) {
      map.addSource('measurement-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'measurement-polygon',
        type: 'fill',
        source: 'measurement-source',
        paint: {
          'fill-color': '#F59E0B',
          'fill-opacity': 0.25,
        },
        filter: ['==', '$type', 'Polygon'],
      });

      map.addLayer({
        id: 'measurement-line',
        type: 'line',
        source: 'measurement-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#F59E0B',
          'line-width': 3,
          'line-dasharray': [2, 2],
        },
        filter: ['==', '$type', 'LineString'],
      });
    }

    updateLayerVisibilities(map);
  };

  // Update Layer Visibilities based on state
  const updateLayerVisibilities = (map: Map) => {
    if (!map.isStyleLoaded()) return;

    const setVisibility = (layerId: string, visible: boolean) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    setVisibility('traffic-casing', layers.traffic);
    setVisibility('traffic-lines', layers.traffic);
    setVisibility('transit-lines', layers.transit);
    setVisibility('aqi-heat', layers.aqi);
    setVisibility('aqi-dots', layers.aqi);
    setVisibility('3d-buildings', currentStyle === 'isometric3d');
  };

  // Handle Map Style Switch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setStyle(getStyleSpec(currentStyle) as any);

    map.once('style.load', () => {
      setupSourcesAndLayers(map);
      if (currentStyle === 'isometric3d') {
        map.easeTo({
          pitch: 60,
          bearing: -25,
          duration: 1200,
        });
      }
    });
  }, [currentStyle, getStyleSpec]);

  // Handle Layer Toggle Changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) {
      updateLayerVisibilities(map);
    }
  }, [layers, currentStyle]);

  // Handle City Change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo({
      center: currentCity.coordinates,
      zoom: currentCity.zoom,
      pitch: currentStyle === 'isometric3d' ? 60 : currentCity.pitch,
      bearing: currentCity.bearing,
      essential: true,
      duration: 2000,
    });
  }, [currentCity]);

  // Render POI Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    poiMarkersRef.current.forEach((m) => m.remove());
    poiMarkersRef.current = [];

    const renderMarkers = () => {

      // Filter POIs by selected category
      const visiblePois =
        selectedCategory === 'all'
          ? pois
          : pois.filter((p) => p.category === selectedCategory);

      visiblePois.forEach((poi) => {
        const isSelected = selectedPoi?.id === poi.id;

        // Custom badge pin element
        const el = document.createElement('div');
        el.className = 'poi-marker-container cursor-pointer select-none group';

        const getCategoryBadgeColor = (cat: string) => {
          switch (cat) {
            case 'coffee':
              return 'from-amber-600 to-amber-800 text-white';
            case 'restaurant':
              return 'from-rose-600 to-rose-800 text-white';
            case 'ev_charger':
              return 'from-emerald-500 to-teal-700 text-white';
            case 'park':
              return 'from-emerald-600 to-green-800 text-white';
            case 'transit':
              return 'from-blue-600 to-indigo-800 text-white';
            case 'hotel':
              return 'from-violet-600 to-purple-800 text-white';
            default:
              return 'from-slate-700 to-slate-900 text-white';
          }
        };

        el.innerHTML = `
          <div class="relative flex items-center justify-center transition-all duration-300 transform group-hover:scale-115 ${
            isSelected ? 'scale-125 z-40' : 'z-20'
          }">
            <!-- Pulsing ring on selected / hover -->
            <div class="absolute -inset-1.5 rounded-full bg-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity ${
              isSelected ? 'opacity-100 animate-ping' : ''
            }"></div>

            <!-- Pin Pill -->
            <div class="relative flex items-center gap-1.5 rounded-full bg-gradient-to-br ${getCategoryBadgeColor(
              poi.category
            )} px-2.5 py-1 shadow-lg shadow-black/40 border border-white/20">
              <span class="text-[11px] font-bold tracking-tight">${poi.name.split(' ')[0]}</span>
              <span class="h-1.5 w-1.5 rounded-full bg-white/80"></span>
            </div>

            <!-- Pin Stem Arrow -->
            <div class="absolute -bottom-1.5 h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectPoi(poi);
          map.flyTo({
            center: poi.coordinates,
            zoom: Math.max(map.getZoom(), 15.2),
            essential: true,
            duration: 1200,
          });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(poi.coordinates)
          .addTo(map);

        poiMarkersRef.current.push(marker);
      });
    };

    renderMarkers();
  }, [pois, selectedCategory, selectedPoi, onSelectPoi]);

  // Render Custom Dropped Pin Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    customPinMarkersRef.current.forEach((m) => m.remove());
    customPinMarkersRef.current = [];

    const renderCustomMarkers = () => {

      customPins.forEach((pin) => {
        const el = document.createElement('div');
        el.className = 'cursor-pointer group';
        el.innerHTML = `
          <div class="relative flex flex-col items-center group-hover:scale-110 transition-transform">
            <div class="h-4 w-4 rounded-full border-2 border-white shadow-xl" style="background-color: ${pin.color}"></div>
            <div class="mt-0.5 rounded-md bg-slate-900/90 px-1.5 py-0.5 text-[9px] font-bold text-white border border-white/10 shadow-md">
              ${pin.title}
            </div>
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(pin.coordinates)
          .addTo(map);

        customPinMarkersRef.current.push(marker);
      });
    };

    renderCustomMarkers();
  }, [customPins]);

  // Update Active Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.getSource('route-source')) return;

    const source: any = map.getSource('route-source');

    if (!activeRoute || activeRoute.coordinates.length < 2) {
      source.setData({
        type: 'FeatureCollection',
        features: [],
      });
      return;
    }

    source.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: activeRoute.coordinates,
          },
        },
      ],
    });

    // Fit map bounds to encompass the route
    const coords = activeRoute.coordinates;
    const lons = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    map.fitBounds(
      [
        [minLon, minLat],
        [maxLon, maxLat],
      ],
      {
        padding: { top: 100, bottom: 100, left: 420, right: 100 },
        duration: 1500,
      }
    );
  }, [activeRoute]);

  // Update Measurement Drawing Layer & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.getSource('measurement-source')) return;

    const source: any = map.getSource('measurement-source');

    measurementMarkersRef.current.forEach((m) => m.remove());
    measurementMarkersRef.current = [];

    const pts = measurement.points;
    if (pts.length === 0) {
      source.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const features: any[] = [];

    if (pts.length >= 2) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: pts,
        },
      });
    }

    if (measurement.mode === 'area' && pts.length >= 3) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[...pts, pts[0]]],
        },
      });
    }

    source.setData({
      type: 'FeatureCollection',
      features,
    });

    // Render node markers
    const renderNodeMarkers = () => {
      pts.forEach((pt, idx) => {
        const el = document.createElement('div');
        el.className =
          'h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-500 shadow-md transform -translate-x-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center text-[8px] font-bold text-slate-950';
        el.innerText = `${idx + 1}`;

        const m = new maplibregl.Marker({ element: el }).setLngLat(pt).addTo(map);
        measurementMarkersRef.current.push(m);
      });
    };

    renderNodeMarkers();
  }, [measurement]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing"
    />
  );
};
