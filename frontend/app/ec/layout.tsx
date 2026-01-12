"use client";

import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { Flag, LayoutDashboard, LogOut, Settings2, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ECLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore error if logout fails
    }
    setUser(null);
    router.push("/auth");
  };

  // Basic role check
  useEffect(() => {
    // In real app, strict check here
  }, [user, router]);

  const navItems = [
    { href: "/ec/dashboard", label: "ภาพรวม", icon: LayoutDashboard },
    { href: "/ec/parties", label: "จัดการพรรคการเมือง", icon: Flag },
    { href: "/ec/candidates", label: "จัดการผู้สมัคร", icon: Users },
    { href: "/ec/control", label: "ควบคุมการเลือกตั้ง", icon: Settings2 },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 hidden md:block">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-900">EC Panel</h1>
          <p className="text-sm text-neutral-500">คณะกรรมการการเลือกตั้ง</p>
        </div>
        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-neutral-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            ออกจากระบบ
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
