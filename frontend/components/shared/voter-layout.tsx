"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, Vote } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VoterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();

  const handleLogout = async () => {
    // Clear store
    logout(); // Clear store
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <Vote className="h-8 w-8 text-blue-600 mr-2" />
                <span className="font-bold text-xl text-slate-900">
                  Election Online
                </span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/vote"
                  className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  คูหาเลือกตั้ง
                </Link>
                <Link
                  href="/results"
                  className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  ผลการเลือกตั้ง
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-medium text-slate-900">
                      {user.full_name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {user.constituency_id
                        ? `เขตเลือกตั้งที่ ${user.constituency_id}`
                        : "ไม่ระบุเขต"}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5 text-slate-500 hover:text-red-500" />
                  </Button>
                </div>
              ) : (
                <Link href="/auth">
                  <Button>เข้าสู่ระบบ / ลงทะเบียน</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
