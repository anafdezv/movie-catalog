import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminMoviesPage() {
  return (
    <Card className="border-border/70 bg-card/85">
      <CardHeader>
        <CardTitle>Peliculas</CardTitle>
        <CardDescription>Gestión de películas.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Aquí aparecerá la gestión de películas.
      </CardContent>
    </Card>
  );
}
