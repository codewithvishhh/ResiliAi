export type MapStyleId = 'midnight' | 'light' | 'satellite' | 'isometric3d';

export type POICategory =
  | 'all'
  | 'restaurant'
  | 'ev_charger'
  | 'coffee'
  | 'park'
  | 'transit'
  | 'hotel';

export interface ReviewItem {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface POI {
  id: string;
  name: string;
  category: Exclude<POICategory, 'all'>;
  categoryLabel: string;
  coordinates: [number, number]; // [lng, lat]
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  priceLevel: '$' | '$$' | '$$$' | '$$$$';
  status: string;
  isOpen: boolean;
  closingTime?: string;
  photos: string[];
  description: string;
  phone: string;
  website: string;
  amenities: string[];
  reviews: ReviewItem[];
  verified?: boolean;
}

export type TransitMode = 'driving' | 'transit' | 'cycling' | 'walking';

export interface RouteStep {
  id: string;
  instruction: string;
  distance: string;
  duration: string;
  maneuver: 'straight' | 'turn-left' | 'turn-right' | 'slight-left' | 'slight-right' | 'roundabout' | 'arrive';
}

export interface RouteOption {
  id: string;
  title: string;
  subtitle: string;
  mode: TransitMode;
  distanceKm: number;
  durationMin: number;
  trafficDelayMin?: number;
  elevationGainM?: number;
  calories?: number;
  isRecommended?: boolean;
  coordinates: [number, number][]; // [[lng, lat], ...]
  steps: RouteStep[];
}

export interface CustomPin {
  id: string;
  title: string;
  note: string;
  category: string;
  color: string;
  coordinates: [number, number]; // [lng, lat]
  createdAt: string;
}

export interface MeasurementState {
  active: boolean;
  mode: 'distance' | 'area';
  points: [number, number][];
  totalDistanceKm: number;
  totalAreaM2: number;
}

export interface LayerToggles {
  traffic: boolean;
  weather: boolean;
  aqi: boolean;
  transit: boolean;
}

export interface CityPreset {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing: number;
}
