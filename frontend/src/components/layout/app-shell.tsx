import { Film, LogOut, Menu, ShieldCheck, UserRound } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

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
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const publicLinks = [
  { to: "/", label: "Catalogo", icon: Film }
];

const protectedLinks = [
  { to: "/profile", label: "Perfil", icon: UserRound }
];

const adminLinks = [
  { to: "/admin/movies", label: "Admin Movies", icon: Film },
  { to: "/admin/reviews", label: "Admin Reviews", icon: ShieldCheck }
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
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            )
          }
        >
          <Icon className="size-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppShell() {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
      <header className="sticky top-4 z-20 rounded-[24px] border border-border/70 bg-background/95 p-3 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="md:hidden" size="icon" variant="outline">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="space-y-5 pt-8">
                  <Link className="text-lg font-semibold tracking-tight" to="/">
                    Movie Catalog
                  </Link>
                  <NavigationLinks mobile />
                </div>
              </SheetContent>
            </Sheet>
            <Link className="text-lg font-semibold tracking-tight text-foreground" to="/">
              Movie Catalog
            </Link>
          </div>

          <div className="hidden md:block">
            <NavigationLinks />
          </div>

          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Button asChild size="sm" variant="ghost">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">Registro</Link>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="h-auto rounded-full px-2 py-1.5" variant="ghost">
                    <Avatar className="size-9">
                      <AvatarImage alt={user?.displayName} src={user?.avatarUrl ?? undefined} />
                      <AvatarFallback>
                        {user?.displayName.slice(0, 2).toUpperCase() ?? "MC"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-left sm:block">
                      <span className="block text-sm font-medium">{user?.displayName}</span>
                      <span className="block text-xs text-muted-foreground">
                        {isAdmin ? "Administrador" : "Mi cuenta"}
                      </span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Perfil</Link>
                  </DropdownMenuItem>
                  {isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/movies">Panel admin</Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 size-4" />
                    Cerrar sesion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <Outlet />
      </main>

      <Separator />
      <footer className="py-6 text-sm text-muted-foreground">
        Movie Catalog
      </footer>
    </div>
  );
}
