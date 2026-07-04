import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-lg place-items-center">
      <Card className="w-full border-border/70 bg-card/85 text-center">
        <CardHeader>
          <CardTitle>Route not found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">The page you are looking for does not exist.</p>
          <Button asChild>
            <Link to="/">Back home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
