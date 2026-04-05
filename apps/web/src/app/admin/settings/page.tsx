"use client";

import { useState, useEffect } from "react";
import {
  CogIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface BusinessSettings {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: any;
  gstin: string;
  pan: string;
  cin: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/v1/admin/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();
      setSettings(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/v1/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      setSuccess("Settings updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-asc-matte"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-asc-matte">Settings</h1>
        <p className="mt-1 text-sm text-asc-charcoal">
          Manage your business settings and preferences
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-green-800">{success}</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-asc-matte mb-4 flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 mr-2" />
              Business Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-asc-matte">
                  Business Name
                </label>
                <input
                  type="text"
                  value={settings?.name || ""}
                  onChange={(e) =>
                    setSettings({ ...settings!, name: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-asc-matte">
                  Email
                </label>
                <input
                  type="email"
                  value={settings?.email || ""}
                  onChange={(e) =>
                    setSettings({ ...settings!, email: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-asc-matte">
                  Phone
                </label>
                <input
                  type="tel"
                  value={settings?.phone || ""}
                  onChange={(e) =>
                    setSettings({ ...settings!, phone: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-asc-matte">
                  Website
                </label>
                <input
                  type="url"
                  value={settings?.website || ""}
                  onChange={(e) =>
                    setSettings({ ...settings!, website: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Legal Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-asc-matte mb-4 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Legal Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-asc-matte">
                  GSTIN
                </label>
                <input
                  type="text"
                  value={settings?.gstin || ""}
                  onChange={(e) =>
                    setSettings({ ...settings!, gstin: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                  placeholder="29ABCDE1234F1ZV"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-asc-matte">
                  PAN
                </label>
                <input
                  type="text"
                  value={settings?.pan || ""}
                  onChange={(e) =>
                    setSettings({ ...settings!, pan: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                  placeholder="ABCDE1234F"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-asc-matte">
                  CIN
                </label>
                <input
                  type="text"
                  value={settings?.cin || ""}
                  onChange={(e) =>
                    setSettings({ ...settings!, cin: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                  placeholder="U12345MH2023PTC123456"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-asc-matte mb-4 flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Payment Gateway Settings
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-asc-matte">
                  Razorpay Key ID
                </label>
                <input
                  type="text"
                  defaultValue="rzp_test_..."
                  className="mt-1 block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                  readOnly
                />
                <p className="mt-1 text-xs text-asc-charcoal">
                  Configure in environment variables
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-asc-matte">
                  Stripe Publishable Key
                </label>
                <input
                  type="text"
                  defaultValue="pk_test_..."
                  className="mt-1 block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                  readOnly
                />
                <p className="mt-1 text-xs text-asc-charcoal">
                  Configure in environment variables
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-asc-matte mb-4 flex items-center">
              <TruckIcon className="h-5 w-5 mr-2" />
              Shipping Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-asc-matte">
                    Free Shipping Threshold
                  </p>
                  <p className="text-xs text-asc-charcoal">
                    Orders above this amount get free shipping
                  </p>
                </div>
                <input
                  type="number"
                  defaultValue="500"
                  className="w-32 px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-asc-matte">
                    Standard Shipping Cost
                  </p>
                  <p className="text-xs text-asc-charcoal">
                    Cost for orders below threshold
                  </p>
                </div>
                <input
                  type="number"
                  defaultValue="50"
                  className="w-32 px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-asc-matte hover:bg-asc-charcoal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-asc-matte disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CogIcon className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
