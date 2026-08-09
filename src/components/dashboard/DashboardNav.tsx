import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookOpen,
  Award,
  CalendarDays,
  LayoutGrid,
  Home,
  Bell,
  Search,
  Menu,
  X,
  User,
  History,
  Settings,
  LogOut,
  Route as RouteIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "الرئيسية", icon: Home, exact: true },
  { to: "/dashboard/learning", label: "تعلّمي", icon: BookOpen },
  { to: "/dashboard/paths", label: "مسارات التعلم", icon: RouteIcon },
  { to: "/dashboard/sessions", label: "الجلسات المباشرة", icon: CalendarDays },
  { to: "/dashboard/catalogue", label: "الفهرس", icon: LayoutGrid },
  { to: "/dashboard/certificates", label: "شهاداتي", icon: Award },
] as const;

export function DashboardNav({
  displayName,
  notifications = [],
}: {
  displayName: string;
  notifications?: { id: string; text: string }[];
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = displayName.trim().slice(0, 2);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  return (
    <header dir="rtl" className="sticky top-0 z-40 border-b border-white/10 bg-[#0A1A0E] text-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-[12px]">أق</span>
          <span className="text-sm">أكاديمية أقلع</span>
        </Link>

        <nav className="mr-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[13px] transition-colors",
                isActive(item.to, "exact" in item ? item.exact : false)
                  ? "bg-white/15 font-semibold text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1">
          <Link
            to="/dashboard/catalogue"
            aria-label="ابحث عن دورة"
            className="grid h-9 w-9 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Search className="h-4 w-4" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="الإشعارات"
              className="relative grid h-9 w-9 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                  لا توجد إشعارات جديدة.
                </div>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem key={n.id} className="whitespace-normal text-xs leading-6">
                    {n.text}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="حساب المتعلم"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-[11px] font-semibold"
            >
              {initials || <User className="h-4 w-4" />}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/profile"><User className="ms-0 me-2 h-4 w-4" />الملف الشخصي</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/history"><History className="me-2 h-4 w-4" />سجل التدريب</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/certificates"><Award className="me-2 h-4 w-4" />شهاداتي</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/profile"><Settings className="me-2 h-4 w-4" />الإعدادات</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="me-2 h-4 w-4" />تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            aria-label="القائمة"
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg text-white/80 hover:bg-white/10 lg:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-white/10 px-3 pb-3 pt-2 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px]",
                  isActive(item.to, "exact" in item ? item.exact : false)
                    ? "bg-white/15 font-semibold"
                    : "bg-white/5 text-white/80",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
