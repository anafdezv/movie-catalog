import { type FormEvent, useState, useTransition } from "react";
import { Plane } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { altitudeSkyImage } from "@/lib/movie-presentation";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const nextFieldErrors: typeof fieldErrors = {};

    if (!email) {
      nextFieldErrors.email = "Enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextFieldErrors.password = "Enter your password.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    startTransition(async () => {
      try {
        await login({ email, password });
        navigate(from, { replace: true });
      } catch (submissionError) {
        setError(
          submissionError instanceof ApiError
            ? submissionError.message
            : "Could not sign in."
        );
      }
    });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_1fr]">
      <section
        className="relative hidden overflow-hidden lg:block"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(7,16,25,0.18) 0%, rgba(7,16,25,0.48) 100%), url(${altitudeSkyImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#071019]/95 via-[#071019]/52 to-transparent" />

        <Link className="absolute left-10 top-10 inline-flex items-center gap-3" to="/">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-[#ff9d42] text-[#09111b]">
            <Plane className="size-4" />
          </span>
          <span className="font-display text-[2.15rem] leading-none tracking-[-0.05em] text-[#f6efe3]">
            Altitude
          </span>
        </Link>

        <div className="absolute bottom-12 left-10 max-w-xl space-y-6">
          <p className="altitude-eyebrow">Boarding pass</p>
          <p className="font-display text-5xl leading-tight text-[#f6efe3]">
            “The window seat is a projector,
            <br />
            and the sky does most of the work.”
          </p>
          <p className="text-[0.78rem] uppercase tracking-[0.34em] text-[#b6b0a8]">
            — Editor&apos;s letter, issue 07
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-[#071019] px-6 py-16">
        <form className="w-full max-w-md space-y-6" noValidate onSubmit={handleSubmit}>
          <Link className="altitude-kicker inline-flex items-center gap-2" to="/">
            ← Back
          </Link>

          <div className="space-y-3">
            <h1 className="font-display text-6xl tracking-[-0.06em] text-[#f6efe3]">Welcome aboard.</h1>
            <p className="max-w-md text-lg leading-8 text-[#bcb6ac]">
              Sign in with your loyalty number or email to save ratings across flights.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              aria-invalid={fieldErrors.email ? "true" : "false"}
              autoComplete="email"
              className={fieldErrors.email ? "border-[#d35f5f] focus-visible:ring-[#d35f5f]/30" : ""}
              id="email"
              name="email"
              onChange={() => {
                if (fieldErrors.email) {
                  setFieldErrors((current) => ({ ...current, email: undefined }));
                }
              }}
              placeholder="demo@moviecatalog.dev"
              type="email"
            />
            {fieldErrors.email ? <p className="text-sm text-[#f08b7c]">{fieldErrors.email}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              aria-invalid={fieldErrors.password ? "true" : "false"}
              autoComplete="current-password"
              className={fieldErrors.password ? "border-[#d35f5f] focus-visible:ring-[#d35f5f]/30" : ""}
              id="password"
              name="password"
              onChange={() => {
                if (fieldErrors.password) {
                  setFieldErrors((current) => ({ ...current, password: undefined }));
                }
              }}
              placeholder="Your password"
              type="password"
            />
            {fieldErrors.password ? <p className="text-sm text-[#f08b7c]">{fieldErrors.password}</p> : null}
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="w-full" disabled={isPending} size="lg" type="submit">
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-sm text-[#8f8a83]">
            No account?{" "}
            <Link className="font-medium text-[#f5a141] hover:underline" to="/register">
              Create one at 38,000 ft.
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
