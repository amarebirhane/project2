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
  Activity
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["user", "manager", "admin"] },
  { name: "My Tasks", href: "/dashboard/my-tasks", icon: CheckSquare, roles: ["user", "manager", "admin"] },
  { name: "Team Analytics", href: "/dashboard/team", icon: TrendingUp, roles: ["manager", "admin"] },
  { name: "Profile", href: "/profile", icon: User, roles: ["user", "manager", "admin"] }, // Added Profile link
  { name: "Security", href: "/settings/password", icon: Settings, roles: ["user", "manager", "admin"] }, // Added Security link
  { name: "System Health", href: "/dashboard/admin", icon: PieChart, roles: ["admin"] },
  { name: "Platform Users", href: "/users", icon: Users, roles: ["admin"] },
  { name: "Audit Logs", href: "/dashboard/audit-logs", icon: Activity, roles: ["admin"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(true);

  if (!user) return null;

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className={clsx(
      "fixed left-0 top-0 z-40 h-screen transition-transform bg-white border-r border-slate-200",
      isOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full md:translate-x-0"
    )}>
      <div className="h-full px-3 py-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-10 px-2">
          <Link href="/dashboard" className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-2">
              <CheckSquare className="text-white h-5 w-5" />
            </div>
            {isOpen && <span className="text-xl font-bold text-slate-900">TaskMind</span>}
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-slate-500 hover:text-slate-900">
            {isOpen ? <X /> : <Menu />}
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
                    ? "bg-primary-50 text-primary-600" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
            className="flex items-center p-2 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
          >
            <Settings className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
            {isOpen && <span className="ml-3">Settings</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
