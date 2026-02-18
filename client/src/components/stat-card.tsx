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
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    orange: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  };

  return (
    <div className={cn(
      "bg-card rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
          {trend && (
            <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
              {trend}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl border", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
