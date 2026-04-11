"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if user has already seen or subscribed
    const hasSeen = localStorage.getItem("ascension_newsletter_seen");
    
    if (!hasSeen) {
      // Trigger popup after 5 seconds of browsing
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    localStorage.setItem("ascension_newsletter_seen", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const res = await fetch("/api/v1/marketing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "popup" })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to subscribe");
      }
      
      setStatus("success");
      // Auto close after 3 seconds on success
      setTimeout(() => {
        closePopup();
      }, 3000);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={closePopup}
      />
      
      <div className="relative bg-asc-canvas w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <button 
          onClick={closePopup}
          className="absolute top-4 right-4 p-2 text-asc-charcoal hover:bg-asc-sand hover:text-asc-matte rounded-full transition-colors z-10"
        >
          <span className="sr-only">Close</span>
          <XMarkIcon className="h-5 w-5" />
        </button>
        
        <div className="flex flex-col md:flex-row">
          <div className="hidden md:block w-2/5 bg-asc-matte relative overflow-hidden">
            {/* Pattern or image would go here, using a sleek gradient for now */}
            <div className="absolute inset-0 bg-gradient-to-br from-asc-matte to-asc-charcoal opacity-90"></div>
            <div className="absolute inset-0 flex items-center justify-center p-6 text-white text-center font-serif text-3xl italic">
              A
            </div>
          </div>
          
          <div className="w-full md:w-3/5 p-8 sm:p-10 flex flex-col justify-center bg-white">
            <h3 className="text-2xl font-bold text-asc-matte tracking-tight mb-2">Unlock 10% Off</h3>
            <p className="text-sm text-asc-charcoal mb-6 leading-relaxed">
              Join the Ascension insider list to receive an exclusive discount code on your first order, plus early access to new drops.
            </p>
            
            {status === "success" ? (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-center">
                <p className="font-semibold mb-1">You're on the list!</p>
                <p className="text-xs">Check your email for your promo code.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 bg-asc-sand-muted border ${status === 'error' ? 'border-red-300' : 'border-asc-border'} rounded-md text-sm outline-none focus:border-asc-matte transition-colors`}
                  />
                  {status === "error" && (
                    <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-asc-matte text-white py-3 rounded-md font-medium text-sm hover:bg-black transition-colors disabled:opacity-70 flex justify-center items-center"
                >
                  {status === "loading" ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Claim My Offer"
                  )}
                </button>
                
                <p className="text-[10px] text-asc-charcoal-muted text-center mt-4">
                  By subscribing you agree to our Terms & Privacy Policy.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
