import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex min-h-screen min-h-dvh w-full items-center justify-center bg-background px-4">
      <Card className="mx-4 w-full max-w-md border-border/60 bg-card/95 [box-shadow:var(--shadow-lg)]">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full surface-status-error">
              <AlertCircle className="h-12 w-12 text-status-error opacity-90" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
            <p className="text-muted-foreground">
              Oops! The page you're looking for seems to have wandered off.
            </p>
          </div>

          <Link href="/">
            <Button className="w-full">Return Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
