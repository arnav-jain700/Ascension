"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const token = localStorage.getItem("admin_token");
    const userData = localStorage.getItem("admin_user");

    if (!token || !userData) {
      router.push("/admin/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "ADMIN" && parsedUser.role !== "SUPER_ADMIN") {
        router.push("/");
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: HomeIcon,
      current: false,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: ShoppingBagIcon,
      current: false,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingBagIcon,
      current: false,
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: UsersIcon,
      current: false,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: ChartBarIcon,
      current: false,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: CogIcon,
      current: false,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-asc-canvas">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-asc-matte"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-asc-canvas">
      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-asc-charcoal/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-asc-border">
            <h2 className="text-lg font-semibold text-asc-matte">Ascension Admin</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md hover:bg-asc-sand-muted"
            >
              <XMarkIcon className="h-6 w-6 text-asc-charcoal" />
            </button>
          </div>
          <nav className="p-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-asc-charcoal hover:text-asc-matte hover:bg-asc-sand-muted mb-1"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r lg:border-asc-border">
        <div className="flex items-center justify-between p-6 border-b border-asc-border">
          <h2 className="text-xl font-bold text-asc-matte">Ascension Admin</h2>
        </div>
        <nav className="p-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-3 rounded-md text-sm font-medium text-asc-charcoal hover:text-asc-matte hover:bg-asc-sand-muted mb-1 transition-colors"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-asc-border">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-asc-sand-muted"
            >
              <Bars3Icon className="h-6 w-6 text-asc-charcoal" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-asc-charcoal">
                Welcome, <span className="font-medium text-asc-matte">{user?.name || "Admin"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-asc-charcoal hover:text-asc-matte hover:bg-asc-sand-muted rounded-md transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
