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
  Select,
} from "@/components/account-section";

export default function AccountProfilePage() {
  const { user, login, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    emailMarketing: false,
    smsNotifications: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New State for toggling edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender === "PREFER_NOT_TO_SAY" ? "prefer_not" : user.gender?.toLowerCase() || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        ...(user.addresses && user.addresses.length > 0 ? {
          addressLine1: user.addresses[0].line1 || "",
          addressLine2: user.addresses[0].line2 || "",
          city: user.addresses[0].city || "",
          state: user.addresses[0].state || "",
          postalCode: user.addresses[0].postalCode || "",
          country: user.addresses[0].country || "India",
        } : {})
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.data) {
          localStorage.setItem("ascension-user", JSON.stringify(responseData.data));
          if (updateUser) {
            updateUser(responseData.data);
          }
        }
        setSuccess(true);
        // Switch back to view mode after a successful save
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update profile. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <p className="text-asc-charcoal">
            Please <a href="/auth/login" className="text-asc-accent hover:text-asc-matte transition-colors">sign in</a> to view your profile.
          </p>
        </div>
      </div>
    );
  }

  // Formatter for read-only view
  const displayValue = (val: string) => val ? val : "—";
  const displayGender = (val: string) => {
    if (!val) return "—";
    if (val === "prefer_not") return "Prefer not to say";
    return val.charAt(0).toUpperCase() + val.slice(1);
  };

  return (
    <AccountSection
      title="Profile & details"
      description="View and update your personal information."
    >
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-6">
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {!isEditing ? (
        // READ-ONLY STATIC VIEW
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="bg-asc-canvas border border-asc-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-asc-matte mb-4 border-b border-asc-border pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-asc-charcoal uppercase tracking-wider mb-1">First Name</p>
                <p className="text-asc-matte">{displayValue(formData.firstName)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-asc-charcoal uppercase tracking-wider mb-1">Last Name</p>
                <p className="text-asc-matte">{displayValue(formData.lastName)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-asc-charcoal uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-asc-matte">{displayValue(formData.email)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-asc-charcoal uppercase tracking-wider mb-1">Phone Number</p>
                <p className="text-asc-matte">{displayValue(formData.phone)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-asc-charcoal uppercase tracking-wider mb-1">Gender</p>
                <p className="text-asc-matte">{displayGender(formData.gender)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-asc-charcoal uppercase tracking-wider mb-1">Date of Birth</p>
                <p className="text-asc-matte">{displayValue(formData.dateOfBirth)}</p>
              </div>
            </div>
          </div>

          <div className="bg-asc-canvas border border-asc-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-asc-matte mb-4 border-b border-asc-border pb-2">Primary Address</h3>
            {formData.addressLine1 ? (
              <div className="space-y-1">
                <p className="text-asc-matte">{formData.addressLine1}</p>
                {formData.addressLine2 && <p className="text-asc-matte">{formData.addressLine2}</p>}
                <p className="text-asc-matte">{formData.city}, {formData.state} {formData.postalCode}</p>
                <p className="text-asc-matte">{formData.country}</p>
              </div>
            ) : (
              <p className="text-asc-charcoal">No primary address saved.</p>
            )}
          </div>

          <FormActions>
            <PrimaryButton type="button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </PrimaryButton>
          </FormActions>
        </div>
      ) : (
        // EDIT MODE FORM
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
          <FieldGroup>
            <Field label="First Name" htmlFor="firstName">
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Your first name"
              />
            </Field>
            <Field label="Last Name" htmlFor="lastName">
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Your last name"
              />
            </Field>
            <Field label="Email Address" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Phone Number" htmlFor="phone">
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 …"
              />
            </Field>
            <Field label="Gender" htmlFor="gender">
              <Select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer_not">Prefer not to say</option>
                <option value="other">Other</option>
              </Select>
            </Field>
            <Field label="Date of Birth" htmlFor="dateOfBirth">
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </Field>
          </FieldGroup>

          <div className="mt-10">
            <h3 className="text-lg font-medium text-asc-matte mb-6">Shipping Address</h3>
            <FieldGroup>
              <Field label="Address Line 1" htmlFor="addressLine1">
                <Input
                  id="addressLine1"
                  name="addressLine1"
                  type="text"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Street address, P.O. box"
                />
              </Field>
              <Field label="Address Line 2" htmlFor="addressLine2">
                <Input
                  id="addressLine2"
                  name="addressLine2"
                  type="text"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Apartment, suite, unit, etc."
                />
              </Field>
              <Field label="City" htmlFor="city">
                <Input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </Field>
              <Field label="State" htmlFor="state">
                <Input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </Field>
              <Field label="PIN Code" htmlFor="postalCode">
                <Input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="PIN Code"
                />
              </Field>
              <Field label="Country" htmlFor="country">
                <Select id="country" name="country" value={formData.country} onChange={handleChange}>
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </Select>
              </Field>
            </FieldGroup>
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-medium text-asc-matte mb-6">Communication Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="emailMarketing"
                  name="emailMarketing"
                  type="checkbox"
                  checked={formData.emailMarketing}
                  onChange={handleChange}
                  className="h-4 w-4 text-asc-accent border-asc-border rounded focus:ring-asc-accent"
                />
                <label htmlFor="emailMarketing" className="ml-2 block text-sm text-asc-charcoal">
                  Send me emails about new arrivals, exclusive offers, and promotions
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="smsNotifications"
                  name="smsNotifications"
                  type="checkbox"
                  checked={formData.smsNotifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-asc-accent border-asc-border rounded focus:ring-asc-accent"
                />
                <label htmlFor="smsNotifications" className="ml-2 block text-sm text-asc-charcoal">
                  Send me SMS notifications about order status and delivery updates
                </label>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-asc-charcoal mt-6">
            Date of birth may be used for age-restricted offers or compliance where applicable.
          </p>
          
          <FormActions>
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </SecondaryButton>
          </FormActions>
        </form>
      )}
    </AccountSection>
  );
}
