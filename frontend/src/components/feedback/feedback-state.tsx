import { type ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeedbackStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function FeedbackState({ title, description, action }: FeedbackStateProps) {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}
