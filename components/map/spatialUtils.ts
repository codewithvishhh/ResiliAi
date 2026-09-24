import { CustomPin } from './types';

const EARTH_RADIUS_METERS = 6371008.8;

/**
 * Calculates great-circle distance between two [lng, lat] points in meters using the Haversine formula
 */
export function calculateDistanceMeters(
  point1: [number, number],
  point2: [number, number]
): number {
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculates total polyline distance across an array of [lng, lat] points in meters
 */
export function calculatePolylineDistanceMeters(points: [number, number][]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += calculateDistanceMeters(points[i], points[i + 1]);
  }
  return total;
}

/**
 * Calculates area of a spherical polygon defined by an array of [lng, lat] coordinates in square meters
 */
export function calculatePolygonAreaMeters(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  
  let total = 0;
  const len = coords.length;

  for (let i = 0; i < len; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % len];
    total +=
      toRad(p2[0] - p1[0]) *
      (2 + Math.sin(toRad(p1[1])) + Math.sin(toRad(p2[1])));
  }

  total = (total * EARTH_RADIUS_METERS * EARTH_RADIUS_METERS) / 2.0;
  return Math.abs(total);
}

export function formatDistance(meters: number, unit: 'metric' | 'imperial' = 'metric'): { primary: string; secondary: string } {
  if (unit === 'metric') {
    if (meters < 1000) {
      return {
        primary: `${Math.round(meters)} m`,
        secondary: `${(meters * 3.28084).toFixed(0)} ft`,
      };
    }
    const km = meters / 1000;
    const mi = km * 0.621371;
    return {
      primary: `${km.toFixed(2)} km`,
      secondary: `${mi.toFixed(2)} mi`,
    };
  } else {
    const mi = (meters / 1000) * 0.621371;
    const km = meters / 1000;
    return {
      primary: `${mi.toFixed(2)} mi`,
      secondary: `${km.toFixed(2)} km`,
    };
  }
}

export function formatArea(sqMeters: number): { sqKm: string; acres: string; sqMiles: string } {
  const sqKm = (sqMeters / 1_000_000).toFixed(3);
  const acres = (sqMeters * 0.000247105).toFixed(2);
  const sqMiles = (sqMeters * 0.000000386102).toFixed(3);
  return {
    sqKm: `${sqKm} km²`,
    acres: `${acres} acres`,
    sqMiles: `${sqMiles} sq mi`,
  };
}

/**
 * Generate standard GeoJSON representation of custom pins and measurement shapes
 */
export function exportToGeoJSON(pins: CustomPin[], measurementPoints?: [number, number][], isArea?: boolean): string {
  const features: any[] = pins.map((pin) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: pin.coordinates,
    },
    properties: {
      id: pin.id,
      title: pin.title,
      note: pin.note,
      category: pin.category,
      color: pin.color,
      createdAt: pin.createdAt,
    },
  }));

  if (measurementPoints && measurementPoints.length > 1) {
    if (isArea && measurementPoints.length >= 3) {
      // closed polygon ring
      const ring = [...measurementPoints, measurementPoints[0]];
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [ring],
        },
        properties: {
          name: 'Measurement Area',
          areaSqM: calculatePolygonAreaMeters(measurementPoints),
        },
      });
    } else {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: measurementPoints,
        },
        properties: {
          name: 'Measurement Line',
          distanceMeters: calculatePolylineDistanceMeters(measurementPoints),
        },
      });
    }
  }

  const collection = {
    type: 'FeatureCollection',
    features,
  };

  return JSON.stringify(collection, null, 2);
}

/**
 * Generate standard GPX XML representation
 */
export function exportToGPX(pins: CustomPin[], measurementPoints?: [number, number][]): string {
  let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GeoSphere Maps" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>GeoSphere Map Export</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
`;

  // Waypoints
  pins.forEach((pin) => {
    gpx += `  <wpt lat="${pin.coordinates[1]}" lon="${pin.coordinates[0]}">
    <name>${escapeXml(pin.title)}</name>
    <desc>${escapeXml(pin.note)}</desc>
    <type>${escapeXml(pin.category)}</type>
    <time>${pin.createdAt}</time>
  </wpt>\n`;
  });

  // Track if measurement points exist
  if (measurementPoints && measurementPoints.length > 1) {
    gpx += `  <trk>
    <name>Measured Path</name>
    <trkseg>\n`;
    measurementPoints.forEach((pt) => {
      gpx += `      <trkpt lat="${pt[1]}" lon="${pt[0]}"></trkpt>\n`;
    });
    gpx += `    </trkseg>
  </trk>\n`;
  }

  gpx += `</gpx>`;
  return gpx;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Trigger client-side file download
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
