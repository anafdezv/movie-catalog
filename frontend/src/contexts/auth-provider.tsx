import {
  type PropsWithChildren,
  startTransition,
  useEffect,
  useMemo,
  useState
} from "react";

import { loginRequest, registerRequest } from "@/api/auth";
import { AuthContext, type AuthContextValue } from "@/contexts/auth-context";
import type { AuthResponse, AuthUser } from "@/types/auth";

const STORAGE_KEY = "movie-catalog-auth";

const readStoredState = (): AuthResponse | null => {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthResponse;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const setAuthState = (value: AuthResponse) => {
    startTransition(() => {
      setToken(value.token);
      setUser(value.user);
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  };

  const updateUser = (value: AuthUser) => {
    startTransition(() => {
      setUser(value);
    });

    const storedState = readStoredState();

    if (!storedState) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...storedState,
        user: value
      })
    );
  };

  useEffect(() => {
    const storedState = readStoredState();

    if (storedState) {
      setToken(storedState.token);
      setUser(storedState.user);
    }

    setIsHydrated(true);
  }, []);

  const logout = () => {
    startTransition(() => {
      setToken(null);
      setUser(null);
    });

    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === "ADMIN",
      token,
      user,
      isHydrated,
      login: async (input) => {
        const response = await loginRequest(input);
        setAuthState(response);
      },
      register: async (input) => {
        const response = await registerRequest(input);
        setAuthState(response);
      },
      logout,
      setAuthState,
      updateUser
    }),
    [isHydrated, token, user]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
