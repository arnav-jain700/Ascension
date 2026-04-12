"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  TagIcon
} from "@heroicons/react/24/outline";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

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

  const navigationGroups = [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", href: "/admin", icon: HomeIcon },
        { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
        { name: "Abandoned Carts", href: "/admin/abandoned-carts", icon: ShoppingBagIcon },
      ]
    },
    {
      title: "Catalog",
      items: [
        { name: "Products", href: "/admin/products", icon: ShoppingBagIcon },
      ]
    },
    {
      title: "CRM & Accounting",
      items: [
        { name: "Orders", href: "/admin/orders", icon: ShoppingBagIcon },
        { name: "Customers", href: "/admin/customers", icon: UsersIcon },
      ]
    },
    {
      title: "Marketing",
      items: [
        { name: "Promotions", href: "/admin/marketing", icon: TagIcon },
      ]
    },
    {
      title: "System",
      items: [
        { name: "Settings", href: "/admin/settings", icon: CogIcon },
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-asc-canvas">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-asc-matte"></div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
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
              title="Close sidebar"
            >
              <XMarkIcon className="h-6 w-6 text-asc-charcoal" />
            </button>
          </div>
          <nav className="p-4">
            {navigationGroups.map((group) => (
              <div key={group.title} className="mb-4">
                <h3 className="px-3 text-xs font-semibold text-asc-charcoal uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
                {group.items.map((item) => (
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
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 ${desktopSidebarOpen ? 'lg:w-64' : 'lg:w-20'} lg:bg-white lg:border-r lg:border-asc-border transition-all duration-300 z-50`}>
        <div className={`flex items-center ${desktopSidebarOpen ? 'justify-between' : 'justify-center'} p-6 border-b border-asc-border`}>
          {desktopSidebarOpen && <h2 className="text-xl font-bold text-asc-matte overflow-hidden whitespace-nowrap">Ascension</h2>}
          <button 
            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
            className="p-1 rounded-md hover:bg-asc-sand-muted text-asc-charcoal"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
        <nav className="p-4 overflow-y-auto overflow-x-hidden h-full pb-20">
          {navigationGroups.map((group) => (
            <div key={group.title} className="mb-6">
              {desktopSidebarOpen && (
                <h3 className="px-3 text-xs font-semibold text-asc-charcoal uppercase tracking-wider mb-2 whitespace-nowrap">
                  {group.title}
                </h3>
              )}
              {group.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center ${desktopSidebarOpen ? 'px-3' : 'justify-center'} py-3 rounded-md text-sm font-medium text-asc-charcoal hover:text-asc-matte hover:bg-asc-sand-muted mb-1 transition-colors group`}
                  title={!desktopSidebarOpen ? item.name : undefined}
                >
                  <item.icon className={`${desktopSidebarOpen ? 'mr-3' : ''} h-5 w-5 flex-shrink-0 group-hover:text-asc-accent transition-colors`} />
                  {desktopSidebarOpen && <span className="whitespace-nowrap">{item.name}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${desktopSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-asc-border">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-asc-sand-muted"
              title="Open sidebar"
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
