import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks/use-auth";

export function AdminRoute() {
  const { isAdmin, isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
}

