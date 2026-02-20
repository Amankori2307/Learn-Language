import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color?: "primary" | "accent" | "blue" | "orange";
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, color = "primary", className }: StatCardProps) {
  const colors = {
    primary: "bg-secondary text-foreground border-border",
    accent: "bg-secondary text-foreground border-border",
    blue: "bg-secondary text-foreground border-border",
    orange: "bg-secondary text-foreground border-border",
  };

  return (
    <div className={cn(
      "bg-card rounded-xl p-4 border border-border/60 transition-colors duration-200",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <h3 className="text-2xl font-semibold mt-1 tracking-tight">{value}</h3>
          {trend && (
            <p className="text-xs font-medium text-muted-foreground mt-1 flex items-center gap-1">
              {trend}
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg border", colors[color])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
