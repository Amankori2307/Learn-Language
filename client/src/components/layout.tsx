import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Layers, 
  Trophy, 
  UserCircle, 
  ShieldCheck,
  History,
  LogOut, 
  Menu,
  Moon,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { buildAvatarUrl } from "@/lib/avatar";
import { UserTypeEnum } from "@shared/domain/enums";

function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  const fromNames = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  if (fromNames) {
    return fromNames
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (email?.[0] ?? "U").toUpperCase();
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Clusters', href: '/clusters', icon: Layers },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Profile', href: '/profile', icon: UserCircle },
    { name: 'History', href: '/history', icon: History },
    ...((user?.role === UserTypeEnum.REVIEWER || user?.role === UserTypeEnum.ADMIN)
      ? [{ name: "Review", href: "/review", icon: ShieldCheck }]
      : []),
  ];
  const avatarUrl = buildAvatarUrl({
    profileImageUrl: user?.profileImageUrl,
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
  });

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Learn Telugu</h1>
            <p className="text-sm text-muted-foreground mt-1">Language Practice</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme((resolvedTheme ?? "light") === "dark" ? "light" : "dark")}
          >
            {mounted && resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-foreground text-background" 
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-background" : "group-hover:text-foreground transition-colors")} />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-border/50 bg-secondary/30">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={avatarUrl} alt={user?.firstName || "User"} />
            <AvatarFallback>{getInitials(user?.firstName, user?.lastName, user?.email)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.firstName || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card fixed h-full z-10">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-md border-b border-border/60 z-20 flex items-center justify-between px-4">
        <h1 className="text-xl font-semibold text-foreground">Learn Telugu</h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme((resolvedTheme ?? "light") === "dark" ? "light" : "dark")}
          >
            {mounted && resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="container max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
