"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  AccountSection,
  Field,
  FormActions,
  Input,
  PrimaryButton,
  SecondaryButton,
} from "@/components/account-section";

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
  passwordLastChanged: string;
  activeSessions: ActiveSession[];
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

const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  emailNotifications: true,
  smsNotifications: false,
  sessionTimeout: 30,
  loginAlerts: true,
  passwordLastChanged: "2024-01-15",
  activeSessions: [
    {
      id: "1",
      device: "Windows PC",
      browser: "Chrome 120",
      location: "Mumbai, India",
      ipAddress: "192.168.1.1",
      lastActive: "2024-01-25T10:30:00Z",
      isCurrent: true,
    },
    {
      id: "2",
      device: "iPhone 14",
      browser: "Safari 17",
      location: "Delhi, India",
      ipAddress: "192.168.1.2",
      lastActive: "2024-01-24T15:45:00Z",
      isCurrent: false,
    },
  ],
};

export default function AccountSecurityPage() {
  const { user } = useAuth();
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
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSecuritySettings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // TODO: Implement actual API call
        // const response = await fetch("/api/v1/security/settings", {
        //   headers: {
        //     "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}`,
        //   },
        // });
        
        // Simulate API call with mock data
        setTimeout(() => {
          setSettings(mockSecuritySettings);
          setLoading(false);
        }, 1000);
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
      // TODO: Implement actual API call
      // const response = await fetch("/api/v1/security/change-password", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}`,
      //   },
      //   body: JSON.stringify({
      //     currentPassword: passwordData.currentPassword,
      //     newPassword: passwordData.newPassword,
      //   }),
      // });

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

  const handleToggle2FA = async () => {
    if (!settings) return;

    try {
      // TODO: Implement actual API call
      // const response = await fetch("/api/v1/security/toggle-2fa", {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}`,
      //   },
      // });

      setSettings({
        ...settings,
        twoFactorEnabled: !settings.twoFactorEnabled,
      });
      
      setSuccess(
        settings.twoFactorEnabled 
          ? "Two-factor authentication disabled"
          : "Two-factor authentication enabled"
      );
    } catch (err) {
      setError("Failed to update two-factor authentication settings.");
    }
  };

  const handleSettingChange = (key: keyof SecuritySettings, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!settings) return;

    try {
      // TODO: Implement actual API call
      // const response = await fetch(`/api/v1/security/revoke-session/${sessionId}`, {
      //   method: "DELETE",
      //   headers: {
      //     "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}`,
      //   },
      // });

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
      // TODO: Implement actual API call
      // const response = await fetch("/api/v1/security/revoke-all-sessions", {
      //   method: "DELETE",
      //   headers: {
      //     "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}`,
      //   },
      // });

      setSettings({
        ...settings,
        activeSessions: settings.activeSessions.filter(session => session.isCurrent),
      });
      
      setSuccess("All other sessions revoked successfully");
    } catch (err) {
      setError("Failed to revoke sessions.");
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
                <p className="text-asc-charcoal">Last changed: {new Date(settings.passwordLastChanged).toLocaleDateString()}</p>
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

        {/* Two-Factor Authentication */}
        <div className="border border-asc-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-asc-matte mb-4">Two-Factor Authentication</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-asc-charcoal">Add an extra layer of security to your account</p>
                <p className="text-sm text-asc-charcoal">Require a verification code in addition to your password</p>
              </div>
              <button
                onClick={handleToggle2FA}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.twoFactorEnabled ? "bg-asc-accent" : "bg-asc-border"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            
            <div className={`text-sm ${settings.twoFactorEnabled ? "text-green-600" : "text-asc-charcoal"}`}>
              {settings.twoFactorEnabled ? (
                <p>✅ Two-factor authentication is enabled</p>
              ) : (
                <p>⚠️ Two-factor authentication is disabled</p>
              )}
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="border border-asc-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-asc-matte mb-4">Security Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-asc-matte">Email notifications</p>
                <p className="text-sm text-asc-charcoal">Get email alerts for security events</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange("emailNotifications", e.target.checked)}
                className="h-4 w-4 text-asc-accent border-asc-border rounded focus:ring-asc-accent"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-asc-matte">SMS notifications</p>
                <p className="text-sm text-asc-charcoal">Get SMS alerts for security events</p>
              </div>
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => handleSettingChange("smsNotifications", e.target.checked)}
                className="h-4 w-4 text-asc-accent border-asc-border rounded focus:ring-asc-accent"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-asc-matte">Login alerts</p>
                <p className="text-sm text-asc-charcoal">Get notified when someone logs into your account</p>
              </div>
              <input
                type="checkbox"
                checked={settings.loginAlerts}
                onChange={(e) => handleSettingChange("loginAlerts", e.target.checked)}
                className="h-4 w-4 text-asc-accent border-asc-border rounded focus:ring-asc-accent"
              />
            </div>
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
              <button className="px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </AccountSection>
  );
}
