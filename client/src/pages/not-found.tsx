import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4 shadow-xl border-0">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="h-20 w-20 text-red-500 opacity-20" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
            <p className="text-gray-500">
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
