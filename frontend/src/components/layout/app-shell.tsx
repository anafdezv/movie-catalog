import { LogOut, Menu } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { BrandMark } from "@/components/layout/brand-mark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getInitials } from "@/lib/movie-presentation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const publicLinks = [
  { to: "/", label: "Catalog" }
];

const protectedLinks = [
  { to: "/profile", label: "My Cabin" }
];

const adminLinks = [
  { to: "/admin/movies", label: "Crew Panel" }
];

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const links = [
    ...publicLinks,
    ...(isAuthenticated ? protectedLinks : []),
    ...(isAdmin ? adminLinks : [])
  ];

  return (
    <nav className={cn("flex gap-2", mobile ? "flex-col" : "items-center")}>
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#1a2734] text-[#f6efe3]"
                : "text-[#b0aba4] hover:bg-white/[0.04] hover:text-[#f6efe3]"
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppShell() {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const location = useLocation();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";
  const isHomeRoute = location.pathname === "/";

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071019] text-[#f6efe3]">
      <header className="sticky top-0 z-40 bg-[#09111a]/95 backdrop-blur">
        <div className="altitude-shell">
          <div className="grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-4">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="md:hidden" size="icon" variant="outline">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 border-white/6 bg-[#0a121b] text-[#f6efe3]">
                  <div className="space-y-5 pt-8">
                    <BrandMark compact />
                    <NavigationLinks mobile />
                  </div>
                </SheetContent>
              </Sheet>
              <BrandMark compact />
            </div>

            <div className="hidden justify-center md:flex">
              <NavigationLinks />
            </div>

            <div className="flex items-center gap-4 justify-self-end">
              <div className="hidden items-center gap-3 text-[0.66rem] uppercase tracking-[0.42em] text-[#8f8a83] xl:flex">
                <span>FL 380</span>
                <span>·</span>
                <span>549 MPH</span>
              </div>
              {!isAuthenticated ? (
                <Button asChild size="sm" variant="outline">
                  <Link to="/login">Sign in</Link>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-auto rounded-full px-2 py-1.5" variant="ghost">
                      <Avatar className="size-9">
                        <AvatarImage alt={user?.displayName} src={user?.avatarUrl ?? undefined} />
                        <AvatarFallback>
                          {user ? getInitials(user.displayName) : "MC"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden text-left sm:block">
                        <span className="block text-sm font-medium text-[#f6efe3]">{user?.displayName}</span>
                        <span className="block text-xs text-[#8f8a83]">
                          {isAdmin ? "Crew access" : "Passenger"}
                        </span>
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 border-white/6 bg-[#0d1722] text-[#f6efe3]"
                  >
                    <DropdownMenuLabel>My cabin</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Profile</Link>
                    </DropdownMenuItem>
                    {isAdmin ? (
                      <DropdownMenuItem asChild>
                        <Link to="/admin/movies">Crew panel</Link>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 size-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={cn("flex-1", isHomeRoute ? "pb-10" : "py-10")}>
        {isHomeRoute ? (
          <Outlet />
        ) : (
          <div className="altitude-shell">
            <Outlet />
          </div>
        )}
      </main>

      <div className="altitude-shell">
        <Separator className="bg-white/6" />
        <footer className="flex flex-col gap-4 py-10 text-sm text-[#8f8a83] md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-[2rem] text-[#f6efe3]">Altitude</p>
            <p className="mt-2 text-[0.7rem] uppercase tracking-[0.42em]">A mockup for in-flight entertainment</p>
          </div>
          <p className="text-[0.7rem] uppercase tracking-[0.42em]">© 2026 · Gate 7 · Terminal C</p>
        </footer>
      </div>
    </div>
  );
}
