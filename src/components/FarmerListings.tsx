import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Package,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Product, ProductCategory } from '../types/index.ts';

export const FarmerListings: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Listing Modal Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    categoryId: '1',
    variety: '',
    grade: 'GRADE_1_EXPORT',
    pricePerUnitEtb: '',
    unit: 'KG',
    availableQuantity: '',
    minOrderQuantity: '10',
    harvestDate: new Date().toISOString().split('T')[0],
    description: '',
    farmLocation: currentUser?.region || 'Oromia',
    isOrganic: false,
  });

  // Inline Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editQty, setEditQty] = useState('');

  const loadListings = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      if (prodRes.ok) {
        const allProds: Product[] = await prodRes.json();
        const myProds = allProds.filter((p) => !currentUser?.id || p.farmerId === currentUser.id || p.farmerId === 1);
        setProducts(myProds);
      }

      if (catRes.ok) {
        setCategories(await catRes.json());
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [currentUser]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.pricePerUnitEtb || !newProd.availableQuantity) {
      setStatusMessage({ text: 'Please fill out all required fields.', type: 'error' });
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(currentUser?.id || 1),
        },
        body: JSON.stringify({
          name: newProd.name,
          categoryId: Number(newProd.categoryId),
          variety: newProd.variety,
          grade: newProd.grade,
          pricePerUnitEtb: Number(newProd.pricePerUnitEtb),
          unit: newProd.unit,
          availableQuantity: Number(newProd.availableQuantity),
          minOrderQuantity: Number(newProd.minOrderQuantity || 1),
          harvestDate: newProd.harvestDate,
          description: newProd.description || `${newProd.name} harvest batch`,
          farmLocation: newProd.farmLocation,
          region: currentUser?.region || 'Oromia',
          isOrganic: newProd.isOrganic,
        }),
      });

      if (res.ok) {
        setStatusMessage({ text: 'Harvest batch listed successfully on marketplace!', type: 'success' });
        setShowAddModal(false);
        setNewProd({
          name: '',
          categoryId: '1',
          variety: '',
          grade: 'GRADE_1_EXPORT',
          pricePerUnitEtb: '',
          unit: 'KG',
          availableQuantity: '',
          minOrderQuantity: '10',
          harvestDate: new Date().toISOString().split('T')[0],
          description: '',
          farmLocation: currentUser?.region || 'Oromia',
          isOrganic: false,
        });
        loadListings();
      } else {
        const data = await res.json();
        setStatusMessage({ text: data.error || 'Failed to list harvest.', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Network error occurred.', type: 'error' });
    }
  };

  const handleSaveInline = async (prodId: number) => {
    try {
      if (editPrice) {
        await fetch(`/api/products/${prodId}/price`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pricePerUnitEtb: Number(editPrice) }),
        });
      }

      if (editQty) {
        await fetch(`/api/products/${prodId}/inventory`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ availableQuantity: Number(editQty) }),
        });
      }

      setEditingId(null);
      setStatusMessage({ text: 'Listing updated successfully!', type: 'success' });
      loadListings();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to update listing.', type: 'error' });
    }
  };

  const handleDeleteListing = async (prodId: number) => {
    if (!window.confirm('Are you sure you want to remove this harvest listing?')) return;
    try {
      const res = await fetch(`/api/products/${prodId}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMessage({ text: 'Listing removed.', type: 'success' });
        loadListings();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variety?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Harvest Listings & Inventory</h1>
          <p className="text-sm text-zinc-500">
            Publish, edit pricing, and manage produce batches open for commercial buyer procurement.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-102 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Harvest Batch</span>
        </button>
      </div>

      {/* Alert / Feedback message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-zinc-500 hover:text-zinc-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search listings by crop name, variety, or grade..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 rounded-xl border border-zinc-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <span className="text-xs font-bold text-zinc-500 px-2 shrink-0">
          Showing {filtered.length} of {products.length} batches
        </span>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="py-3.5 px-4">Produce Details</th>
                <th className="py-3.5 px-4">Grade & Origin</th>
                <th className="py-3.5 px-4">Available Qty</th>
                <th className="py-3.5 px-4">Price (ETB)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((p) => {
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                          <Sprout className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 text-sm">{p.name}</p>
                          <p className="text-xs text-zinc-400">{p.variety || 'Standard Variety'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-block">
                          {p.grade || 'Grade 1'}
                        </span>
                        <p className="text-xs text-zinc-500">{p.farmLocation || p.region}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            className="w-20 px-2 py-1 text-sm bg-white border border-emerald-500 rounded-lg outline-none"
                          />
                          <span className="text-xs text-zinc-400">{p.unit}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-zinc-900 text-sm">
                          {p.availableQuantity} <span className="text-xs font-medium text-zinc-500">{p.unit}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-20 px-2 py-1 text-sm bg-white border border-emerald-500 rounded-lg outline-none"
                          />
                          <span className="text-xs text-zinc-400">ETB</span>
                        </div>
                      ) : (
                        <span className="font-black text-zinc-950 text-sm">
                          {p.pricePerUnitEtb} <span className="text-xs font-bold text-zinc-400">ETB</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveInline(p.id)}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                            title="Save Changes"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg bg-zinc-200 text-zinc-600 hover:bg-zinc-300 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingId(p.id);
                              setEditPrice(String(p.pricePerUnitEtb));
                              setEditQty(String(p.availableQuantity));
                            }}
                            className="p-2 rounded-lg text-zinc-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Edit Price & Qty"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteListing(p.id)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Batch"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No harvest listings match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Listing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">List New Harvest Batch</h2>
                <p className="text-xs text-zinc-500">Provide harvest specifications for buyer trade settlement</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Produce / Crop Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Magna White Teff, Hass Avocado, Roma Tomatoes"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Category</label>
                  <select
                    value={newProd.categoryId}
                    onChange={(e) => setNewProd({ ...newProd, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Quality Grade</label>
                  <select
                    value={newProd.grade}
                    onChange={(e) => setNewProd({ ...newProd, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="GRADE_1_EXPORT">Grade 1 (Export Quality)</option>
                    <option value="GRADE_A">Grade A (Premium Local)</option>
                    <option value="GRADE_B">Grade B (Standard Commercial)</option>
                    <option value="PROCESSING_GRADE">Processing Grade</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Price (ETB) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 115"
                    value={newProd.pricePerUnitEtb}
                    onChange={(e) => setNewProd({ ...newProd, pricePerUnitEtb: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Unit</label>
                  <select
                    value={newProd.unit}
                    onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="KG">Kilogram (KG)</option>
                    <option value="QUINTAL">Quintal (100kg)</option>
                    <option value="TON">Metric Ton</option>
                    <option value="CRATE">Crate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Available Qty *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={newProd.availableQuantity}
                    onChange={(e) => setNewProd({ ...newProd, availableQuantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Farm Location / Region</label>
                  <input
                    type="text"
                    value={newProd.farmLocation}
                    onChange={(e) => setNewProd({ ...newProd, farmLocation: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={newProd.harvestDate}
                    onChange={(e) => setNewProd({ ...newProd, harvestDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isOrganic"
                  checked={newProd.isOrganic}
                  onChange={(e) => setNewProd({ ...newProd, isOrganic: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isOrganic" className="text-xs font-semibold text-zinc-700">
                  Certified Organic Produce
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
