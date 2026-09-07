import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  Layers,
  Award,
  Truck,
  Sparkles,
  Star,
  FileText,
  Building2,
  ChevronRight,
  Info,
  Clock,
  ArrowRight,
  Factory,
  Briefcase,
  Store,
  Globe,
  Sprout,
  Check,
  Plus,
  Minus,
  Mountain,
  Tag,
  Package,
  HeartHandshake,
} from 'lucide-react';
import { Product } from '../types/index.ts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onRequestQuote?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onRequestQuote,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState<number>(product?.minOrderQuantity || 1);
  const [activeTab, setActiveTab] = useState<'overview' | 'farmer' | 'quality' | 'reviews'>('overview');
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'];

  const effectiveQty = Math.max(product.minOrderQuantity || 1, quantity);
  const totalPrice = effectiveQty * product.pricePerUnitEtb;

  const handleAddToCartClick = () => {
    onAddToCart(product, effectiveQty);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleQtyChange = (val: number) => {
    const min = product.minOrderQuantity || 1;
    const max = product.availableQuantity || 999999;
    const clamped = Math.max(min, Math.min(max, val));
    setQuantity(clamped);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-zinc-200 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-100/90 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Product Gallery & Farmer Badge (Left Column) */}
          <div className="md:col-span-5 p-6 bg-zinc-50 border-r border-zinc-200 flex flex-col justify-between">
            <div>
              {/* Main Image */}
              <div className="aspect-4/3 rounded-2xl overflow-hidden bg-zinc-200 mb-3 border border-zinc-200 shadow-xs relative">
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950/90 text-white shadow-xs backdrop-blur-xs border border-emerald-500/30">
                  {product.grade.replace(/_/g, ' ')}
                </span>
                {product.isOrganic && (
                  <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-900 shadow-xs border border-emerald-300">
                    🌱 Certified Organic
                  </span>
                )}
                {product.isLiveAnimal && (
                  <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                    🐄 Live Stock
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-14 w-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        selectedImageIndex === idx ? 'border-emerald-600 scale-105 shadow-xs' : 'border-zinc-300 opacity-70'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Farmer Profile Card */}
            <div className="mt-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  {product.farmerName?.slice(0, 2).toUpperCase() || 'FA'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-zinc-900">{product.farmerName || 'Verified Producer'}</span>
                    {(product.farmerVerified || product.isVerifiedFarmer) && (
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    {product.farmName ? `${product.farmName} • ` : ''}{product.farmLocation || product.region}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-100 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                  <span className="text-zinc-400 block text-[10px]">Rating</span>
                  <span className="font-bold text-zinc-800 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-500" /> {product.farmerRating || 4.9} / 5.0
                  </span>
                </div>
                <div className="bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                  <span className="text-zinc-400 block text-[10px]">Completed Orders</span>
                  <span className="font-bold text-zinc-800">
                    {product.farmerCompletedOrders || 120}+ Deliveries
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info & Procurement Actions (Right Column) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category Breadcrumbs & Lot */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                  <span className="bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {product.categoryName}
                  </span>
                  {product.subcategory && (
                    <>
                      <ChevronRight className="h-3 w-3 text-zinc-400" />
                      <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md font-semibold">
                        {product.subcategory}
                      </span>
                    </>
                  )}
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">Lot #{product.lotBatchNumber}</span>
              </div>

              {/* Title & Variety */}
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 leading-tight">
                {product.name}
              </h2>
              {product.variety && (
                <p className="text-xs text-zinc-500 mt-1 font-semibold">
                  Botanical / Agricultural Variety: <span className="text-zinc-800 font-bold">{product.variety}</span>
                </p>
              )}

              {/* Target Buyer Channel Tag */}
              {product.targetBuyerType && (
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                    product.targetBuyerType === 'PROCESSOR'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : product.targetBuyerType === 'INVESTOR'
                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                      : product.targetBuyerType === 'BUYER'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {product.targetBuyerType === 'PROCESSOR' && <Factory className="h-3.5 w-3.5" />}
                    {product.targetBuyerType === 'INVESTOR' && <Briefcase className="h-3.5 w-3.5" />}
                    {product.targetBuyerType === 'BUYER' && <Store className="h-3.5 w-3.5" />}
                    {product.targetBuyerType === 'ALL' && <Globe className="h-3.5 w-3.5" />}
                    <span>
                      {product.targetBuyerType === 'PROCESSOR'
                        ? 'Optimized for Food Processors, Canneries & Mills'
                        : product.targetBuyerType === 'INVESTOR'
                        ? 'Optimized for Agri-Investors & Exporters'
                        : product.targetBuyerType === 'BUYER'
                        ? 'Optimized for Supermarkets, Hotels & Retail Grocers'
                        : 'Open to All Commercial & Private Buyers'}
                    </span>
                  </span>
                </div>
              )}

              {/* Price & Available Stock Block */}
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-emerald-900 font-bold uppercase tracking-wider block">
                    Direct Marketplace Price
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-3xl font-black text-emerald-950">
                      {product.pricePerUnitEtb.toLocaleString()} ETB
                    </span>
                    <span className="text-sm font-bold text-emerald-800">/ {product.unit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-emerald-900 font-bold uppercase tracking-wider block">
                    Available Stock
                  </span>
                  <span className="text-base font-black text-zinc-900">
                    {product.availableQuantity.toLocaleString()} {product.unit}s
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    Min Order: {product.minOrderQuantity || 1} {product.unit}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-zinc-200 mt-6 mb-4 gap-6 text-xs font-bold">
                {[
                  { id: 'overview', label: 'Specifications & Origin' },
                  { id: 'farmer', label: 'Farmer & Land Bio' },
                  { id: 'quality', label: 'Quality & QC Lab' },
                  { id: 'reviews', label: `Reviews (${product.reviews?.length || 3})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-2.5 transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-b-2 border-emerald-700 text-emerald-950 font-black'
                        : 'text-zinc-400 hover:text-zinc-700 font-medium'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="text-xs text-zinc-600 min-h-[140px]">
                {activeTab === 'overview' && (
                  <div className="space-y-3">
                    <p className="text-zinc-700 leading-relaxed font-medium">
                      {product.description}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                      <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                        <span className="text-zinc-400 text-[10px] block">Freshness Status</span>
                        <span className="font-bold text-zinc-800">
                          {product.freshnessStatus ? product.freshnessStatus.replace(/_/g, ' ') : 'Available Now'}
                        </span>
                      </div>
                      <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                        <span className="text-zinc-400 text-[10px] block">Harvest Date</span>
                        <span className="font-bold text-zinc-800">{product.harvestDate}</span>
                      </div>
                      <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                        <span className="text-zinc-400 text-[10px] block">Shelf Life</span>
                        <span className="font-bold text-zinc-800">{product.shelfLifeDays || 14} Days</span>
                      </div>
                      <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                        <span className="text-zinc-400 text-[10px] block">Region & Zone</span>
                        <span className="font-bold text-zinc-800">
                          {product.zone ? `${product.zone}, ${product.region}` : product.region}
                        </span>
                      </div>
                      <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                        <span className="text-zinc-400 text-[10px] block">Altitude</span>
                        <span className="font-bold text-zinc-800">
                          {product.altitudeMeters ? `${product.altitudeMeters}m MASL` : '1,850m Highland'}
                        </span>
                      </div>
                      <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                        <span className="text-zinc-400 text-[10px] block">Packaging</span>
                        <span className="font-bold text-zinc-800">{product.packagingType || 'Ventilated Food Grade Sacks'}</span>
                      </div>
                    </div>

                    {product.ingredients && (
                      <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                        <span className="font-bold block text-[10px] uppercase">Ingredients / Blend Formula:</span>
                        <span className="font-medium">{product.ingredients}</span>
                      </div>
                    )}

                    {product.isLiveAnimal && product.animalBreed && (
                      <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                        <span className="font-bold block text-[10px] uppercase">Animal Breed & Health:</span>
                        <span className="font-medium">{product.animalBreed} • {product.veterinaryCertificate || 'Veterinary Health Inspection Passed'}</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'farmer' && (
                  <div className="space-y-3">
                    <p className="text-zinc-700 font-medium leading-relaxed">
                      {product.farmerBio || 'Dedicated commercial farmer and cooperative member in the AgriLink certified producer network.'}
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                        <span className="text-zinc-400 text-[10px] block">Farming Experience</span>
                        <span className="font-bold text-zinc-800">{product.farmerExperienceYears || 12} Years</span>
                      </div>
                      <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                        <span className="text-zinc-400 text-[10px] block">Soil Profile</span>
                        <span className="font-bold text-zinc-800">{product.farmSoil || 'Rich Volcanic Clay Loam'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'quality' && (
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-emerald-700" />
                        <div>
                          <span className="font-bold block text-xs">Quality Index: {product.qualityScore || 98}%</span>
                          <span className="text-[10px] text-emerald-800">Verified by AgriLink Regional Hub Inspectors</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-800 text-white font-black text-[10px]">
                        PASSED GRADE A
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                      <span className="text-zinc-400 text-[10px] uppercase font-bold block mb-1">Active Certifications</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(product.certifications || ['Traceable Ethiopian Origin', 'Verified Farmer Inspection']).map((c, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-700 font-semibold text-[10px]">
                            ✓ {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-2.5">
                    {(product.reviews && product.reviews.length > 0 ? product.reviews : [
                      {
                        reviewerName: 'Alemayehu Tadesse (Bole Grocers)',
                        rating: 5,
                        comment: 'Outstanding quality and clean packaging. Delivered within 24 hours via AgriLink direct dispatch.',
                        createdAt: '2 days ago',
                      },
                      {
                        reviewerName: 'Tigist Haile (Addis Food Processor)',
                        rating: 5,
                        comment: 'Uniform batch, consistent moisture, and highly professional seller communication.',
                        createdAt: '1 week ago',
                      },
                    ]).map((rev: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-zinc-900">{rev.reviewerName}</span>
                          <div className="flex items-center text-amber-500">
                            {[...Array(rev.rating || 5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-500" />
                            ))}
                          </div>
                        </div>
                        <p className="text-zinc-600 text-xs">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector, Total & Actions Footer */}
            <div className="mt-6 pt-4 border-t border-zinc-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-600">Order Quantity:</span>
                  <div className="flex items-center border border-zinc-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <button
                      onClick={() => handleQtyChange(effectiveQty - (product.minOrderQuantity || 1))}
                      className="p-2 hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={effectiveQty}
                      onChange={(e) => handleQtyChange(Number(e.target.value))}
                      className="w-16 text-center text-xs font-black text-zinc-900 focus:outline-none"
                    />
                    <button
                      onClick={() => handleQtyChange(effectiveQty + (product.minOrderQuantity || 1))}
                      className="p-2 hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs font-bold text-zinc-500">{product.unit}s</span>
                </div>

                {/* Subtotal & Action */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase block">Estimated Subtotal</span>
                    <span className="text-lg font-black text-emerald-950">
                      {totalPrice.toLocaleString()} ETB
                    </span>
                  </div>

                  <button
                    onClick={handleAddToCartClick}
                    disabled={addedSuccess}
                    className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all ${
                      addedSuccess
                        ? 'bg-emerald-800 text-white scale-102'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-lg'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="h-4 w-4" /> Added to Order!
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Add to Order Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
