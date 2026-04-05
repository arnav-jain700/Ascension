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
  Select,
} from "@/components/account-section";

export default function AccountProfilePage() {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: "",
        dateOfBirth: "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement profile update API call
      const response = await fetch("/api/v1/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
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

  return (
    <AccountSection
      title="Profile & details"
      description="Update your personal information."
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

      <form onSubmit={handleSubmit} className="space-y-8">
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
        
        <p className="text-xs text-asc-charcoal">
          Date of birth may be used for age-restricted offers or compliance where applicable.
        </p>
        
        <FormActions>
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </PrimaryButton>
        </FormActions>
      </form>
    </AccountSection>
  );
}
