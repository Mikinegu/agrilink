import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  ShieldCheck,
  Plus,
  Truck,
  Check,
  Layers,
  Award,
  Zap,
  Droplets,
  Package,
} from 'lucide-react';
import { InputProduct, InputCategory } from '../types/index.ts';

interface InputMarketplaceViewProps {
  onAddToCart: (item: any, quantity: number) => void;
}

export const InputMarketplaceView: React.FC<InputMarketplaceViewProps> = ({
  onAddToCart,
}) => {
  const [inputs, setInputs] = useState<InputProduct[]>([]);
  const [categories, setCategories] = useState<InputCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedMap, setAddedMap] = useState<{ [id: number]: boolean }>({});
  const [showNewInputModal, setShowNewInputModal] = useState(false);

  // New Input Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [priceEtb, setPriceEtb] = useState('3200');
  const [unit, setUnit] = useState('BAG');
  const [stockQuantity, setStockQuantity] = useState('100');
  const [specifications, setSpecifications] = useState('Certified germination > 95%');
  const [applicationGuide, setApplicationGuide] = useState('Apply 200kg per hectare at early planting');

  const fetchInputs = async () => {
    setLoading(true);
    try {
      const [inRes, catRes] = await Promise.all([
        fetch(`/api/inputs${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`),
        fetch('/api/input-categories'),
      ]);

      if (inRes.ok) {
        const inData = await inRes.json();
        setInputs(inData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (err) {
      console.error('Failed to load inputs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInputs();
  }, [selectedCategory]);

  const handleAddInput = (item: InputProduct) => {
    onAddToCart({ ...item, itemType: 'INPUT' }, item.minOrderQuantity || 1);
    setAddedMap((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const handleCreateInput = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inputs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          brand,
          categoryId: Number(categoryId),
          priceEtb: Number(priceEtb),
          unit,
          stockQuantity: Number(stockQuantity),
          specifications,
          applicationGuide,
        }),
      });
      if (res.ok) {
        setShowNewInputModal(false);
        fetchInputs();
      }
    } catch (err) {
      console.error('Error creating input:', err);
    }
  };

  const filteredInputs = inputs.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-emerald-950 to-zinc-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="h-4 w-4" /> Certified Agricultural Inputs & Technology
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Seeds, Fertilizers, Solar Irrigation & Protection
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-2xl">
              Equip your farming parcels with tested hybrid seeds, Ethiopian MoA-registered fertilizers, and climate-smart drip technology delivered to farm gate.
            </p>
          </div>

          <button
            onClick={() => setShowNewInputModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Input Product (Supplier)
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-amber-900 text-white shadow-sm'
              : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          All Certified Inputs
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedCategory === cat.slug
                ? 'bg-amber-900 text-white shadow-sm'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs mb-8 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search hybrid seeds, NPSB fertilizers, solar pumps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
        <span className="text-xs text-zinc-500 font-semibold">{filteredInputs.length} certified supplies available</span>
      </div>

      {/* Inputs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-zinc-200 animate-pulse h-64"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInputs.map((item) => {
            const isAdded = addedMap[item.id];
            const img = item.images?.[0] || 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-zinc-200 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-zinc-100">
                  <img src={img} alt={item.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-900/90 text-amber-200">
                    {item.brand}
                  </span>
                  {item.isCertified && (
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-emerald-800 shadow-xs flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" /> MoA Approved
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-800">{item.categoryName}</span>
                    <h3 className="font-bold text-zinc-900 text-sm leading-snug mt-0.5">{item.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{item.description}</p>
                    {item.specifications && (
                      <p className="text-[11px] text-zinc-600 font-mono bg-zinc-50 p-2 rounded-lg border border-zinc-100 mt-2">
                        {item.specifications}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-bold">Supplier Rate</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black text-zinc-900">{item.priceEtb.toLocaleString()} ETB</span>
                        <span className="text-[10px] text-zinc-400">/{item.unit}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddInput(item)}
                      className={`p-2.5 rounded-xl font-bold transition-all shadow-xs cursor-pointer ${
                        isAdded
                          ? 'bg-amber-800 text-white'
                          : 'bg-amber-50 hover:bg-amber-700 text-amber-900 hover:text-white border border-amber-200 hover:border-amber-700'
                      }`}
                      title="Add to Farm Order"
                    >
                      {isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Input Product */}
      {showNewInputModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200">
            <h3 className="text-lg font-black text-zinc-900 mb-1">Add Certified Agricultural Input</h3>
            <p className="text-xs text-zinc-500 mb-4">List input products with official MoA specs</p>

            <form onSubmit={handleCreateInput} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hybrid Tomato Seed F1 (Zara Star)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Manufacturer Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ethiopian Seed Enterprise"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-amber-600"
                  >
                    <option value="1">Certified Crop Seeds</option>
                    <option value="2">Soil Nutrients & Fertilizers</option>
                    <option value="3">Solar & Drip Irrigation</option>
                    <option value="4">Eco Crop Protection</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Price (ETB)</label>
                  <input
                    type="number"
                    required
                    value={priceEtb}
                    onChange={(e) => setPriceEtb(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-amber-600"
                  >
                    <option value="BAG">BAG (50kg)</option>
                    <option value="TIN">TIN (100g)</option>
                    <option value="LITER">LITER</option>
                    <option value="SET">SET</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewInputModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-zinc-100 font-bold text-xs text-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-800 font-bold text-xs text-white cursor-pointer"
                >
                  Publish Input
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
