"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  PieChart,
  Settings,
  Menu,
  X,
  TrendingUp,
  User,
  Activity,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["user", "manager", "admin"] },
  { name: "My Tasks", href: "/dashboard/my-tasks", icon: CheckSquare, roles: ["user", "manager", "admin"] },
  { name: "Team Analytics", href: "/dashboard/team", icon: TrendingUp, roles: ["manager", "admin"] },
  { name: "Profile", href: "/profile", icon: User, roles: ["user", "manager", "admin"] }, // Added Profile link
  { name: "System Health", href: "/dashboard/admin", icon: PieChart, roles: ["admin"] },
  { name: "Platform Users", href: "/users", icon: Users, roles: ["admin"] },
  { name: "Audit Logs", href: "/dashboard/audit-logs", icon: Activity, roles: ["admin"] },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className={clsx(
      "fixed left-0 top-0 z-40 h-screen transition-transform bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800",
      isOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full md:translate-x-0"
    )}>
      <div className="h-full px-3 py-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-10 px-2 text-slate-900 dark:text-slate-100">
          <Link href="/dashboard" className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-2">
              <CheckSquare className="text-white h-5 w-5" />
            </div>
            {isOpen && <span className="text-xl font-bold text-slate-900 dark:text-slate-100">TaskMind</span>}
          </Link>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all border border-slate-200 dark:border-slate-700"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        <nav className="space-y-2 font-medium">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center p-2 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <Icon className={clsx("h-5 w-5", isActive ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600")} />
                {isOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 w-full px-3">
          <Link
            href="/settings"
            className="flex items-center p-2 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200"
          >
            <Settings className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
            {isOpen && <span className="ml-3">Settings</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
