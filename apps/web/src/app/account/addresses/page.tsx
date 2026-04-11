"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  AccountSection,
  Field,
  FieldGroup,
  FormActions,
  Input,
  PrimaryButton,
  SecondaryButton,
} from "@/components/account-section";

interface Address {
  id: string;
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  type: "shipping" | "billing";
}



export default function AccountAddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
    type: "shipping" as "shipping" | "billing",
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch("/api/v1/customers/addresses", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAddresses(data.data || []);
        } else {
          throw new Error("Failed to load");
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load addresses. Please try again.");
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const method = editingAddress ? "PUT" : "POST";
      const url = editingAddress 
        ? `/api/v1/customers/addresses/${editingAddress.id}`
        : "/api/v1/customers/addresses";

      const token = localStorage.getItem("ascension-auth-token");
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      
      if (!resp.ok) throw new Error("Failed to save");

      const savedData = await resp.json();
      
      if (editingAddress) {
        setAddresses(addresses.map(a => a.id === editingAddress.id ? savedData.data : a));
        setEditingAddress(null);
      } else {
        setAddresses([savedData.data, ...addresses]);
      }

      // Reset form
      setFormData({
        name: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        phone: "",
        type: "shipping",
      });
      setShowAddForm(false);
    } catch (err) {
      setError("Failed to save address. Please try again.");
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      type: address.type,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const token = localStorage.getItem("ascension-auth-token");
      const resp = await fetch(`/api/v1/customers/addresses/${addressId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error("Failed to delete");
      
      setAddresses(addresses.filter(addr => addr.id !== addressId));
    } catch (err) {
      setError("Failed to delete address. Please try again.");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const token = localStorage.getItem("ascension-auth-token");
      const address = addresses.find(a => a.id === addressId);
      if (!address) return;
      const resp = await fetch(`/api/v1/customers/addresses/${addressId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ isDefault: true })
      });
      if (!resp.ok) throw new Error("Failed");
      
      const updatedData = await resp.json();
      setAddresses(addresses.map(a => 
        a.id === addressId ? updatedData.data : { ...a, isDefault: false }
      ));
    } catch (err) {
      setError("Failed to set default address. Please try again.");
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAddress(null);
    setFormData({
      name: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      phone: "",
      type: "shipping",
    });
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <p className="text-asc-charcoal">
            Please <a href="/auth/login" className="text-asc-accent hover:text-asc-matte transition-colors">sign in</a> to manage your addresses.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <AccountSection
        title="Addresses"
        description="Manage shipping and billing addresses for checkout."
      >
        <div className="text-center py-8">
          <p className="text-asc-charcoal">Loading your addresses...</p>
        </div>
      </AccountSection>
    );
  }

  if (error) {
    return (
      <AccountSection
        title="Addresses"
        description="Manage shipping and billing addresses for checkout."
      >
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      </AccountSection>
    );
  }

  return (
    <AccountSection
      title="Addresses"
      description="Manage shipping and billing addresses for checkout."
    >
      <div className="space-y-8">
        {/* Add New Address Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 border border-asc-border border-dashed rounded-md text-asc-charcoal hover:border-asc-matte hover:text-asc-matte transition-colors"
          >
            + Add New Address
          </button>
        )}

        {/* Add/Edit Address Form */}
        {showAddForm && (
          <div className="border border-asc-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-asc-matte mb-6">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <FieldGroup>
                <Field label="Address Name" htmlFor="name">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Home, Office"
                  />
                </Field>
                <Field label="Address Line 1" htmlFor="line1">
                  <Input
                    id="line1"
                    name="line1"
                    type="text"
                    required
                    value={formData.line1}
                    onChange={handleInputChange}
                    placeholder="Street address, P.O. box"
                  />
                </Field>
                <Field label="Address Line 2" htmlFor="line2">
                  <Input
                    id="line2"
                    name="line2"
                    type="text"
                    value={formData.line2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City" htmlFor="city">
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </Field>
                  <Field label="State" htmlFor="state">
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="PIN Code" htmlFor="postalCode">
                    <Input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="PIN Code"
                    />
                  </Field>
                  <Field label="Phone Number" htmlFor="phone">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit phone number"
                    />
                  </Field>
                </div>
                <Field label="Country" htmlFor="country">
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-asc-border rounded-md focus:outline-none focus:ring-2 focus:ring-asc-accent focus:border-transparent"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </Field>
                <Field label="Address Type" htmlFor="type">
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-asc-border rounded-md focus:outline-none focus:ring-2 focus:ring-asc-accent focus:border-transparent"
                  >
                    <option value="shipping">Shipping Address</option>
                    <option value="billing">Billing Address</option>
                  </select>
                </Field>
              </FieldGroup>
              
              <FormActions>
                <PrimaryButton type="submit">
                  {editingAddress ? "Update Address" : "Save Address"}
                </PrimaryButton>
                <SecondaryButton type="button" onClick={handleCancel}>
                  Cancel
                </SecondaryButton>
              </FormActions>
            </form>
          </div>
        )}

        {/* Address List */}
        {addresses.length === 0 && !showAddForm ? (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-asc-charcoal"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-asc-matte mb-2">No saved addresses</h3>
            <p className="text-asc-charcoal mb-6">
              You haven&apos;t saved any addresses yet. Add your first address to make checkout faster.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="border border-asc-border rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-asc-matte">{address.name}</h3>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-asc-accent text-asc-canvas text-xs font-medium rounded-full">
                          Default
                        </span>
                      )}
                      <span className="px-2 py-1 bg-asc-canvas border border-asc-border text-asc-charcoal text-xs font-medium rounded-full">
                        {address.type === "shipping" ? "Shipping" : "Billing"}
                      </span>
                    </div>
                    <div className="text-asc-charcoal">
                      <p>{address.line1}</p>
                      {address.line2 && <p>{address.line2}</p>}
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                      <p>{address.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-asc-accent hover:text-asc-matte transition-colors"
                    >
                      Edit
                    </button>
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="text-asc-accent hover:text-asc-matte transition-colors"
                      >
                        Set as Default
                      </button>
                    )}
                    {addresses.length > 1 && (
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountSection>
  );
}
