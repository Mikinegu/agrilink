import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Check,
  Package,
  Layers,
  MapPin,
  ExternalLink,
  X,
  Plus,
  TrendingUp,
  ShieldCheck,
  Sprout,
  Image as ImageIcon,
} from 'lucide-react';
import { matchProduceVisual, COMMODITY_CATALOG, ProduceMatchResult } from '../utils/aiProduceImageMatcher.ts';

interface AIProduceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduce?: (produce: ProduceMatchResult, selectedImageUrl: string) => void;
}

export const AIProduceAssistantModal: React.FC<AIProduceAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectProduce,
}) => {
  const [searchQuery, setSearchQuery] = useState('White Teff');
  const [selectedProduce, setSelectedProduce] = useState<ProduceMatchResult>(() => matchProduceVisual('White Teff'));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!isOpen) return null;

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    const result = matchProduceVisual(q);
    setSelectedProduce(result);
    setSelectedImageIndex(0);
  };

  const currentImg = selectedProduce.images[selectedImageIndex] || selectedProduce.images[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-zinc-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-zinc-950 via-emerald-950 to-zinc-900 p-5 sm:p-6 text-white border-b border-emerald-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-500 p-0.5 shadow-md shrink-0">
                <div className="h-full w-full rounded-2xl bg-zinc-950 flex items-center justify-center text-amber-300">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                    AgriLink AI Produce Visual Assistant
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                    ALL CROPS SUPPORTED
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Automated crop image resolver &amp; ECX grading intelligence for non-smartphone farmers &amp; operators
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold shrink-0"
            >
              ✕
            </button>
          </div>

          {/* Produce Search Input */}
          <div className="mt-4 relative z-10">
            <div className="relative">
              <Search className="h-4 w-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search or enter ANY produce: Teff, Coffee, Chickpeas, Garlic, Potatoes, Avocado, Wheat, Maize..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-zinc-900 border border-white/20 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-zinc-400"
              />
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {[
                { label: '🌾 White Magna Teff', q: 'White Magna Teff' },
                { label: '☕ Yirgacheffe Coffee', q: 'Yirgacheffe Coffee' },
                { label: '🧄 Chencha Garlic', q: 'Chencha Garlic' },
                { label: '🥔 Shashemene Potatoes', q: 'Shashemene Potatoes' },
                { label: '🥑 Export Hass Avocado', q: 'Hass Avocado' },
                { label: '🌾 Durum Wheat', q: 'Durum Wheat' },
                { label: '🫘 Kabuli Chickpeas', q: 'Kabuli Chickpeas' },
                { label: '🧅 Red Onions', q: 'Bombay Red Onions' },
                { label: '🍅 Roma Tomatoes', q: 'Roma Tomatoes' },
                { label: '🌶️ Mareko Berbere', q: 'Mareko Red Berbere' },
                { label: '🍯 Tigray White Honey', q: 'White Honey' },
                { label: '🌱 Humera Sesame', q: 'Humera White Sesame' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSearch(chip.q)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                    searchQuery === chip.q
                      ? 'bg-amber-400 text-zinc-950 font-black shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Inspection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: High-Res Photo Spotlight & Alternate Gallery */}
            <div className="md:col-span-6 space-y-3">
              <div className="relative rounded-3xl overflow-hidden border border-zinc-200 shadow-md bg-zinc-950 aspect-4/3">
                <img
                  src={currentImg?.url}
                  alt={currentImg?.caption}
                  className="w-full h-full object-cover animate-in fade-in duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-black text-[9px] uppercase">
                      Verified Authentic Photography
                    </span>
                    <span className="text-[10px] text-zinc-300 font-mono">
                      Photo #{selectedImageIndex + 1} of {selectedProduce.images.length}
                    </span>
                  </div>
                  <p className="text-xs text-white font-bold leading-tight">
                    {currentImg?.caption}
                  </p>
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div>
                <span className="text-[10px] font-bold text-zinc-400 block mb-1.5 uppercase">
                  Available Verified Photographic Angles:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {selectedProduce.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-102 shadow-sm'
                          : 'border-zinc-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.caption} className="h-16 w-full object-cover" />
                      {selectedImageIndex === idx && (
                        <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[9px]">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: AI Commodity Specifications & Market Metrics */}
            <div className="md:col-span-6 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    {selectedProduce.categoryName}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    AI Confidence: {selectedProduce.confidenceScore}%
                  </span>
                </div>
                <h3 className="text-xl font-black text-zinc-900 mt-1">
                  {selectedProduce.nameEn}
                </h3>
                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5 font-medium">
                  <span>{selectedProduce.nameAm}</span>
                  <span>&bull;</span>
                  <span className="italic">{selectedProduce.nameOm}</span>
                </div>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  {selectedProduce.description}
                </p>
              </div>

              {/* Benchmark Pricing Box */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-bold">ECX Benchmark Price:</span>
                  <span className="text-lg font-black font-mono text-emerald-700">
                    {selectedProduce.benchmarkPriceEtb.toLocaleString()} ETB / {selectedProduce.standardUnit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Market Corridor Range:</span>
                  <span className="font-mono font-semibold text-zinc-800">
                    {selectedProduce.priceRange.min.toLocaleString()} - {selectedProduce.priceRange.max.toLocaleString()} ETB
                  </span>
                </div>
              </div>

              {/* Quality & Origin Specs Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white border border-zinc-200">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">Quality Grade</span>
                  <span className="font-bold text-zinc-900 mt-0.5 block">{selectedProduce.gradeLabel}</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-zinc-200">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">Standard Packaging</span>
                  <span className="font-medium text-zinc-800 mt-0.5 block">{selectedProduce.packagingType}</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-zinc-200">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">Shelf Life</span>
                  <span className="font-medium text-zinc-800 mt-0.5 block">{selectedProduce.shelfLifeDays} Days</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-zinc-200">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">Major Growing Corridors</span>
                  <span className="font-medium text-zinc-800 mt-0.5 block line-clamp-1">
                    {selectedProduce.originRegions.join(', ')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectProduce) {
                      onSelectProduce(selectedProduce, currentImg?.url);
                    }
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-101"
                >
                  <Plus className="h-4 w-4" />
                  <span>Use This Produce &amp; Photo for Listing</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
