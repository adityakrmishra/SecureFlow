
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  GitPullRequest, 
  ShieldAlert, 
  Settings, 
  History, 
  Package,
  FileCode,
  Lock
} from "lucide-react";

const NAV_ITEMS = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Repositories', href: '/dashboard/repos', icon: Package },
  { name: 'Pull Requests', href: '/dashboard/prs', icon: GitPullRequest },
  { name: 'Findings', href: '/dashboard/findings', icon: ShieldAlert },
  { name: 'Policies', href: '/dashboard/policies', icon: Lock },
  { name: 'Audit Logs', href: '/dashboard/audit', icon: History },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/5 bg-sidebar min-h-screen p-6 flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-primary">
          <ShieldAlert className="text-background w-5 h-5" />
        </div>
        <span className="font-headline font-bold text-lg tracking-tight">SecureFlow</span>
      </div>
      
      <nav className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">Main Menu</p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
          <div className="text-xs font-bold mb-1">Developer Plan</div>
          <div className="text-[10px] text-muted-foreground mb-3">1,248 / 5,000 scans</div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '25%' }} />
          </div>
        </div>
        <button className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-white w-full">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}

export function DashboardHeader() {
  return (
    <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between glass-card sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          <span className="text-white font-medium">Organization</span> / Acme Corp
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <input 
            className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-primary/30" 
            placeholder="Search PRs, repos..."
          />
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold">
          JD
        </div>
      </div>
    </header>
  );
}

import { Search } from "lucide-react";
