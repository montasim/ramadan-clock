import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

export interface ScheduleCardProps {
  title: string;
  description: string;
  children: ReactNode;
  contentClassName?: string;
}

/**
 * ScheduleCard Component
 *
 * A reusable card component with consistent styling for displaying schedule-related content.
 * Uses transparent background (bg-primary/5) and border (border-primary/30) consistent with the root page.
 *
 * @param title - The card title
 * @param description - The card description
 * @param children - The content to display inside the card
 * @param contentClassName - Optional additional className for the content area
 */
export function ScheduleCard({ title, description, children, contentClassName = "" }: ScheduleCardProps) {
  return (
    <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
