"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

export default function RewardsPage() {
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRewards() {
      try {
        // Fetch user profile to get points
        const me = await apiClient.getMe();
        setPoints(me.rewardPoints || 0);
      } catch (err) {
        console.error("Failed to load rewards:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRewards();
  }, []);

  const handleGeneratePromo = () => {
    alert("Promo code generated: REWARD50! Your points have been adjusted.");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-asc-matte">Loyalty Rewards</h1>
        <p className="text-base text-asc-charcoal mt-2">
          Monitor your point balance and generate PromoCodes dynamically.
        </p>
      </div>

      <div className="rounded-xl border border-asc-border bg-asc-canvas p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="flex flex-col gap-2">
          <p className="font-medium text-asc-charcoal uppercase tracking-wider text-xs">Current Balance</p>
          {loading ? (
             <div className="w-24 h-12 bg-asc-border animate-pulse rounded-md"></div>
          ) : (
            <h2 className="text-5xl font-bold text-asc-matte">{points ?? 0} <span className="text-2xl font-medium text-asc-charcoal">pts</span></h2>
          )}
          <p className="text-sm text-asc-charcoal mt-2 max-w-sm">
            Earn 1 point for every ₹100 spent. Redeem points for exclusive discount codes on your future purchases.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="p-5 rounded-xl bg-asc-sand/30 border border-asc-border flex flex-col gap-2 items-center justify-center lg:min-w-[180px]">
            <span className="text-asc-charcoal text-sm font-medium">100 pts</span>
            <span className="font-bold text-asc-matte text-lg">₹100 Off</span>
            <button 
              onClick={handleGeneratePromo}
              disabled={loading || (points ?? 0) < 100}
              className="mt-3 w-full bg-asc-matte text-white px-4 py-2 rounded-md hover:bg-asc-charcoal disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Redeem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
