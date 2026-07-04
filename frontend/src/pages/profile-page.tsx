import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <Card className="border-border/70 bg-card/85">
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Consulta los datos básicos de tu cuenta.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/70 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Nombre</p>
          <p className="mt-2 text-sm font-medium text-foreground">{user?.displayName}</p>
        </div>
        <div className="rounded-2xl border border-border/70 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Email</p>
          <p className="mt-2 text-sm font-medium text-foreground">{user?.email}</p>
        </div>
        <div className="rounded-2xl border border-border/70 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Cuenta</p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {user?.role === "ADMIN" ? "Administrador" : "Usuario"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
