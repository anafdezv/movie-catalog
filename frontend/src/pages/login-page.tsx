import { type FormEvent, useState, useTransition } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { ApiError } from "@/api/client";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      try {
        await login({ email, password });
        navigate(from, { replace: true });
      } catch (submissionError) {
        setError(
          submissionError instanceof ApiError
            ? submissionError.message
            : "No se pudo iniciar sesion."
        );
      }
    });
  };

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center">
      <AuthFormCard
        title="Entrar"
        description="Inicia sesion para comentar peliculas, puntuar y acceder a tu perfil."
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input autoComplete="email" id="email" name="email" placeholder="demo@moviecatalog.dev" required type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input autoComplete="current-password" id="password" name="password" placeholder="Tu contraseña" required type="password" />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="w-full" disabled={isPending} type="submit">
            {isPending ? "Entrando..." : "Iniciar sesion"}
          </Button>
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link className="font-medium text-primary hover:underline" to="/register">
              Regístrate
            </Link>
          </p>
        </form>
      </AuthFormCard>
    </div>
  );
}
