'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  MapPin,
  Clock,
  Bookmark,
  Navigation2,
  Utensils,
  Zap,
  Coffee,
  Trees,
  Train,
  Hotel,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { POI, POICategory, CityPreset } from './types';
import { CITY_PRESETS } from './mockData';

interface OmniboxProps {
  pois: POI[];
  selectedPoi: POI | null;
  onSelectPoi: (poi: POI) => void;
  selectedCategory: POICategory;
  onSelectCategory: (category: POICategory) => void;
  onOpenDirections: (destinationPoi?: POI) => void;
  currentCity: CityPreset;
  onSelectCity: (city: CityPreset) => void;
  savedPoiIds: string[];
  onToggleSavePoi: (poiId: string) => void;
}

export const Omnibox: React.FC<OmniboxProps> = ({
  pois,
  onSelectPoi,
  selectedCategory,
  onSelectCategory,
  onOpenDirections,
  currentCity,
  onSelectCity,
  savedPoiIds,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Sightglass Coffee & Roastery',
    'Ferry Building Marketplace',
    'Tesla Supercharger',
  ]);
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter chips
  const categoryChips: { id: POICategory; label: string; icon: any }[] = [
    { id: 'all', label: 'All Places', icon: Sparkles },
    { id: 'restaurant', label: 'Restaurants', icon: Utensils },
    { id: 'ev_charger', label: 'EV Chargers', icon: Zap },
    { id: 'coffee', label: 'Coffee', icon: Coffee },
    { id: 'park', label: 'Parks', icon: Trees },
    { id: 'transit', label: 'Transit', icon: Train },
    { id: 'hotel', label: 'Hotels', icon: Hotel },
  ];

  // Fuzzy match logic
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return pois
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query, pois]);

  // Saved POIs list
  const savedPois = useMemo(() => {
    return pois.filter((p) => savedPoiIds.includes(p.id));
  }, [pois, savedPoiIds]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setIsCityMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (poi: POI) => {
    onSelectPoi(poi);
    setQuery('');
    setIsFocused(false);
    if (!recentSearches.includes(poi.name)) {
      setRecentSearches([poi.name, ...recentSearches.slice(0, 4)]);
    }
  };

  const handleSelectRecent = (name: string) => {
    const match = pois.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (match) {
      handleSelectResult(match);
    } else {
      setQuery(name);
      setIsFocused(true);
    }
  };

  return (
    <div ref={containerRef} className="absolute top-4 left-4 z-30 flex flex-col w-full max-w-md pointer-events-none">
      {/* Top Search Card */}
      <div className="pointer-events-auto rounded-2xl border border-white/15 bg-slate-900/80 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 transition-all">
        <div className="flex items-center gap-2 p-2">
          {/* City Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setIsCityMenuOpen(!isCityMenuOpen)}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/15 transition-all"
            >
              <span>{currentCity.name}</span>
              <ChevronDown className="h-3 w-3 text-slate-300" />
            </button>

            {isCityMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 rounded-xl border border-white/15 bg-slate-900 p-1.5 shadow-2xl backdrop-blur-xl z-50">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Select Metro Area
                </div>
                {CITY_PRESETS.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      onSelectCity(city);
                      setIsCityMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-all ${
                      currentCity.id === city.id
                        ? 'bg-blue-600 font-semibold text-white'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{city.name}</span>
                    <span className="text-[10px] opacity-60">{city.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input Box */}
          <div className="relative flex-1 flex items-center">
            <Search className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search places, addresses, cafes..."
              className="w-full bg-transparent px-2.5 py-1.5 text-sm text-white placeholder-slate-400 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-slate-400 hover:text-white transition-all mr-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Direct Route / Directions Shortcut Button */}
          <button
            onClick={() => onOpenDirections()}
            title="Directions"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-95"
          >
            <Navigation2 className="h-3.5 w-3.5" />
            <span>Route</span>
          </button>
        </div>

        {/* Autocomplete / Recent / Saved Dropdown */}
        {isFocused && (
          <div className="border-t border-white/10 p-2 max-h-80 overflow-y-auto space-y-2 animate-in fade-in duration-150">
            {/* Live Fuzzy Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Search Results
                </div>
                {searchResults.map((poi) => (
                  <button
                    key={poi.id}
                    onClick={() => handleSelectResult(poi)}
                    className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-slate-200 hover:bg-white/10 hover:text-white transition-all group"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="flex-1 truncate">
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span className="truncate">{poi.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-normal">
                          {poi.categoryLabel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{poi.address}</div>
                    </div>
                    <div className="text-xs font-semibold text-amber-400 shrink-0">
                      ★ {poi.rating}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {query.trim() && searchResults.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400">
                No matching places found for "{query}"
              </div>
            )}

            {/* Saved Places */}
            {!query.trim() && savedPois.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Bookmark className="h-3 w-3" />
                  <span>Saved Places</span>
                </div>
                {savedPois.map((poi) => (
                  <button
                    key={poi.id}
                    onClick={() => handleSelectResult(poi)}
                    className="flex w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-left text-slate-200 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <Bookmark className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <div className="flex-1 truncate text-xs font-medium">{poi.name}</div>
                    <span className="text-[10px] text-slate-400">{poi.city}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {!query.trim() && recentSearches.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Recent Searches</span>
                </div>
                {recentSearches.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectRecent(item)}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span className="truncate">{item}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Filter Chips */}
      <div className="pointer-events-auto mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categoryChips.map((chip) => {
          const Icon = chip.icon;
          const isSelected = selectedCategory === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => onSelectCategory(chip.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur-xl transition-all active:scale-95 ${
                isSelected
                  ? 'border-blue-500 bg-blue-600 text-white shadow-blue-500/25'
                  : 'border-white/15 bg-slate-900/80 text-slate-200 hover:bg-white/15 hover:text-white dark:border-white/10 dark:bg-slate-950/80'
              }`}
            >
              <Icon className={`h-3 w-3 ${isSelected ? 'text-white' : 'text-blue-400'}`} />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
