"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api";

interface FitFinderProps {
  productName: string;
}

export function FitFinder({ productName }: FitFinderProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [fit, setFit] = useState("regular"); // tight, regular, loose
  const [recommendation, setRecommendation] = useState<string | null>(null);
  
  useEffect(() => {
    if (user && user.settings?.fitProfile && isOpen) {
      if (user.settings.fitProfile.height) setHeight(user.settings.fitProfile.height.toString());
      if (user.settings.fitProfile.weight) setWeight(user.settings.fitProfile.weight.toString());
      if (user.settings.fitProfile.preference) setFit(user.settings.fitProfile.preference);
    }
  }, [user, isOpen]);
  
  const calculateSize = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(height);
    const w = parseInt(weight);
    
    if (isNaN(h) || isNaN(w)) return;

    let baseSize = "M"; // Smallest size Ascension carries
    
    if (h > 185 || w > 95) baseSize = "XXL";
    else if (h > 180 || w > 85) baseSize = "XL";
    else if (h > 175 || w > 75) baseSize = "L";
    else baseSize = "M";
    
    // Adjust for preference
    if (fit === "loose") {
      if (baseSize === "M") baseSize = "L";
      else if (baseSize === "L") baseSize = "XL";
      else if (baseSize === "XL") baseSize = "XXL";
    } else if (fit === "tight") {
      // Cannot go below M
      if (baseSize === "L") baseSize = "M";
      else if (baseSize === "XL") baseSize = "L";
      else if (baseSize === "XXL") baseSize = "XL";
    }

    setRecommendation(baseSize);

    // Provide a small fire-and-forget sync if they are a user to auto-save preferences
    if (user) {
      saveProfileSettings(h, w, fit);
    }
  };

  const saveProfileSettings = async (h: number, w: number, pref: string) => {
    try {
      const updatedSettings = {
        ...(user?.settings || {}),
        fitProfile: { height: h, weight: w, preference: pref }
      };
      await apiClient.request("/api/v1/auth/security/settings", {
        method: "PUT",
        body: JSON.stringify({ fitProfile: updatedSettings.fitProfile })
      });
    } catch (err) {
      console.error("Failed to save fit settings", err);
    }
  };

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center text-sm font-medium text-asc-accent hover:text-asc-matte transition-colors mt-2"
      >
        <SparklesIcon className="h-4 w-4 mr-1.5" />
        Find your perfect fit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6 md:p-8">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-asc-charcoal hover:bg-asc-sand rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <h3 className="text-2xl font-bold text-asc-matte mb-2">Fit Finder</h3>
            <p className="text-sm text-asc-charcoal mb-6">
              Enter your measurements to get a personalized sizing recommendation for the <span className="font-semibold">{productName}</span>.
            </p>

            {recommendation ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-asc-matte text-white text-4xl font-bold rounded-full mb-4 shadow-lg ring-4 ring-asc-sand-muted">
                  {recommendation}
                </div>
                <h4 className="text-xl font-semibold text-asc-matte mb-2">We recommend Size {recommendation}</h4>
                <p className="text-sm text-asc-charcoal mb-6">Based on our global biometric models and your {fit} fit preference, this size provides the highest probability of a perfect drop.</p>
                
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 bg-asc-matte text-white font-medium rounded-md hover:bg-asc-charcoal transition-colors"
                >
                  Continue Shopping
                </button>
                <button 
                  onClick={() => setRecommendation(null)}
                  className="w-full mt-3 py-3 text-asc-charcoal font-medium hover:text-asc-matte transition-colors text-sm"
                >
                  Recalculate
                </button>
              </div>
            ) : (
              <form onSubmit={calculateSize} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-asc-matte mb-1.5">Height (cm)</label>
                    <input 
                      type="number" 
                      required
                      min="140"
                      max="220"
                      placeholder="175"
                      value={height}
                      onChange={e => setHeight(e.target.value)}
                      className="w-full border border-asc-border rounded-md px-3 py-2 outline-none focus:border-asc-matte"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-asc-matte mb-1.5">Weight (kg)</label>
                    <input 
                      type="number" 
                      required
                      min="40"
                      max="150"
                      placeholder="70"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      className="w-full border border-asc-border rounded-md px-3 py-2 outline-none focus:border-asc-matte"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-asc-matte mb-3">How do you prefer your clothes to fit?</label>
                  <div className="flex gap-2">
                    {["tight", "regular", "loose"].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFit(f)}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-md border capitalize transition-colors ${
                          fit === f 
                            ? "bg-asc-matte text-white border-asc-matte" 
                            : "bg-white text-asc-charcoal border-asc-border hover:border-asc-matte"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 mt-4 bg-asc-matte text-white font-medium rounded-md hover:bg-asc-charcoal flex justify-center items-center group transition-colors"
                >
                  <SparklesIcon className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Calculate My Size
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
