"use client";

import { useState, useEffect } from "react";
import { ShoppingBagIcon, EnvelopeIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentCarts, setSentCarts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/v1/admin/analytics/abandoned-carts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCarts(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRecovery = async (cartId: string) => {
    setSendingId(cartId);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/v1/admin/analytics/trigger-recovery/${cartId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to queue email");
      
      setSentCarts(new Set(sentCarts).add(cartId));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingId(null);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diffHours = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) return `${Math.floor(diffHours)} hrs ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  if (loading) return <div className="p-12 flex justify-center"><ArrowPathIcon className="h-8 w-8 text-asc-matte animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-asc-matte">Abandoned Carts (Ghost Sessions)</h1>
          <p className="mt-1 text-sm text-asc-charcoal">Track active shopping sessions that have remained dormant for over 2 hours without converting to an order.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-asc-border p-6 flex flex-col justify-center items-center text-center">
          <ShoppingBagIcon className="h-8 w-8 text-asc-accent mb-2" />
          <p className="text-2xl font-bold text-asc-matte">{carts.length}</p>
          <p className="text-xs uppercase font-semibold tracking-wider text-asc-charcoal-muted">Trapped Carts</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-asc-border p-6 flex flex-col justify-center items-center text-center">
          <span className="text-3xl font-bold text-asc-matte mb-1">
            ₹{carts.reduce((acc, c) => acc + c.totalValue, 0).toLocaleString('en-IN')}
          </span>
          <p className="text-xs uppercase font-semibold tracking-wider text-asc-charcoal-muted">Potentially Recoverable Revenue</p>
        </div>
      </div>

      {error && <p className="text-red-600 bg-red-100 p-3 rounded">{error}</p>}

      <div className="bg-white shadow rounded-lg overflow-hidden border border-asc-border">
        <table className="min-w-full divide-y divide-asc-border">
          <thead className="bg-asc-sand-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">Cart Contents</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">Total Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">Time Dormant</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-asc-charcoal uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-asc-border">
            {carts.map((cart) => (
              <tr key={cart.id} className="hover:bg-asc-sand-muted/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {cart.user ? (
                    <div>
                      <div className="font-bold text-asc-matte text-sm">{cart.user.name}</div>
                      <div className="text-xs text-asc-charcoal">{cart.user.email}</div>
                    </div>
                  ) : (
                    <div className="text-sm italic text-asc-charcoal">Anonymous Identity</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-asc-charcoal flex flex-wrap gap-2">
                    {cart.items.map((item: any, idx: number) => (
                      <span key={idx} className="bg-white border rounded px-2 py-1 text-xs">
                        {item.quantity}x {item.variant?.sku || "Product"}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-asc-matte">
                  ₹{cart.totalValue.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-600">
                  {formatTimeAgo(cart.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {cart.user?.email ? (
                    sentCarts.has(cart.id) ? (
                      <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1.5 rounded">
                        Email Requested
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleSendRecovery(cart.id)}
                        disabled={sendingId === cart.id}
                        className="inline-flex items-center px-4 py-2 bg-asc-matte text-white text-xs font-medium rounded hover:bg-asc-charcoal disabled:opacity-50 transition-colors"
                      >
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        {sendingId === cart.id ? "Queuing..." : "Send Recovery"}
                      </button>
                    )
                  ) : (
                    <span className="text-xs italic text-asc-charcoal-muted">No Email Found</span>
                  )}
                </td>
              </tr>
            ))}
            {carts.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-asc-charcoal">No abandoned carts tracked in the database right now.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
