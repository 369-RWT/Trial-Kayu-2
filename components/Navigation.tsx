"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Home,
  Package,
  Factory,
  BarChart3,
  Settings,
  Menu,
  X,
  User,
  LogOut,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Production", href: "/production", icon: Factory },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Master Data", href: "/master", icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <Package className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg text-neutral-900">
                Al Fath Kayu
              </div>
              <div className="text-xs text-neutral-600">Costing System</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            {status === "authenticated" && session?.user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-32 truncate">{session.user.email}</span>
                </button>

                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <p className="text-xs text-neutral-600">Signed in as</p>
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {session.user.email}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Role: {session.user.role}
                        </p>
                      </div>
                      <Link
                        href="/auth/signout"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {status === "unauthenticated" && (
              <Link
                href="/auth/signin"
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-neutral-700 hover:bg-neutral-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-neutral-700 hover:bg-neutral-100"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Mobile User Section */}
            {status === "authenticated" && session?.user && (
              <div className="border-t border-neutral-200 mt-4 pt-4">
                <div className="px-4 py-2 mb-2">
                  <p className="text-xs text-neutral-600">Signed in as</p>
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {session.user.email}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Role: {session.user.role}
                  </p>
                </div>
                <Link
                  href="/auth/signout"
                  className="flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </Link>
              </div>
            )}

            {status === "unauthenticated" && (
              <div className="border-t border-neutral-200 mt-4 pt-4">
                <Link
                  href="/auth/signin"
                  className="flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
