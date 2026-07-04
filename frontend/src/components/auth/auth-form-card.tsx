import { type ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthFormCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthFormCard({ title, description, children }: AuthFormCardProps) {
  return (
    <Card className="w-full border-border/70 bg-card/85 shadow-sm backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

