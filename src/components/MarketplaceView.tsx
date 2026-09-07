import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  Star,
  MapPin,
  Sparkles,
  ArrowUpDown,
  Carrot,
  Apple,
  Wheat,
  Flower2,
  Boxes,
  Truck,
  Plus,
  Check,
  SlidersHorizontal,
  Factory,
  Briefcase,
  Store,
  Globe,
  Sprout,
  Coffee,
  Sun,
  Flame,
  Milk,
  Beef,
  Package,
  Layers,
  Calendar,
  X,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Product, ProductCategory, ProductSubcategory } from '../types/index.ts';

interface MarketplaceViewProps {
  categories: ProductCategory[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  categories,
  onSelectProduct,
  onAddToCart,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<ProductSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedProductType, setSelectedProductType] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedFreshness, setSelectedFreshness] = useState<string>('all');
  const [selectedTargetBuyer, setSelectedTargetBuyer] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [organicOnly, setOrganicOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [liveAnimalOnly, setLiveAnimalOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'harvest_recent'>('recommended');
  const [addedItemMap, setAddedItemMap] = useState<{ [id: number]: boolean }>({});

  // Quick search keywords
  const popularKeywords = [
    'Magna Teff',
    'Yirgacheffe Coffee',
    'Kabuli Chickpeas',
    'Hass Avocado',
    'Red Kidney Beans',
    'White Honey',
    'Fresh Butter',
    'Live Highland Sheep',
    'Berbere Mix',
    'Shallot Onion',
  ];

  // Fetch Subcategories
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const res = await fetch('/api/subcategories');
        if (res.ok) {
          const data = await res.json();
          setSubcategories(data);
        }
      } catch (err) {
        console.error('Failed to load subcategories:', err);
      }
    };
    fetchSubcategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedSubcategory !== 'all') params.append('subcategory', selectedSubcategory);
      if (selectedProductType !== 'all') params.append('productType', selectedProductType);
      if (selectedGrade !== 'all') params.append('grade', selectedGrade);
      if (selectedRegion !== 'all') params.append('region', selectedRegion);
      if (selectedFreshness !== 'all') params.append('freshness', selectedFreshness);
      if (selectedTargetBuyer !== 'ALL') params.append('targetBuyer', selectedTargetBuyer);
      if (searchQuery) params.append('search', searchQuery);
      if (organicOnly) params.append('organic', 'true');
      if (verifiedOnly) params.append('verified', 'true');
      if (liveAnimalOnly) params.append('liveAnimal', 'true');
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedProductType,
    selectedGrade,
    selectedRegion,
    selectedFreshness,
    selectedTargetBuyer,
    organicOnly,
    verifiedOnly,
    liveAnimalOnly,
    sortBy,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleQuickAdd = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(p, p.minOrderQuantity || 1);
    setAddedItemMap((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [p.id]: false }));
    }, 1500);
  };

  const getCategoryIcon = (slugOrIcon?: string | null) => {
    const key = (slugOrIcon || '').toLowerCase();
    if (key.includes('grain') || key.includes('cereal') || key.includes('wheat')) return <Wheat className="h-4 w-4" />;
    if (key.includes('pulse') || key.includes('legume') || key.includes('bean') || key.includes('sprout')) return <Sprout className="h-4 w-4" />;
    if (key.includes('root') || key.includes('tuber') || key.includes('potato') || key.includes('carrot')) return <Carrot className="h-4 w-4" />;
    if (key.includes('vegetable')) return <Carrot className="h-4 w-4" />;
    if (key.includes('fruit') || key.includes('apple')) return <Apple className="h-4 w-4" />;
    if (key.includes('coffee') || key.includes('tea') || key.includes('spice')) return <Coffee className="h-4 w-4" />;
    if (key.includes('oilseed') || key.includes('sunflower')) return <Sun className="h-4 w-4" />;
    if (key.includes('honey') || key.includes('apiculture')) return <Flame className="h-4 w-4" />;
    if (key.includes('dairy') || key.includes('poultry') || key.includes('milk')) return <Milk className="h-4 w-4" />;
    if (key.includes('meat') || key.includes('livestock') || key.includes('beef')) return <Beef className="h-4 w-4" />;
    if (key.includes('feed') || key.includes('forage')) return <Wheat className="h-4 w-4" />;
    if (key.includes('flower') || key.includes('flori') || key.includes('herb')) return <Flower2 className="h-4 w-4" />;
    if (key.includes('process') || key.includes('pack')) return <Package className="h-4 w-4" />;
    return <Boxes className="h-4 w-4" />;
  };

  // Filter subcategories for currently active category
  const activeCatObject = categories.find((c) => c.slug === selectedCategory);
  const currentSubcategories = selectedCategory === 'all'
    ? subcategories
    : subcategories.filter((s) => s.categoryId === activeCatObject?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-zinc-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="h-4 w-4 text-emerald-400" /> Complete Agricultural Marketplace
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Source Certified Food & Agricultural Commodities
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
            Trade directly with verified Ethiopian farmers, commercial outgrower estates, and producer cooperatives across 13 major food & agricultural categories with batch traceability.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search Teff, Chickpeas, Roma Tomatoes, Yirgacheffe Coffee, Butter, Live Sheep..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/95 text-zinc-900 placeholder:text-zinc-500 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs sm:text-sm font-black shadow-lg cursor-pointer transition-all hover:scale-102 flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" /> Search Marketplace
            </button>
          </form>

          {/* Popular Tag Chips */}
          <div className="mt-4 flex items-center gap-1.5 flex-wrap text-xs text-emerald-200">
            <span className="font-bold text-emerald-400">Popular:</span>
            {popularKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => {
                  setSearchQuery(kw);
                  setSelectedCategory('all');
                  setSelectedSubcategory('all');
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-100 text-[11px] font-medium transition-colors cursor-pointer backdrop-blur-xs"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 13 Primary Food Categories Carousel */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Boxes className="h-3.5 w-3.5 text-emerald-700" /> Main Food & Agricultural Categories
          </span>
          <span className="text-xs text-zinc-500 font-semibold">{categories.length} Categories</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSubcategory('all');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-600'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <Boxes className="h-4 w-4" />
            <span>All Categories</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 ml-1">
              {products.length}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  setSelectedSubcategory('all');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-600'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
                }`}
              >
                {getCategoryIcon(cat.slug || cat.icon)}
                <span>{cat.name}</span>
                {cat.productCount !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isSelected ? 'bg-emerald-700 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                    {cat.productCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory Pills Slider (Dynamic based on selected category) */}
      {currentSubcategories.length > 0 && (
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-extrabold text-emerald-900 uppercase shrink-0 mr-1 flex items-center gap-1">
              <Layers className="h-3 w-3 text-emerald-700" /> Subcategories:
            </span>
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedSubcategory === 'all'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100/60'
              }`}
            >
              All {activeCatObject ? activeCatObject.name : 'Types'}
            </button>
            {currentSubcategories.map((sub) => {
              const isSubSelected = selectedSubcategory === sub.name || selectedSubcategory === sub.slug;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isSubSelected
                      ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                      : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Target Buyer Channel Classifier Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <span className="text-[11px] font-bold text-zinc-500 uppercase shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-emerald-700" /> Target Buyer Channel:
        </span>
        {[
          { id: 'ALL', label: 'All Channels', icon: Globe },
          { id: 'PROCESSOR', label: 'Food Processors & Mills', icon: Factory },
          { id: 'INVESTOR', label: 'Agri-Investors & Exporters', icon: Briefcase },
          { id: 'BUYER', label: 'Supermarkets & Urban Grocers', icon: Store },
        ].map((chan) => {
          const Icon = chan.icon;
          const isSelected = selectedTargetBuyer === chan.id;
          return (
            <button
              key={chan.id}
              onClick={() => setSelectedTargetBuyer(chan.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-950 text-white ring-1 ring-emerald-600 shadow-xs'
                  : 'bg-white border border-zinc-200/90 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`} />
              {chan.label}
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 text-xs text-zinc-500 font-black uppercase">
            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-700" /> Filters:
          </div>

          {/* Product Type Filter */}
          <select
            value={selectedProductType}
            onChange={(e) => setSelectedProductType(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Commodity Types</option>
            <option value="FRESH_FOOD">Fresh Food & Produce</option>
            <option value="GRAIN_CEREAL">Grains & Cereals</option>
            <option value="PULSE_LEGUME">Pulses & Legumes</option>
            <option value="ROOT_TUBER">Roots & Tubers</option>
            <option value="VEGETABLE">Vegetables</option>
            <option value="FRUIT">Fruits</option>
            <option value="COFFEE">Coffee (Export/Domestic)</option>
            <option value="SPICE_HERB">Spices & Herbs</option>
            <option value="OILSEED">Oilseeds</option>
            <option value="HONEY">Honey & Apiculture</option>
            <option value="DAIRY_POULTRY">Dairy & Poultry</option>
            <option value="LIVESTOCK_MEAT">Meat & Livestock</option>
            <option value="ANIMAL_FEED">Animal Feed & Forage</option>
            <option value="FLORICULTURE">Floriculture & Specialty</option>
            <option value="PROCESSED_FOOD">Processed & Packaged</option>
          </select>

          {/* Quality Grade Select */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Quality Grades</option>
            <option value="GRADE_1_EXPORT">Grade 1 Export Standard</option>
            <option value="GRADE_1_LOCAL">Grade 1 Local Standard</option>
            <option value="GRADE_2_COMMERCIAL">Grade 2 Commercial</option>
            <option value="PROCESSING_GRADE">Processing & Industrial Grade</option>
            <option value="PREMIUM">Premium Specialty</option>
          </select>

          {/* Region Select */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Origin Regions</option>
            <option value="Oromia">Oromia (Wonji, Ziway, Bale, Jimma, Nekemte)</option>
            <option value="Addis Ababa">Addis Ababa Wholesale Corridor</option>
            <option value="Sidama">Sidama (Hawassa, Yirgacheffe Basin)</option>
            <option value="Amhara">Amhara (Bahir Dar, Gojjam, Gondar)</option>
            <option value="SNNPR">SNNPR / South Ethiopia (Welayta, Chencha)</option>
            <option value="Tigray">Tigray (Mekelle, Raya Valley)</option>
            <option value="Somali">Somali (Jijiga, Gode)</option>
            <option value="Afar">Afar (Awash Basin)</option>
            <option value="Dire Dawa">Dire Dawa Trade Gateway</option>
          </select>

          {/* Freshness Status Filter */}
          <select
            value={selectedFreshness}
            onChange={(e) => setSelectedFreshness(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Availability Timelines</option>
            <option value="AVAILABLE_NOW">Available Now (In Stock)</option>
            <option value="FRESH_DAILY">Fresh Daily Dispatch</option>
            <option value="HARVESTING_NEXT_WEEK">Harvesting Next Week</option>
            <option value="PRE_ORDER">Pre-Order Harvest Batch</option>
            <option value="FORWARD_CONTRACT">Forward Offtake Contract</option>
          </select>

          {/* Checkboxes */}
          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 cursor-pointer bg-zinc-50 px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-100">
            <input
              type="checkbox"
              checked={organicOnly}
              onChange={(e) => setOrganicOnly(e.target.checked)}
              className="accent-emerald-700 h-3.5 w-3.5 rounded"
            />
            🌱 Organic
          </label>

          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 cursor-pointer bg-zinc-50 px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-100">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="accent-emerald-700 h-3.5 w-3.5 rounded"
            />
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified Producer
          </label>

          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 cursor-pointer bg-zinc-50 px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-100">
            <input
              type="checkbox"
              checked={liveAnimalOnly}
              onChange={(e) => setLiveAnimalOnly(e.target.checked)}
              className="accent-emerald-700 h-3.5 w-3.5 rounded"
            />
            🐄 Live Animal
          </label>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="recommended">Highest Quality Index</option>
            <option value="newest">Newest Listings</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Farmer Rating</option>
            <option value="harvest_recent">Recent Harvest Date</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-4 border border-zinc-200 animate-pulse space-y-3">
              <div className="h-44 bg-zinc-200 rounded-2xl"></div>
              <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
              <div className="h-3 bg-zinc-200 rounded w-1/2"></div>
              <div className="h-10 bg-zinc-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 p-8 shadow-2xs">
          <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <Boxes className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-black text-zinc-900">No matching agricultural produce found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            Try adjusting your search query, category selection, or filters to explore other verified harvests in the AgriLink database.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSubcategory('all');
              setSelectedProductType('all');
              setSelectedGrade('all');
              setSelectedRegion('all');
              setSelectedFreshness('all');
              setSelectedTargetBuyer('ALL');
              setSearchQuery('');
              setOrganicOnly(false);
              setVerifiedOnly(false);
              setLiveAnimalOnly(false);
            }}
            className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-xs hover:bg-emerald-800 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => {
            const img = p.images && p.images.length > 0
              ? p.images[0]
              : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';

            const isJustAdded = addedItemMap[p.id];

            return (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="group bg-white rounded-3xl border border-zinc-200/90 hover:border-emerald-500/80 shadow-2xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Image Section */}
                <div className="relative aspect-4/3 overflow-hidden bg-zinc-100">
                  <img
                    src={img}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/90 text-white shadow-xs backdrop-blur-xs border border-emerald-500/30">
                      {p.grade.replace(/_/g, ' ')}
                    </span>
                    {p.isOrganic && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white text-emerald-900 shadow-xs border border-emerald-200">
                        🌱 Organic Certified
                      </span>
                    )}
                    {p.isLiveAnimal && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white shadow-xs">
                        🐄 Live Animal
                      </span>
                    )}
                  </div>

                  {/* Freshness Badge */}
                  {p.freshnessStatus && p.freshnessStatus !== 'AVAILABLE_NOW' && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-900/80 text-white shadow-xs backdrop-blur-xs">
                      {p.freshnessStatus === 'FRESH_DAILY' && '⚡ Fresh Daily'}
                      {p.freshnessStatus === 'HARVESTING_NEXT_WEEK' && '⏳ Harvesting Next Week'}
                      {p.freshnessStatus === 'PRE_ORDER' && '📦 Pre-Order'}
                      {p.freshnessStatus === 'FORWARD_CONTRACT' && '📑 Forward Contract'}
                    </div>
                  )}

                  {/* Quality Score */}
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-black bg-white/95 text-zinc-900 shadow-xs flex items-center gap-1 border border-zinc-200">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                    <span>QC {p.qualityScore || 98}%</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category & Subcategory Header */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                      <span className="font-extrabold text-emerald-800 truncate max-w-[65%]">
                        {p.subcategory || p.categoryName}
                      </span>
                      <span className="font-mono text-zinc-400 text-[10px] shrink-0">
                        Lot #{p.lotBatchNumber.slice(-6)}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-black text-zinc-900 text-sm leading-snug line-clamp-1 group-hover:text-emerald-800 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                      {p.variety ? `Variety: ${p.variety}` : p.description}
                    </p>

                    {/* Target Buyer Channel Badge */}
                    {p.targetBuyerType && (
                      <div className="mt-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          p.targetBuyerType === 'PROCESSOR'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300/80'
                            : p.targetBuyerType === 'INVESTOR'
                            ? 'bg-purple-100 text-purple-900 border border-purple-300/80'
                            : p.targetBuyerType === 'BUYER'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300/80'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300/80'
                        }`}>
                          {p.targetBuyerType === 'PROCESSOR' && <Factory className="h-3 w-3 text-amber-700" />}
                          {p.targetBuyerType === 'INVESTOR' && <Briefcase className="h-3 w-3 text-purple-700" />}
                          {p.targetBuyerType === 'BUYER' && <Store className="h-3 w-3 text-blue-700" />}
                          {p.targetBuyerType === 'ALL' && <Globe className="h-3 w-3 text-emerald-700" />}
                          <span>
                            {p.targetBuyerType === 'PROCESSOR'
                              ? 'Food Processors'
                              : p.targetBuyerType === 'INVESTOR'
                              ? 'Investors / Exporters'
                              : p.targetBuyerType === 'BUYER'
                              ? 'Supermarket & Retail'
                              : 'All Buyers'}
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Location & Origin */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600 mt-3 pt-2.5 border-t border-zinc-100">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium">
                        {p.woreda ? `${p.woreda}, ${p.region}` : p.farmLocation || p.region}
                      </span>
                    </div>

                    {/* Farmer Name & Verification */}
                    <div className="flex items-center justify-between text-xs text-zinc-600 mt-1">
                      <span className="truncate font-semibold text-zinc-800">
                        {p.farmerName || 'Verified Producer'}
                      </span>
                      {(p.farmerVerified || p.isVerifiedFarmer) && (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Add to Cart Action */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                        Farmer Direct Price
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black text-emerald-950">
                          {p.pricePerUnitEtb.toLocaleString()} ETB
                        </span>
                        <span className="text-[11px] font-bold text-zinc-500">/{p.unit}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        Stock: {p.availableQuantity.toLocaleString()} {p.unit}s
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(p, e)}
                      className={`p-2.5 rounded-2xl font-black transition-all shadow-xs flex items-center justify-center cursor-pointer ${
                        isJustAdded
                          ? 'bg-emerald-800 text-white scale-105'
                          : 'bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white border border-emerald-200 hover:border-emerald-700'
                      }`}
                      title="Add to Cart"
                    >
                      {isJustAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
