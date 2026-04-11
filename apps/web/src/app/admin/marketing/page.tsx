"use client";

import { useState, useEffect } from "react";
import { PlusIcon, TicketIcon, ChartBarIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function MarketingPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minPurchase: "",
    usageLimit: "",
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/v1/admin/promos", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPromos(data.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/v1/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setPromos([data.data, ...promos]);
      setIsCreating(false);
      setForm({ code: "", description: "", discountType: "PERCENTAGE", discountValue: "", minPurchase: "", usageLimit: "" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/v1/admin/promos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !current })
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      
      setPromos(promos.map(p => p.id === id ? { ...p, isActive: !current } : p));
    } catch(err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-asc-matte"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-asc-matte">Promotions & Marketing</h1>
          <p className="mt-1 text-sm text-asc-charcoal">Manage discount codes and storefront marketing engines.</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="flex items-center px-4 py-2 bg-asc-matte text-white text-sm font-medium rounded-md hover:bg-asc-charcoal transition-colors">
          <PlusIcon className="h-4 w-4 mr-2" /> New Promo Code
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-asc-border p-6 flex flex-col justify-center items-center text-center">
          <TicketIcon className="h-8 w-8 text-asc-accent mb-2" />
          <p className="text-2xl font-bold text-asc-matte">{promos.filter(p => p.isActive).length}</p>
          <p className="text-xs uppercase font-semibold tracking-wider text-asc-charcoal-muted">Active Promos</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-asc-border p-6 flex flex-col justify-center items-center text-center">
          <ChartBarIcon className="h-8 w-8 text-asc-accent mb-2" />
          <p className="text-2xl font-bold text-asc-matte">{promos.reduce((acc, p) => acc + p.usageCount, 0)}</p>
          <p className="text-xs uppercase font-semibold tracking-wider text-asc-charcoal-muted">Total Uses Tracked</p>
        </div>
      </div>

      {isCreating && (
        <div className="bg-white border text-sm border-asc-border rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-asc-matte mb-4">Generate Promo Code</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold uppercase mb-1">Code *</label>
                <input required type="text" placeholder="e.g. SUMMER20" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="w-full border border-asc-border rounded-md px-3 py-2 outline-none uppercase" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold uppercase mb-1">Description</label>
                <input type="text" placeholder="Internal memo" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-asc-border rounded-md px-3 py-2 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Type *</label>
                <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} className="w-full border border-asc-border rounded-md px-3 py-2 outline-none">
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Value *</label>
                <input required type="number" placeholder="20" value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} className="w-full border border-asc-border rounded-md px-3 py-2 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Min Purchase (₹)</label>
                <input type="number" placeholder="0" value={form.minPurchase} onChange={e => setForm({...form, minPurchase: e.target.value})} className="w-full border border-asc-border rounded-md px-3 py-2 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Limit Total Uses</label>
                <input type="number" placeholder="Unlimited" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} className="w-full border border-asc-border rounded-md px-3 py-2 outline-none" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 border border-asc-border rounded-md hover:bg-asc-sand-muted">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-asc-matte text-white rounded-md hover:bg-asc-charcoal">Generate Code</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden border border-asc-border">
        <table className="min-w-full divide-y divide-asc-border">
          <thead className="bg-asc-sand-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">Uses</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-asc-border">
            {promos.map((promo) => (
              <tr key={promo.id} className="hover:bg-asc-sand-muted">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-asc-matte font-mono bg-asc-sand-muted/50 px-2 py-1 inline-block rounded">{promo.code}</div>
                  {promo.description && <div className="text-xs text-asc-charcoal mt-1">{promo.description}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-asc-matte">
                  {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`}
                  {promo.minPurchase && <div className="text-[10px] text-asc-charcoal-muted uppercase tracking-wider">Min ₹{promo.minPurchase}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-asc-charcoal">
                  {promo.usageCount} {promo.usageLimit && <span className="text-xs text-asc-charcoal-muted">/ {promo.usageLimit}</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => toggleStatus(promo.id, promo.isActive)} className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full transition-colors ${promo.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                    {promo.isActive ? "Active" : "Disabled"}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-asc-charcoal">
                  {new Date(promo.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {promos.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-asc-charcoal">No promo codes generated yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
