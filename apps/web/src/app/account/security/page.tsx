"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api";
import {
  AccountSection,
  Field,
  FormActions,
  Input,
  PrimaryButton,
  SecondaryButton,
} from "@/components/account-section";

interface SecuritySettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
  passwordLastChanged: string;
  activeSessions: ActiveSession[];
  isTwoFactorEnabled: boolean;
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}



export default function AccountSecurityPage() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [show2FAForm, setShow2FAForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ secret: string, qrCodeUrl: string } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSecuritySettings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const [settingsRes, sessionsRes] = await Promise.all([
          apiClient.request<any>("/api/v1/auth/security/settings"),
          apiClient.request<any>("/api/v1/auth/sessions"),
        ]);

        setSettings({
          emailNotifications: settingsRes?.settings?.emailNotifications || false,
          smsNotifications: settingsRes?.settings?.smsNotifications || false,
          sessionTimeout: settingsRes?.settings?.sessionTimeout || 30,
          loginAlerts: settingsRes?.settings?.loginAlerts || false,
          passwordLastChanged: settingsRes?.passwordChangedAt || "",
          activeSessions: sessionsRes || [],
          isTwoFactorEnabled: settingsRes?.isTwoFactorEnabled || false,
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load security settings. Please try again.");
        setLoading(false);
      }
    };

    fetchSecuritySettings();
  }, [user]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      await apiClient.request("/api/v1/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      setSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
      
      if (settings) {
        setSettings({
          ...settings,
          passwordLastChanged: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      setError("Failed to change password. Please check your current password and try again.");
    }
  };

  const handleGenerate2FA = async () => {
    try {
      const response = await apiClient.request<any>("/api/v1/auth/2fa/generate", {
        method: "POST"
      });
      setTwoFactorSetup({ secret: response.secret, qrCodeUrl: response.qrCodeUrl });
      setShow2FAForm(true);
    } catch (err) {
      setError("Failed to generate 2FA credentials.");
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.request("/api/v1/auth/2fa/verify", {
        method: "POST",
        body: JSON.stringify({ code: twoFactorCode })
      });
      setSuccess("Two-Factor Authentication is now actively protecting your account!");
      setShow2FAForm(false);
      setTwoFactorSetup(null);
      if (settings) setSettings({ ...settings, isTwoFactorEnabled: true });
    } catch (err) {
      setError("Failed to verify code. It may have expired, or time is out of sync.");
    }
  };

  const handleSettingChange = async (key: keyof SecuritySettings, value: any) => {
    if (!settings) return;
    
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await apiClient.request("/api/v1/auth/security/settings", {
        method: "PUT",
        body: JSON.stringify({ [key]: value })
      });
    } catch {
      setError("Failed to update security settings.");
      setSettings(settings); // revert UI
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!settings) return;

    try {
      await apiClient.request(`/api/v1/auth/sessions/${sessionId}`, {
        method: "DELETE",
      });

      setSettings({
        ...settings,
        activeSessions: settings.activeSessions.filter(session => session.id !== sessionId),
      });
      
      setSuccess("Session revoked successfully");
    } catch (err) {
      setError("Failed to revoke session.");
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm("Are you sure you want to revoke all other sessions? You will be logged out from all devices except this one.")) return;

    if (!settings) return;

    try {
      await apiClient.request("/api/v1/auth/sessions", {
        method: "DELETE",
      });

      setSettings({
        ...settings,
        activeSessions: settings.activeSessions.filter(session => session.isCurrent),
      });
      
      setSuccess("All other sessions revoked successfully");
    } catch (err) {
      setError("Failed to revoke sessions.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) return;

    try {
      const response = await fetch("/api/v1/auth/account", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}`,
        },
      });

      if (response.ok) {
        logout();
        window.location.href = "/";
      } else {
        setError("Failed to delete account. Please try again.");
      }
    } catch (err) {
      setError("Failed to delete account.");
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <p className="text-asc-charcoal">
            Please <a href="/auth/login" className="text-asc-accent hover:text-asc-matte transition-colors">sign in</a> to manage your security settings.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <AccountSection
        title="Security settings"
        description="Manage your account security and privacy settings."
      >
        <div className="text-center py-8">
          <p className="text-asc-charcoal">Loading security settings...</p>
        </div>
      </AccountSection>
    );
  }

  if (!settings) {
    return (
      <AccountSection
        title="Security settings"
        description="Manage your account security and privacy settings."
      >
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          Failed to load security settings.
        </div>
      </AccountSection>
    );
  }

  return (
    <AccountSection
      title="Security settings"
      description="Manage your account security and privacy settings."
    >
      <div className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* Password Section */}
        <div className="border border-asc-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-asc-matte mb-4">Password</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-asc-charcoal">Last changed: {settings.passwordLastChanged ? new Date(settings.passwordLastChanged).toLocaleDateString() : "Never"}</p>
                <p className="text-sm text-asc-charcoal">Keep your password secure and change it regularly</p>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-asc-accent hover:text-asc-matte transition-colors"
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="space-y-4 border-t border-asc-border pt-4">
                <Field label="Current password" htmlFor="currentPassword">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                </Field>
                <Field label="New password" htmlFor="newPassword">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password (min. 8 characters)"
                  />
                </Field>
                <Field label="Confirm new password" htmlFor="confirmPassword">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </Field>
                <FormActions>
                  <PrimaryButton type="submit">Update Password</PrimaryButton>
                  <SecondaryButton type="button" onClick={() => setShowPasswordForm(false)}>
                    Cancel
                  </SecondaryButton>
                </FormActions>
              </form>
            )}
          </div>
        </div>

        {/* 2FA Section */}
        <div className="border border-asc-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-asc-matte mb-4">Authenticator App (2FA)</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-asc-charcoal flex items-center gap-2">
                  Status: 
                  {settings.isTwoFactorEnabled ? (
                    <span className="text-green-700 font-semibold bg-green-100 px-2 py-0.5 rounded-full text-xs uppercase">Protected</span>
                  ) : (
                    <span className="text-yellow-700 font-semibold bg-yellow-100 px-2 py-0.5 rounded-full text-xs uppercase">Unprotected</span>
                  )}
                </p>
                <p className="text-sm text-asc-charcoal mt-1">Bind this account to Google Authenticator or an equivalent time-based key generator to prevent credential hijacking.</p>
              </div>
              {!settings.isTwoFactorEnabled && (
                <button
                  onClick={() => show2FAForm ? setShow2FAForm(false) : handleGenerate2FA()}
                  className="text-asc-accent hover:text-asc-matte transition-colors font-medium whitespace-nowrap ml-4"
                >
                  {show2FAForm ? "Cancel" : "Setup Authenticator"}
                </button>
              )}
            </div>

            {show2FAForm && twoFactorSetup && (
              <form onSubmit={handleVerify2FA} className="space-y-6 border-t border-asc-border pt-6 mt-4">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="bg-white p-2 border-2 border-asc-border rounded-xl">
                    <img src={twoFactorSetup.qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 object-contain" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-asc-matte mb-2">Configure Tracking App</h4>
                    <ul className="list-decimal list-inside text-sm text-asc-charcoal space-y-2 mb-6">
                      <li>Download Google Authenticator or Authy.</li>
                      <li>Scan the QR code block visually.</li>
                      <li>Alternatively, bind via manual string: <code className="bg-asc-sand px-1.5 py-0.5 rounded text-asc-matte ml-1 select-all">{twoFactorSetup.secret}</code></li>
                      <li>Enter the rotating 6-digit pin generated by your app below.</li>
                    </ul>
                    
                    <Field label="Verification Code" htmlFor="twoFactorCode">
                      <Input
                        id="twoFactorCode"
                        type="text"
                        maxLength={6}
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="000000"
                        className="text-center tracking-widest text-lg font-mono"
                      />
                    </Field>
                  </div>
                </div>
                
                <FormActions>
                  <PrimaryButton type="submit" disabled={twoFactorCode.length !== 6}>Verify & Enable</PrimaryButton>
                  <SecondaryButton type="button" onClick={() => setShow2FAForm(false)}>
                    Cancel
                  </SecondaryButton>
                </FormActions>
              </form>
            )}
          </div>
        </div>

        {/* Active Sessions */}
        <div className="border border-asc-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-asc-matte">Active Sessions</h3>
            <button
              onClick={handleRevokeAllSessions}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Revoke All Other Sessions
            </button>
          </div>
          
          <div className="space-y-4">
            {settings.activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-asc-canvas border border-asc-border rounded-md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-asc-border rounded-full flex items-center justify-center">
                    {session.device.includes("iPhone") ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-asc-matte">
                      {session.device} • {session.browser}
                    </p>
                    <p className="text-sm text-asc-charcoal">
                      {session.location} • {session.ipAddress}
                    </p>
                    <p className="text-xs text-asc-charcoal">
                      Last active: {new Date(session.lastActive).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {session.isCurrent && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Current session
                    </span>
                  )}
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Actions */}
        <div className="border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-asc-matte">Delete Account</p>
                <p className="text-sm text-asc-charcoal">Permanently delete your account and all data</p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </AccountSection>
  );
}
