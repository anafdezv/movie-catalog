import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminReviewsPage() {
  return (
    <Card className="border-border/70 bg-card/85">
      <CardHeader>
        <CardTitle>Comentarios</CardTitle>
        <CardDescription>Moderación de comentarios.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Aquí aparecerá la moderación de comentarios.
      </CardContent>
    </Card>
  );
}
