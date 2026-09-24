/**
 * ResiliAI API service layer.
 *
 * Production-ready resilient service layer:
 * Calls FastAPI backend if configured, with graceful fallback to typed mock state
 * with simulated latency, error handling, and localStorage persistence.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface WeatherData {
  rainfall: number;
  humidity: number;
  incidents: number;
  windSpeed: number;
  temperature: number;
}

export interface ZoneData {
  id: string;
  name: string;
  cx: number;
  cy: number;
  lat: number;
  lng: number;
  baseRisk: number;
  vulnerability: number;
  rainfall: number;
  reports: number;
  shelter: string;
  hospital: string;
  elevation: number;
}

export interface ReportItem {
  id: string | number;
  icon?: string;
  type: string;
  area: string;
  time: string;
  status: "Reported" | "Verified" | "Resolved";
  lat?: number;
  lng?: number;
  severity?: string;
  description?: string;
  photoUrl?: string;
}

export interface EmergencyLocation {
  id: string;
  name: string;
  type: "shelter" | "hospital";
  distance: string;
  capacityPct: number;
  lat?: number;
  lng?: number;
}

const DEFAULT_WEATHER: WeatherData = {
  rainfall: 72,
  humidity: 84,
  incidents: 17,
  windSpeed: 24,
  temperature: 26,
};

const DEFAULT_ZONES: ZoneData[] = [
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

const DEFAULT_REPORTS: ReportItem[] = [
  { id: "pin-1", icon: "🌊", type: "Flash Flood", area: "Wakad Chowk", time: "6m ago", status: "Verified", description: "Water level 2ft above normal." },
  { id: "pin-2", icon: "🚧", type: "Road Submerged", area: "Baner Road", time: "12m ago", status: "Reported", description: "Traffic diverted to service road." },
  { id: "pin-3", icon: "🌳", type: "Fallen Tree", area: "Aundh Main", time: "19m ago", status: "Resolved", description: "Municipal team cleared obstruction." },
  { id: "pin-4", icon: "⚡", type: "Live Wire Hazard", area: "Katraj Tunnel", time: "27m ago", status: "Reported", description: "Power board informed." },
  { id: "pin-5", icon: "🏚️", type: "Wall Collapse", area: "Hadapsar Magarpatta", time: "38m ago", status: "Verified", description: "NDRF unit on scene." },
];

const DEFAULT_LOCATIONS: EmergencyLocation[] = [
  { id: "sh-1", name: "Lonavala High Relief Shelter", type: "shelter", distance: "1.2 km", capacityPct: 78 },
  { id: "sh-2", name: "Baner Sports Complex Safe Zone", type: "shelter", distance: "0.8 km", capacityPct: 45 },
  { id: "sh-3", name: "Aundh Municipal Relief Center", type: "shelter", distance: "1.5 km", capacityPct: 52 },
  { id: "hosp-1", name: "Sancheti Trauma Care", type: "hospital", distance: "2.4 km", capacityPct: 88 },
  { id: "hosp-2", name: "Jupiter Emergency Hospital", type: "hospital", distance: "1.6 km", capacityPct: 62 },
];

async function request<T>(path: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  if (BASE_URL) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Graceful fallback to mock data on network failure
    }
  }

  // Simulated local network latency
  await delay(120);

  if (fallbackData !== undefined) {
    return fallbackData;
  }

  throw new Error(`Endpoint ${path} unavailable and no fallback specified.`);
}

export const api = {
  getRisk: async (): Promise<{ globalRisk: number; trend: { t: string; risk: number }[] }> => {
    return request("/api/risk", undefined, {
      globalRisk: 48,
      trend: [
        { t: "6 AM", risk: 22 },
        { t: "8 AM", risk: 34 },
        { t: "10 AM", risk: 51 },
        { t: "12 PM", risk: 68 },
        { t: "2 PM", risk: 87 },
      ],
    });
  },

  getWeather: async (): Promise<WeatherData> => {
    return request("/api/weather", undefined, DEFAULT_WEATHER);
  },

  getAreas: async (): Promise<ZoneData[]> => {
    return request("/api/areas", undefined, DEFAULT_ZONES);
  },

  getAlerts: async (): Promise<ZoneData[]> => {
    return request("/api/alerts", undefined, DEFAULT_ZONES.filter((z) => z.baseRisk >= 50));
  },

  getReports: async (): Promise<ReportItem[]> => {
    let localSaved: ReportItem[] = [];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("resiliai-reports");
        if (stored) localSaved = JSON.parse(stored);
      } catch {
        localSaved = [];
      }
    }
    const combined = [...localSaved, ...DEFAULT_REPORTS];
    return request("/api/reports", undefined, combined);
  },

  submitReport: async (payload: Partial<ReportItem>): Promise<ReportItem> => {
    const newReport: ReportItem = {
      id: payload.id || `rep-${Date.now()}`,
      icon: payload.icon || "⚠️",
      type: payload.type || "Incident",
      area: payload.area || "Pune Basin",
      time: payload.time || "Just now",
      status: "Reported",
      lat: payload.lat || 18.5204,
      lng: payload.lng || 73.8567,
      severity: payload.severity || "Moderate",
      description: payload.description || "",
      photoUrl: payload.photoUrl,
    };

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("resiliai-reports");
        const list = stored ? JSON.parse(stored) : [];
        localStorage.setItem("resiliai-reports", JSON.stringify([newReport, ...list]));
      } catch {
        // Storage fallback
      }
    }

    return request("/api/reports", { method: "POST", body: JSON.stringify(newReport) }, newReport);
  },

  getEmergencyLocations: async (): Promise<EmergencyLocation[]> => {
    return request("/api/emergency-locations", undefined, DEFAULT_LOCATIONS);
  },

  sendChatMessage: async (message: string): Promise<{ text: string }> => {
    const lower = message.toLowerCase();
    let reply = "Stay alert and monitor local bulletins. Follow instructions from local municipal authorities and emergency response teams.";

    if (lower.includes("flood") || lower.includes("water") || lower.includes("rain")) {
      reply = "High water levels detected in low-lying basins. Avoid underpasses and riverbanks. Nearest shelter is Baner Sports Complex Safe Zone (0.8 km).";
    } else if (lower.includes("route") || lower.includes("evacuat")) {
      reply = "Primary evacuation corridor: Take Northern Bypass away from Mula-Mutha riverbed. Avoid Wakad chowk underpass due to 2ft waterlogging.";
    } else if (lower.includes("hospital") || lower.includes("doctor") || lower.includes("medical")) {
      reply = "Emergency trauma facilities: Sancheti Hospital (2.4 km away, 88% capacity) and Jupiter Hospital (1.6 km, 62% capacity). Ambulance dispatch line: 108.";
    } else if (lower.includes("shelter")) {
      reply = "Emergency shelters: Lonavala High Relief Shelter (1.2 km away, 78% capacity) and Aundh Municipal Relief Center (1.5 km away, 52% capacity).";
    }

    return request("/api/chat", { method: "POST", body: JSON.stringify({ message }) }, { text: reply });
  },
};
