import { type FormEvent, useState, useTransition } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "@/api/client";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await register({
          displayName: String(formData.get("displayName") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
          avatarUrl: String(formData.get("avatarUrl") ?? "") || null
        });

        navigate("/profile", { replace: true });
      } catch (submissionError) {
        setError(
          submissionError instanceof ApiError
            ? submissionError.message
            : "No se pudo completar el registro."
        );
      }
    });
  };

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center">
      <AuthFormCard
        title="Crear cuenta"
        description="Crea tu cuenta para guardar valoraciones, comentar y acceder a tu perfil."
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="displayName">Nombre</Label>
            <Input autoComplete="name" id="displayName" name="displayName" placeholder="Tu nombre" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input autoComplete="email" id="email" name="email" placeholder="user@example.com" required type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input autoComplete="new-password" id="password" minLength={6} name="password" placeholder="Mínimo 6 caracteres" required type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input id="avatarUrl" name="avatarUrl" placeholder="https://..." type="url" />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="w-full" disabled={isPending} type="submit">
            {isPending ? "Creando cuenta..." : "Registrarme"}
          </Button>
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link className="font-medium text-primary hover:underline" to="/login">
              Inicia sesión
            </Link>
          </p>
        </form>
      </AuthFormCard>
    </div>
  );
}
