"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE_BUSINESS_ADDRESS, SITE_CONTACT_EMAIL, SITE_MAP_EMBED_URL } from "@/lib/site";

const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE_BUSINESS_ADDRESS)}`;

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-4xl flex-1 px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-sm text-asc-charcoal">
        <Link href="/" className="font-medium text-asc-accent hover:underline">
          Home
        </Link>
        <span className="mx-2 text-asc-border-strong">/</span>
        Contact us
      </p>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-asc-matte sm:text-4xl">Contact us</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-asc-charcoal">
        Whether you have a question about our sizing, need help with a return, or just want to tell us how much you love your new fit, our support team is ready to deliver an exceptional experience. Fill out the form below or drop by our headquarters.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-6 text-sm text-asc-charcoal">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-asc-matte">Address</h2>
            <p className="mt-2 leading-relaxed">{SITE_BUSINESS_ADDRESS}</p>
            <a
              href={mapsSearchUrl}
              className="mt-2 inline-block font-medium text-asc-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-asc-matte">Email</h2>
            <a href={`mailto:${SITE_CONTACT_EMAIL}`} className="mt-2 block text-asc-accent hover:underline">
              {SITE_CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-asc-border bg-asc-sand-muted shadow-sm">
          {SITE_MAP_EMBED_URL ? (
            <iframe
              title="Ascension business location"
              src={SITE_MAP_EMBED_URL}
              className="aspect-[4/3] h-[min(360px,50vh)] w-full sm:h-[320px] lg:aspect-auto lg:h-full lg:min-h-[280px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 p-8 text-center sm:aspect-auto sm:min-h-[280px]">
              <p className="max-w-xs text-sm text-asc-charcoal">
                Map embed not configured. Add your Google Maps embed URL to env, or open the location in
                Maps.
              </p>
              <a
                href={mapsSearchUrl}
                className="inline-flex h-11 items-center justify-center bg-asc-matte px-6 text-sm font-medium text-white transition-colors hover:bg-asc-charcoal"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Google Maps
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Reach Out Form */}
      <div className="mt-16 bg-white p-8 sm:p-10 border border-asc-border shadow-sm rounded-lg relative overflow-hidden">
        <h2 className="text-xl font-semibold text-asc-matte mb-6">Reach out to us</h2>
        
        {success ? (
          <div className="text-center py-12 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-2xl font-semibold text-green-800 mb-2">Message Sent!</h3>
            <p className="text-green-700 max-w-md mx-auto">Thank you for reaching out. A member of our support team will get back to you within 24-48 hours directly at your email.</p>
            <button 
              onClick={() => setSuccess(false)}
              className="mt-6 font-medium text-green-800 hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-asc-matte mb-1">First Name *</label>
                <input id="firstName" type="text" required className="w-full border border-asc-border rounded-md px-3 py-2 outline-none focus:border-asc-matte transition-colors bg-white shadow-sm" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-asc-matte mb-1">Last Name</label>
                <input id="lastName" type="text" className="w-full border border-asc-border rounded-md px-3 py-2 outline-none focus:border-asc-matte transition-colors bg-white shadow-sm" />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-asc-matte mb-1">Email Address *</label>
              <input id="email" type="email" required className="w-full border border-asc-border rounded-md px-3 py-2 outline-none focus:border-asc-matte transition-colors bg-white shadow-sm" />
            </div>

            <div>
              <label htmlFor="orderNum" className="block text-sm font-medium text-asc-matte mb-1">Order Number (Optional)</label>
              <input id="orderNum" type="text" placeholder="e.g. ASC-10394" className="w-full border border-asc-border rounded-md px-3 py-2 outline-none focus:border-asc-matte transition-colors bg-white shadow-sm" />
              <p className="mt-1 text-xs text-asc-charcoal-muted">If you are inquiring about a previous purchase.</p>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-asc-matte mb-1">Message *</label>
              <textarea id="message" required rows={5} placeholder="How can we help you today?" className="w-full border border-asc-border rounded-md px-3 py-2 outline-none focus:border-asc-matte transition-colors bg-white shadow-sm"></textarea>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 bg-asc-matte text-white font-semibold rounded-md hover:bg-asc-charcoal disabled:opacity-75 transition-colors flex items-center justify-center"
            >
              {submitting ? (
                <div className="h-5 w-5 border-t-2 border-white rounded-full animate-spin"></div>
              ) : (
                "Submit Message"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
