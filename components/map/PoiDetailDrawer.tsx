'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  CheckCircle2,
  Navigation,
  Bookmark,
  Share2,
  Phone,
  Globe,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
} from 'lucide-react';
import { POI } from './types';

interface PoiDetailDrawerProps {
  poi: POI | null;
  onClose: () => void;
  onGetDirections: (poi: POI) => void;
  isSaved: boolean;
  onToggleSave: (poiId: string) => void;
}

export const PoiDetailDrawer: React.FC<PoiDetailDrawerProps> = ({
  poi,
  onClose,
  onGetDirections,
  isSaved,
  onToggleSave,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!poi) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: poi.name,
        text: `${poi.name} - ${poi.address}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${poi.name}, ${poi.address}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nextPhoto = () => {
    setActivePhotoIdx((prev) => (prev + 1) % poi.photos.length);
  };

  const prevPhoto = () => {
    setActivePhotoIdx((prev) => (prev - 1 + poi.photos.length) % poi.photos.length);
  };

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Place Details"
        initial={{ x: -420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -420, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="absolute top-20 left-4 z-35 w-full max-w-sm rounded-3xl border border-white/15 bg-slate-900/90 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95 overflow-hidden flex flex-col max-h-[calc(100vh-6.5rem)] text-white"
      >
        {/* Cover Photo Carousel */}
        <div className="relative h-52 w-full bg-slate-800 overflow-hidden group">
          {poi.photos.length > 0 ? (
            <img
              src={poi.photos[activePhotoIdx]}
              alt={poi.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-500">
              No Photos Available
            </div>
          )}

          {/* Gradient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/60 text-white backdrop-blur-md hover:bg-slate-950/90 transition-all active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Carousel Arrows (if multiple photos) */}
          {poi.photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/50 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-slate-950/80 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/50 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-slate-950/80 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Photo Indicator Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {poi.photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      activePhotoIdx === i ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Category Badge on Image */}
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-blue-500/80 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
              {poi.categoryLabel}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-bold tracking-tight text-white">{poi.name}</h2>
              {poi.verified && (
                <span title="Verified Place" className="inline-flex">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                </span>
              )}
            </div>

            {/* Rating, Price, Status Row */}
            <div className="mt-1.5 flex items-center gap-2 text-xs flex-wrap">
              <div className="flex items-center gap-1 font-semibold text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{poi.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({poi.reviewCount.toLocaleString()})</span>
              </div>
              <span className="text-slate-600">·</span>
              <span className="font-semibold text-slate-300">{poi.priceLevel}</span>
              <span className="text-slate-600">·</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  poi.isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>{poi.status}</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {/* Directions */}
            <button
              onClick={() => onGetDirections(poi)}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-95 group"
            >
              <Navigation className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="text-[11px] font-semibold">Route</span>
            </button>

            {/* Save / Bookmark */}
            <button
              onClick={() => onToggleSave(poi.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl p-2.5 transition-all active:scale-95 ${
                isSaved
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold'
                  : 'bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-amber-400' : ''}`} />
              <span className="text-[11px] font-semibold">{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white/10 p-2.5 text-slate-200 hover:bg-white/15 hover:text-white transition-all active:scale-95"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
              <span className="text-[11px] font-semibold">{copied ? 'Copied!' : 'Share'}</span>
            </button>

            {/* Call */}
            <a
              href={`tel:${poi.phone}`}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white/10 p-2.5 text-slate-200 hover:bg-white/15 hover:text-white transition-all active:scale-95"
            >
              <Phone className="h-4 w-4" />
              <span className="text-[11px] font-semibold">Call</span>
            </a>
          </div>

          {/* Description */}
          <p className="text-xs leading-relaxed text-slate-300">{poi.description}</p>

          {/* Amenities Badges */}
          {poi.amenities && poi.amenities.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Highlights & Amenities
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {poi.amenities.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location & Details Info list */}
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <span className="text-slate-300">{poi.address}</span>
            </div>
            {poi.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <a href={`tel:${poi.phone}`} className="text-blue-400 hover:underline">
                  {poi.phone}
                </a>
              </div>
            )}
            {poi.website && (
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                <a
                  href={poi.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline truncate"
                >
                  {poi.website.replace('https://', '')}
                </a>
              </div>
            )}
          </div>

          {/* Reviews Snippet */}
          {poi.reviews && poi.reviews.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Featured Reviews
                </h4>
                <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                  See all ({poi.reviewCount})
                </span>
              </div>
              <div className="space-y-2">
                {poi.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.avatar}
                          alt={rev.author}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-semibold text-white">{rev.author}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <div className="flex text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span>· {rev.date}</span>
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
