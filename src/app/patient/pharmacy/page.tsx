'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Pill,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { formatINR } from '@/lib/doctorUtils';

const PHARMACY_CATEGORIES = [
  'All Categories',
  'Pain Relief',
  'Fever & Cold',
  'Digestive Health',
  'Vitamins',
  'Skin Care',
  'Diabetes Care',
  'Blood Pressure',
  'Cholesterol',
  'Allergy',
  'First Aid',
  'Personal Care',
];

function PatientPharmacyContent() {
  const searchParams = useSearchParams();
  const autoCheckout = searchParams.get('autoCheckout') === 'true';

  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Category Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  // Shopping Cart State
  const [cart, setCart] = useState<Array<{ medicineId: string; name: string; price: number; quantity: number; maxStock: number }>>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  const fetchPharmacy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pharmacy');
      if (res.ok) {
        const data = await res.json();
        setMedicines(data.medicines || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacy();

    // Check pre-filled cart from prescriptions
    const savedCart = localStorage.getItem('hms_pharmacy_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(parsed);
        if (autoCheckout) setShowCartModal(true);
      } catch (err) {
        console.error(err);
      }
    }
  }, [autoCheckout]);

  const handleAddToCart = (med: any) => {
    if (med.stock <= 0) {
      alert('This product is currently out of stock.');
      return;
    }

    const now = new Date();
    if (new Date(med.expiryDate) < now) {
      alert('This product batch has expired and cannot be ordered.');
      return;
    }

    const existingIndex = cart.findIndex((item) => item.medicineId === med.id);
    if (existingIndex > -1) {
      const copy = [...cart];
      if (copy[existingIndex].quantity + 1 > med.stock) {
        alert(`Cannot add more. Available stock is ${med.stock} units.`);
        return;
      }
      copy[existingIndex].quantity += 1;
      setCart(copy);
    } else {
      setCart([...cart, { medicineId: med.id, name: med.name, price: med.price, quantity: 1, maxStock: med.stock }]);
    }
  };

  const handleUpdateQuantity = (medicineId: string, delta: number) => {
    const copy = cart
      .map((item) => {
        if (item.medicineId === medicineId) {
          const newQty = item.quantity + delta;
          if (newQty > item.maxStock) {
            alert(`Maximum available stock is ${item.maxStock} units.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(copy);
  };

  const handleRemoveFromCart = (medicineId: string) => {
    setCart(cart.filter((item) => item.medicineId !== medicineId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = Math.round((subtotal + tax) * 100) / 100;

  const handleCheckoutOrder = async () => {
    if (cart.length === 0) return;
    setOrderLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((i) => ({
            medicineId: i.medicineId,
            quantity: i.quantity,
          })),
        }),
      });

      const d = await res.json();
      if (res.ok) {
        setConfirmedOrder(d.order);
        setCart([]);
        localStorage.removeItem('hms_pharmacy_cart');
        setShowCartModal(false);
        fetchPharmacy();
      } else {
        alert(d.error || 'Failed to place medicine order');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOrderLoading(false);
    }
  };

  const now = new Date();
  const filtered = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(search.toLowerCase()) ||
      med.category.toLowerCase().includes(search.toLowerCase()) ||
      (med.description && med.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'All Categories' ||
      med.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="h-6 w-6 text-blue-600" /> Pharmacy
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Order genuine pharmaceutical products and healthcare supplies in Indian Rupees (₹).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPharmacy}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            onClick={() => setShowCartModal(true)}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 relative"
          >
            <ShoppingBag className="h-4 w-4" /> Cart
            {cart.length > 0 && (
              <span className="px-1.5 py-0.5 bg-white text-blue-700 text-[10px] font-black rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          {PHARMACY_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Medicines Catalog Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((med) => {
            const isExpired = new Date(med.expiryDate) < now;
            const isLowStock = med.stock > 0 && med.stock <= 30;

            return (
              <div
                key={med.id}
                className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{med.name}</h3>
                      <span className="text-[11px] text-blue-600 font-semibold">{med.category}</span>
                    </div>
                    <span className="text-base font-extrabold text-emerald-700 font-mono">{formatINR(med.price)}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {med.description || 'Standard pharmaceutical formulation.'}
                  </p>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Availability:</span>
                    {isExpired ? (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 font-bold rounded text-[10px]">
                        Expired Batch
                      </span>
                    ) : med.stock <= 0 ? (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 font-bold rounded text-[10px]">
                        Out of Stock
                      </span>
                    ) : (
                      <span className={`font-mono font-bold ${isLowStock ? 'text-amber-700' : 'text-emerald-700'}`}>
                        In stock ({med.stock})
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleAddToCart(med)}
                    disabled={med.stock <= 0 || isExpired}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-10 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs space-y-2">
          <p className="font-bold text-slate-800 text-sm">No medicines found</p>
          <p>Try clearing your search query or selecting a different category filter.</p>
        </div>
      )}

      {/* SHOPPING CART MODAL */}
      {showCartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" /> Pharmacy Order Review
              </h3>
              <button onClick={() => setShowCartModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            {cart.length > 0 ? (
              <div className="space-y-3">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.medicineId}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900">{item.name}</h4>
                        <span className="font-mono text-emerald-700 text-[11px]">{formatINR(item.price)} per unit</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-300">
                          <button
                            onClick={() => handleUpdateQuantity(item.medicineId, -1)}
                            className="p-1 text-slate-500 hover:text-slate-900"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-mono font-bold px-2 text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.medicineId, 1)}
                            className="p-1 text-slate-500 hover:text-slate-900"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.medicineId)}
                          className="text-rose-600 p-1 hover:text-rose-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-slate-700">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%):</span>
                    <span>{formatINR(tax)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold text-sm border-t border-slate-200 pt-2">
                    <span>Grand Total:</span>
                    <span className="text-emerald-700">{formatINR(grandTotal)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowCartModal(false)}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-300"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={handleCheckoutOrder}
                    disabled={orderLoading}
                    className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xs"
                  >
                    {orderLoading ? 'Processing Order...' : 'Confirm Order'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-slate-500">Your shopping cart is empty.</p>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMED ORDER MODAL */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs text-center">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Order Placed Successfully!</h3>
            <p className="text-slate-500">Order ID: <strong className="text-blue-600 font-mono">#{confirmedOrder.orderNo}</strong></p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-1 font-mono text-slate-700">
              <p>Items Count: {confirmedOrder.items?.length || 0}</p>
              <p>Total Amount: <span className="text-emerald-700 font-bold">{formatINR(confirmedOrder.totalAmount)}</span></p>
              <p>Status: <span className="text-blue-600 font-bold">{confirmedOrder.status}</span></p>
            </div>
            <button
              onClick={() => setConfirmedOrder(null)}
              className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientPharmacyPage() {
  return (
    <DashboardShell>
      <Suspense fallback={<div className="flex justify-center py-12"><div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <PatientPharmacyContent />
      </Suspense>
    </DashboardShell>
  );
}
