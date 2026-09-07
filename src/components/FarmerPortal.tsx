import React, { useState, useEffect } from 'react';
import farmTractorSunrise from '../assets/images/farm_tractor_sunrise_1787815703199.jpg';
import farmTractorIrrigation from '../assets/images/farm_tractor_irrigation_1787815687313.jpg';
import ethiopiaGreenhouseFarm from '../assets/images/ethiopia_greenhouse_farm_1787814574646.jpg';
import {
  Sprout,
  Plus,
  Layers,
  MapPin,
  TrendingUp,
  Award,
  DollarSign,
  Package,
  Calendar,
  CheckCircle2,
  Droplets,
  ShieldCheck,
  FileText,
  Clock,
  Sparkles,
  ArrowUpRight,
  Landmark,
  Phone,
  Factory,
  Briefcase,
  Store,
  Globe,
  Tractor,
  Edit2,
  Check,
  X,
  AlertCircle,
  Truck,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { User, Farm, FarmField, Product, FinanceApplication, TargetBuyerType, ProductCategory, ProductSubcategory } from '../types/index.ts';

interface FarmerPortalProps {
  currentUser: User | null;
  onRefreshData: () => void;
  onNavigateToFinance: () => void;
  onOpenUSSD?: () => void;
}

export const FarmerPortal: React.FC<FarmerPortalProps> = ({
  currentUser,
  onRefreshData,
  onNavigateToFinance,
  onOpenUSSD,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'fields' | 'listings' | 'sales' | 'finance'>('overview');
  const [farmsList, setFarmsList] = useState<Farm[]>([]);
  const [fieldsList, setFieldsList] = useState<FarmField[]>([]);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [mySales, setMySales] = useState<any[]>([]);
  const [myLoans, setMyLoans] = useState<FinanceApplication[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ProductSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Inline edit state for active listings
  const [editingProdId, setEditingProdId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editQty, setEditQty] = useState<string>('');

  // New Field Form State
  const [showNewFieldModal, setShowNewFieldModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldCrop, setNewFieldCrop] = useState('White Teff (Magna)');
  const [newFieldArea, setNewFieldArea] = useState('2.5');
  const [newFieldHarvestDate, setNewFieldHarvestDate] = useState('2026-10-15');

  // New Listing Form State (Comprehensive Agricultural Product Form)
  const [showNewListingModal, setShowNewListingModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('1');
  const [newProdSubcategory, setNewProdSubcategory] = useState('');
  const [newProdType, setNewProdType] = useState('GRAIN_CEREAL');
  const [newProdVariety, setNewProdVariety] = useState('');
  const [newProdGrade, setNewProdGrade] = useState('GRADE_1_EXPORT');
  const [newProdPrice, setNewProdPrice] = useState('85');
  const [newProdUnit, setNewProdUnit] = useState('KG');
  const [newProdQty, setNewProdQty] = useState('2000');
  const [newProdMinQty, setNewProdMinQty] = useState('50');
  const [newProdFreshness, setNewProdFreshness] = useState('AVAILABLE_NOW');
  const [newProdHarvestDate, setNewProdHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [newProdPackaging, setNewProdPackaging] = useState('Ventilated Sacks');
  const [newProdZone, setNewProdZone] = useState('East Shewa');
  const [newProdWoreda, setNewProdWoreda] = useState('Ada\'a / Bishoftu');
  const [newProdAltitude, setNewProdAltitude] = useState('1900');
  const [newProdIsOrganic, setNewProdIsOrganic] = useState(false);
  const [newProdIsLiveAnimal, setNewProdIsLiveAnimal] = useState(false);
  const [newProdAnimalBreed, setNewProdAnimalBreed] = useState('');
  const [newProdIngredients, setNewProdIngredients] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdTargetBuyer, setNewProdTargetBuyer] = useState<TargetBuyerType>('ALL');

  const loadFarmerData = async () => {
    setLoading(true);
    try {
      if (currentUser) {
        const res = await fetch(`/api/farmers/${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setFarmsList(data.farms || []);
          const allFields = (data.farms || []).flatMap((f: any) => f.fields || []);
          setFieldsList(allFields);
          setMyProducts(data.products || []);
        }

        const ordersRes = await fetch(`/api/orders?role=FARMER`);
        if (ordersRes.ok) {
          const ords = await ordersRes.json();
          setMySales(ords);
        }

        const loansRes = await fetch(`/api/finance/applications`);
        if (loansRes.ok) {
          const lns = await loansRes.json();
          setMyLoans(lns.filter((l: any) => l.farmerId === currentUser.id));
        }

        // Fetch categories & subcategories
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          setCategories(await catRes.json());
        }
        const subRes = await fetch('/api/subcategories');
        if (subRes.ok) {
          setSubcategories(await subRes.json());
        }
      }
    } catch (err) {
      console.error('Failed to load farmer portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarmerData();
  }, [currentUser]);

  const showFeedback = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmsList.length) return;
    try {
      const res = await fetch(`/api/farms/${farmsList[0].id}/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldName: newFieldName,
          currentCrop: newFieldCrop,
          areaHectares: Number(newFieldArea),
          expectedHarvestDate: newFieldHarvestDate,
        }),
      });
      if (res.ok) {
        setShowNewFieldModal(false);
        setNewFieldName('');
        showFeedback('Field plot registered with IoT telemetry tracking.');
        loadFarmerData();
      }
    } catch (err) {
      console.error('Error creating field:', err);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedCatObj = categories.find((c) => String(c.id) === String(newProdCategory));

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName,
          categoryId: Number(newProdCategory),
          subcategory: newProdSubcategory || undefined,
          productType: newProdType,
          variety: newProdVariety || undefined,
          grade: newProdGrade,
          qualityGrade: newProdGrade,
          pricePerUnitEtb: Number(newProdPrice),
          unit: newProdUnit,
          availableQuantity: Number(newProdQty),
          minOrderQuantity: Number(newProdMinQty),
          freshnessStatus: newProdFreshness,
          harvestDate: newProdHarvestDate,
          packagingType: newProdPackaging,
          description: newProdDesc || `Certified harvest of ${newProdName} from ${newProdWoreda || 'Oromia'}.`,
          farmLocation: farmsList[0]?.locationName || 'Wonji Horizon Estate',
          region: currentUser?.region || 'Oromia',
          zone: newProdZone || undefined,
          woreda: newProdWoreda || undefined,
          altitudeMeters: newProdAltitude ? Number(newProdAltitude) : 1900,
          farmId: farmsList[0]?.id || null,
          targetBuyerType: newProdTargetBuyer,
          isOrganic: newProdIsOrganic,
          isLiveAnimal: newProdIsLiveAnimal,
          animalBreed: newProdIsLiveAnimal ? newProdAnimalBreed : undefined,
          ingredients: newProdIngredients || undefined,
        }),
      });
      if (res.ok) {
        setShowNewListingModal(false);
        setNewProdName('');
        setNewProdDesc('');
        setNewProdVariety('');
        showFeedback('New agricultural product published to the marketplace!');
        loadFarmerData();
        onRefreshData();
      }
    } catch (err) {
      console.error('Error creating listing:', err);
    }
  };

  const handleSaveInlineEdit = async (prodId: number) => {
    try {
      const payload: any = {};
      if (editPrice) payload.pricePerUnitEtb = Number(editPrice);
      if (editQty) {
        payload.availableQuantity = Number(editQty);
        payload.status = Number(editQty) <= 0 ? 'OUT_OF_STOCK' : 'ACTIVE';
      }

      const res = await fetch(`/api/products/${prodId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditingProdId(null);
        showFeedback('Listing price and inventory updated.');
        loadFarmerData();
        onRefreshData();
      }
    } catch (err) {
      console.error('Failed to update product inline:', err);
    }
  };

  const totalRevenue = mySales.reduce((acc, curr) => acc + (curr.totalAmountEtb || 0), 0);

  // Filter subcategories for the selected category in the listing modal
  const modalSubcategories = subcategories.filter(
    (s) => String(s.categoryId) === String(newProdCategory)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-emerald-100 border border-emerald-500 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-xs font-bold">{actionMessage}</span>
        </div>
      )}

      {/* Farmer Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-zinc-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
              alt={currentUser?.fullName}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">{currentUser?.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Verified Producer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200 mt-0.5">
                {farmsList[0]?.name || 'Wonji Horizon Agro-Farm'} • {currentUser?.region || 'Oromia Region'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-emerald-300">
                <span>Total Managed Land: <strong className="text-white">14.5 Hectares</strong></span>
                <span>•</span>
                <span>Active Field Plots: <strong className="text-white">{fieldsList.length || 3}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowNewListingModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-black shadow-sm flex items-center gap-2 cursor-pointer transition-transform hover:scale-102"
            >
              <Plus className="h-4 w-4" /> List Produce for Sale
            </button>
            <button
              onClick={() => setShowNewFieldModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-xs border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <Layers className="h-4 w-4" /> Add Digital Field
            </button>
            {onOpenUSSD && (
              <button
                onClick={onOpenUSSD}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-black shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Phone className="h-4 w-4" /> *988# USSD
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-zinc-200 mb-8 overflow-x-auto scrollbar-none gap-2">
        {[
          { id: 'overview', label: 'Farm Overview' },
          { id: 'fields', label: `Digital Fields (${fieldsList.length})` },
          { id: 'listings', label: `Active Produce Listings (${myProducts.length})` },
          { id: 'sales', label: `Verified Sales Ledger (${mySales.length})` },
          { id: 'finance', label: `Agri-Credit & Loans (${myLoans.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'border-b-2 border-emerald-700 text-emerald-950'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
              <span className="text-xs font-bold text-zinc-500 uppercase block">Total Sales Revenue</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-emerald-950">{totalRevenue.toLocaleString()} ETB</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold mt-1 block flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Audited on-chain ledger
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
              <span className="text-xs font-bold text-zinc-500 uppercase block">Active Listings</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-zinc-900">{myProducts.length}</span>
                <span className="text-xs text-zinc-500 font-medium">Lots</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium mt-1 block">
                Across {new Set(myProducts.map(p => p.categoryId)).size} Categories
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
              <span className="text-xs font-bold text-zinc-500 uppercase block">Credit Score Index</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-emerald-700">742</span>
                <span className="text-xs text-zinc-400 font-medium">/ 850 (Prime)</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                Pre-approved for 250,000 ETB
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
              <span className="text-xs font-bold text-zinc-500 uppercase block">IoT Soil Moisture</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-blue-700">42.8%</span>
                <span className="text-xs text-zinc-500 font-medium">Optimal</span>
              </div>
              <span className="text-[10px] text-blue-700 font-bold mt-1 block flex items-center gap-1">
                <Droplets className="h-3 w-3" /> Telemetry active
              </span>
            </div>
          </div>

          {/* Farm Imagery Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative rounded-2xl overflow-hidden h-44 border border-zinc-200 shadow-xs">
              <img src={farmTractorSunrise} alt="Farm Sunrise" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-xs font-black">Wonji Main Estate</span>
                <span className="text-[10px] text-zinc-300">Irrigated Grain & Vegetable Fields</span>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-44 border border-zinc-200 shadow-xs">
              <img src={farmTractorIrrigation} alt="Irrigation" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-xs font-black">Drip Irrigation Infrastructure</span>
                <span className="text-[10px] text-zinc-300">Automated Smart Pivot Systems</span>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-44 border border-zinc-200 shadow-xs">
              <img src={ethiopiaGreenhouseFarm} alt="Greenhouse" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-xs font-black">Commercial Cold-Chain Packhouse</span>
                <span className="text-[10px] text-zinc-300">Grade 1 Sorting & Packaging Hub</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fields Tab */}
      {activeSubTab === 'fields' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Digital Farm Fields</h3>
              <p className="text-xs text-zinc-500">Manage crop varieties, soil moisture telemetry, and harvest schedules</p>
            </div>
            <button
              onClick={() => setShowNewFieldModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Field Plot
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fieldsList.map((field) => (
              <div key={field.id} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700">Parcel #{field.id}</span>
                    <h4 className="font-bold text-sm text-zinc-900">{field.fieldName}</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900">
                    {field.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-zinc-600 bg-zinc-50 p-3.5 rounded-xl border border-zinc-100">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Current Crop:</span>
                    <span className="font-bold text-zinc-900">{field.currentCrop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Variety:</span>
                    <span className="font-medium text-zinc-800">{field.variety || 'Standard High-Yield'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Parcel Area:</span>
                    <span className="font-bold text-zinc-900">{field.areaHectares} Hectares</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Expected Harvest:</span>
                    <span className="font-extrabold text-emerald-800">{field.expectedHarvestDate || '2026-09-15'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="flex items-center gap-1 font-bold text-emerald-700">
                    <Droplets className="h-4 w-4" /> Soil Moisture {field.soilMoisturePercent || 42}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 font-bold text-zinc-800">
                    Health Index {field.healthScore || 95}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Listings Tab */}
      {activeSubTab === 'listings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Active Produce for Sale</h3>
              <p className="text-xs text-zinc-500">Manage real-time inventory, pricing in ETB, and lot batch traceability</p>
            </div>
            <button
              onClick={() => setShowNewListingModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Create New Listing
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase font-bold">
                  <tr>
                    <th className="p-4">Crop Name & Lot</th>
                    <th className="p-4">Category & Subcategory</th>
                    <th className="p-4">Grade</th>
                    <th className="p-4">Price / Unit</th>
                    <th className="p-4">Available Qty</th>
                    <th className="p-4">Harvest Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {myProducts.map((p) => {
                    const isEditing = editingProdId === p.id;

                    return (
                      <tr key={p.id} className="hover:bg-zinc-50/80">
                        <td className="p-4">
                          <div className="font-bold text-zinc-900">{p.name}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">Lot #{p.lotBatchNumber}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-emerald-900 block">{p.categoryName || 'Category'}</span>
                          <span className="text-[10px] text-zinc-500">{p.subcategory || 'Standard'}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {p.grade.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="w-20 px-2 py-1 border border-emerald-500 rounded text-xs font-bold"
                              />
                              <span className="text-zinc-500">ETB</span>
                            </div>
                          ) : (
                            <div className="font-black text-zinc-900">
                              {p.pricePerUnitEtb.toLocaleString()} ETB <span className="text-zinc-400 font-normal">/{p.unit}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={editQty}
                                onChange={(e) => setEditQty(e.target.value)}
                                className="w-20 px-2 py-1 border border-emerald-500 rounded text-xs font-bold"
                              />
                              <span className="text-zinc-500">{p.unit}</span>
                            </div>
                          ) : (
                            <div className="font-bold text-zinc-800">
                              {p.availableQuantity.toLocaleString()} {p.unit}s
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-zinc-600">{p.harvestDate}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveInlineEdit(p.id)}
                                className="p-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer"
                                title="Save"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingProdId(null)}
                                className="p-1.5 rounded-lg bg-zinc-200 text-zinc-700 hover:bg-zinc-300 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingProdId(p.id);
                                setEditPrice(String(p.pricePerUnitEtb));
                                setEditQty(String(p.availableQuantity));
                              }}
                              className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-emerald-50 text-zinc-700 hover:text-emerald-800 font-bold text-[11px] border border-zinc-200 cursor-pointer inline-flex items-center gap-1"
                            >
                              <Edit2 className="h-3 w-3" /> Quick Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sales Ledger Tab */}
      {activeSubTab === 'sales' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Audited Transaction History</h3>
            <p className="text-xs text-zinc-500 mb-6">
              Verified order disbursements stored in PostgreSQL and used by partner banks (Awash, CBE) for instant credit evaluation.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase font-bold">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Buyer Entity</th>
                    <th className="p-4">Items / Produce</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {mySales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-zinc-50">
                      <td className="p-4 font-mono font-bold text-zinc-900">{sale.orderNumber}</td>
                      <td className="p-4 font-semibold text-zinc-800">{sale.buyerName || 'Commercial Buyer'}</td>
                      <td className="p-4 text-zinc-600">
                        {sale.items?.map((it: any) => `${it.quantity} ${it.unit} ${it.name}`).join(', ') || 'Produce Batch'}
                      </td>
                      <td className="p-4 font-black text-emerald-950">{sale.totalAmountEtb?.toLocaleString()} ETB</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">
                          {sale.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {sale.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Finance Tab */}
      {activeSubTab === 'finance' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Agri-Credit & Working Capital</h3>
              <p className="text-xs text-zinc-500">
                Lending decisions powered by audited AgriLink sales, farm titling, and seasonal yield data
              </p>
            </div>
            <button
              onClick={onNavigateToFinance}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Apply for New Loan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myLoans.map((loan) => (
              <div key={loan.id} className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700">{loan.loanType.replace(/_/g, ' ')}</span>
                    <h4 className="text-xl font-black text-zinc-900 mt-0.5">
                      {loan.amountRequestedEtb.toLocaleString()} ETB
                    </h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    loan.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {loan.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Partner Bank</span>
                    <span className="font-bold text-zinc-900">{loan.lendingPartner}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Interest Rate</span>
                    <span className="font-bold text-emerald-800">{loan.interestRatePercent}% Annual</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create Field */}
      {showNewFieldModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200">
            <h3 className="text-lg font-black text-zinc-900 mb-1">Add Digital Field Parcel</h3>
            <p className="text-xs text-zinc-500 mb-4">Assign crop varieties and track soil telemetry</p>
            <form onSubmit={handleCreateField} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Field / Parcel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Plot - Teff Alpha"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Current Crop</label>
                  <input
                    type="text"
                    required
                    value={newFieldCrop}
                    onChange={(e) => setNewFieldCrop(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Area (Hectares)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newFieldArea}
                    onChange={(e) => setNewFieldArea(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Expected Harvest Date</label>
                <input
                  type="date"
                  required
                  value={newFieldHarvestDate}
                  onChange={(e) => setNewFieldHarvestDate(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFieldModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-zinc-100 font-bold text-xs text-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-700 font-bold text-xs text-white cursor-pointer"
                >
                  Save Field Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Comprehensive Create Produce Listing */}
      {showNewListingModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-black text-zinc-900">List Produce on AgriLink Marketplace</h3>
              <button
                onClick={() => setShowNewListingModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-zinc-500 mb-6">
              Publish your verified agricultural commodities across all 13 Ethiopian food categories with lot traceability.
            </p>

            <form onSubmit={handleCreateListing} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Produce / Commodity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Export Magna White Teff (Ada'a Selected)"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Primary Category *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => {
                      setNewProdCategory(e.target.value);
                      setNewProdSubcategory('');
                    }}
                    className="w-full px-3 py-2.5 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Subcategory / Type</label>
                  <select
                    value={newProdSubcategory}
                    onChange={(e) => setNewProdSubcategory(e.target.value)}
                    className="w-full px-3 py-2.5 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="">Select Subcategory (Optional)</option>
                    {modalSubcategories.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Variety & Quality Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Agricultural Variety / Strain</label>
                  <input
                    type="text"
                    placeholder="e.g. Magna Quncho DZ-Cr-37"
                    value={newProdVariety}
                    onChange={(e) => setNewProdVariety(e.target.value)}
                    className="w-full px-3 py-2.5 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Quality Grade *</label>
                  <select
                    value={newProdGrade}
                    onChange={(e) => setNewProdGrade(e.target.value)}
                    className="w-full px-3 py-2.5 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="GRADE_1_EXPORT">Grade 1 Export Standard</option>
                    <option value="GRADE_1_LOCAL">Grade 1 Local Standard</option>
                    <option value="GRADE_2_COMMERCIAL">Grade 2 Commercial</option>
                    <option value="PROCESSING_GRADE">Processing & Industrial Grade</option>
                    <option value="PREMIUM">Premium Specialty</option>
                  </select>
                </div>
              </div>

              {/* Price, Unit, Qty & Min Order */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Price (ETB) *</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Unit *</label>
                  <select
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="KG">KG</option>
                    <option value="QUINTAL">QUINTAL (100kg)</option>
                    <option value="TON">TON</option>
                    <option value="LITER">LITER</option>
                    <option value="CRATE">CRATE</option>
                    <option value="HEAD">HEAD (Livestock)</option>
                    <option value="BALE">BALE (Feed / Hay)</option>
                    <option value="BAG">BAG</option>
                    <option value="JAR">JAR (Honey)</option>
                    <option value="BOTTLE">BOTTLE</option>
                    <option value="PACKET">PACKET</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Available Qty *</label>
                  <input
                    type="number"
                    required
                    value={newProdQty}
                    onChange={(e) => setNewProdQty(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Min Order Qty</label>
                  <input
                    type="number"
                    required
                    value={newProdMinQty}
                    onChange={(e) => setNewProdMinQty(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Freshness & Origin Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Availability Status</label>
                  <select
                    value={newProdFreshness}
                    onChange={(e) => setNewProdFreshness(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="AVAILABLE_NOW">Available Now</option>
                    <option value="FRESH_DAILY">Fresh Daily Dispatch</option>
                    <option value="HARVESTING_NEXT_WEEK">Harvesting Next Week</option>
                    <option value="PRE_ORDER">Pre-Order</option>
                    <option value="FORWARD_CONTRACT">Forward Contract</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={newProdHarvestDate}
                    onChange={(e) => setNewProdHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Packaging Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Ventilated Jute Bags"
                    value={newProdPackaging}
                    onChange={(e) => setNewProdPackaging(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Live Animal & Organic Options */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProdIsOrganic}
                    onChange={(e) => setNewProdIsOrganic(e.target.checked)}
                    className="accent-emerald-700 h-4 w-4 rounded"
                  />
                  🌱 Certified Organic
                </label>

                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProdIsLiveAnimal}
                    onChange={(e) => setNewProdIsLiveAnimal(e.target.checked)}
                    className="accent-emerald-700 h-4 w-4 rounded"
                  />
                  🐄 Live Animal / Livestock
                </label>
              </div>

              {newProdIsLiveAnimal && (
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Animal Breed & Veterinary Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Boran / Highland Sheep • Verified Rabies & Anthrax Vaccinated"
                    value={newProdAnimalBreed}
                    onChange={(e) => setNewProdAnimalBreed(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              )}

              {/* Target Buyer Channel Selection */}
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                <label className="text-xs font-black text-emerald-950 block mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                  Target Buyer Channel
                </label>
                <p className="text-[10px] text-zinc-500 mb-3">
                  Match your commodity with prioritized off-takers and processing mills.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'PROCESSOR', label: 'Food Processors', desc: 'Paste, oil & flour mills', icon: Factory },
                    { id: 'INVESTOR', label: 'Agri-Investors / Exporters', desc: 'Outgrowers & export', icon: Briefcase },
                    { id: 'BUYER', label: 'Supermarket & Retail', desc: 'Groceries, hotels & retail', icon: Store },
                    { id: 'ALL', label: 'Open Market (All Channels)', desc: 'Maximum exposure', icon: Globe },
                  ].map((chan) => {
                    const Icon = chan.icon;
                    const isSelected = newProdTargetBuyer === chan.id;
                    return (
                      <button
                        type="button"
                        key={chan.id}
                        onClick={() => setNewProdTargetBuyer(chan.id as TargetBuyerType)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                          isSelected
                            ? 'bg-white border-emerald-600 ring-2 ring-emerald-600 shadow-2xs'
                            : 'bg-white/60 border-zinc-200 hover:bg-white text-zinc-600'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${isSelected ? 'text-emerald-700' : 'text-zinc-400'}`} />
                        <div>
                          <span className="text-xs font-bold text-zinc-900 block leading-tight">{chan.label}</span>
                          <span className="text-[9px] text-zinc-500 block leading-tight">{chan.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Description & Quality Notes</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Describe moisture level, certifications, grading parameters..."
                  className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewListingModal(false)}
                  className="w-1/2 py-3 rounded-2xl bg-zinc-100 font-bold text-xs text-zinc-700 cursor-pointer hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-black text-xs text-white cursor-pointer shadow-md"
                >
                  Publish Produce Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
