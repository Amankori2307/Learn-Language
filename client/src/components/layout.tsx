import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Layers, 
  Trophy, 
  ShieldCheck,
  BarChart3,
  LogOut, 
  Menu,
  MessageSquare,
  PlusCircle,
  Moon,
  Sun,
  Languages,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  UserRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { buildAvatarUrl } from "@/lib/avatar";
import { LanguageEnum, UserTypeEnum } from "@shared/domain/enums";
import { useLearningLanguage } from "@/hooks/use-language";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage, options } = useLearningLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isReviewer = user?.role === UserTypeEnum.REVIEWER || user?.role === UserTypeEnum.ADMIN;
  const navigationSections = [
    {
      title: "Learn",
      items: [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Clusters", href: "/clusters", icon: Layers },
      ],
    },
    {
      title: "Insights",
      items: [
        { name: "Analytics", href: "/analytics", icon: BarChart3 },
        { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
      ],
    },
    ...(isReviewer
      ? [
          {
            title: "Review",
            items: [
              { name: "Review Vocabulary", href: "/review", icon: ShieldCheck },
              { name: "Add Vocabulary", href: "/review/add", icon: PlusCircle },
            ],
          },
        ]
      : []),
  ];

  const isItemActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location === href || location.startsWith(`${href}/`) || location.startsWith(`${href}?`);
  };
  const avatarUrl = buildAvatarUrl({
    profileImageUrl: user?.profileImageUrl,
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
  });

  const sidebarWidthClass = isCollapsed ? "w-24" : "w-72";
  const mainOffsetClass = isCollapsed ? "md:ml-24" : "md:ml-72";

  const NavContent = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex flex-col h-full">
      <div className={cn("p-4 border-b border-border/60", compact ? "pb-4" : "pb-5")}>
        <div className={cn("flex items-center", compact ? "justify-center" : "justify-between")}>
          <div className={cn("flex items-center gap-3", compact && "justify-center")}>
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary/90 to-emerald-500/80 text-primary-foreground flex items-center justify-center shadow-lg">
              <Languages className="size-5" />
            </div>
            {!compact && (
              <div>
                <h1 className="text-lg font-semibold text-foreground leading-none">Learn Language</h1>
                <p className="text-xs text-muted-foreground mt-1">Practice Hub</p>
              </div>
            )}
          </div>
          {!compact && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-lg"
              aria-label="Collapse sidebar"
              onClick={() => setIsCollapsed(true)}
            >
              <PanelLeftClose className="size-4" />
            </Button>
          )}
        </div>
        {!compact ? (
          <div className="mt-4">
            <label htmlFor="language-select" className="block text-xs font-medium text-muted-foreground mb-1">
              Learning Language
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(event) => setLanguage(event.target.value as LanguageEnum)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="w-full rounded-lg"
              aria-label="Expand sidebar"
              onClick={() => setIsCollapsed(false)}
            >
              <PanelLeftOpen className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        {navigationSections.map((section) => (
          <div key={section.title}>
            {!compact && (
              <p className="px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = isItemActive(item.href);
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      title={compact ? item.name : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent",
                        compact && "justify-center px-2",
                        isActive
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-primary" : "group-hover:text-foreground transition-colors",
                        )}
                      />
                      {!compact && <span className="font-medium text-sm">{item.name}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 mt-auto border-t border-border/60 bg-gradient-to-b from-background to-secondary/30">
        <div className={cn("grid gap-2 mb-3", compact ? "grid-cols-1" : "grid-cols-2")}>
          <a
            href="https://forms.gle/f2hH1BL3v4eNsxEg8"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center justify-center rounded-lg border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition",
              compact && "px-2",
            )}
            title="Feedback"
          >
            <MessageSquare className="size-4" />
            {!compact && (
              <>
                <span className="ml-2">Feedback</span>
                <ExternalLink className="size-3 ml-1.5 opacity-70" />
              </>
            )}
          </a>
          <Button
            type="button"
            variant="outline"
            className={cn("rounded-lg h-9 text-xs", compact && "px-2")}
            aria-label="Toggle theme"
            title="Toggle theme"
            onClick={() => setTheme((resolvedTheme ?? "light") === "dark" ? "light" : "dark")}
          >
            {mounted && resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {!compact && <span className="ml-2">Theme</span>}
          </Button>
        </div>

        <button
          type="button"
          className={cn(
            "w-full rounded-xl border border-border/70 bg-background/80 hover:bg-secondary/60 transition px-2 py-2.5 flex items-center gap-3",
            compact && "justify-center px-1",
          )}
          onClick={() => setIsProfileModalOpen(true)}
          title="Account details"
        >
          <Avatar className="w-9 h-9 border border-border/70">
            <AvatarImage src={avatarUrl} alt={user?.firstName || "User"} />
            <AvatarFallback>{getInitials(user?.firstName, user?.lastName, user?.email)}</AvatarFallback>
          </Avatar>
          {!compact && (
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-sm font-semibold truncate">{user?.firstName || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  const ProfileModal = () => (
    <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
          <DialogDescription>Manage your profile and quick preferences.</DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-border/70 p-4 bg-secondary/25">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border border-border">
              <AvatarImage src={avatarUrl} alt={user?.firstName || "User"} />
              <AvatarFallback>{getInitials(user?.firstName, user?.lastName, user?.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {user?.firstName || "User"} {user?.lastName || ""}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? "No email"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Role: {user?.role ?? UserTypeEnum.LEARNER}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/profile">
            <Button variant="outline" className="w-full rounded-lg" onClick={() => setIsProfileModalOpen(false)}>
              <UserRound className="size-4 mr-2" />
              Open Profile
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full rounded-lg"
            onClick={() => setTheme((resolvedTheme ?? "light") === "dark" ? "light" : "dark")}
          >
            {mounted && resolvedTheme === "dark" ? <Sun className="size-4 mr-2" /> : <Moon className="size-4 mr-2" />}
            Toggle Theme
          </Button>
          <a
            href="https://forms.gle/f2hH1BL3v4eNsxEg8"
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2"
          >
            <Button variant="secondary" className="w-full rounded-lg">
              <MessageSquare className="size-4 mr-2" />
              Give Feedback
            </Button>
          </a>
          <Button
            variant="destructive"
            className="col-span-2 rounded-lg"
            onClick={() => {
              setIsProfileModalOpen(false);
              logout();
            }}
          >
            <LogOut className="size-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <ProfileModal />

      {/* Desktop Sidebar */}
      <aside className={cn("hidden md:flex flex-col border-r border-border/50 bg-card fixed h-full z-10 transition-all duration-300", sidebarWidthClass)}>
        <NavContent compact={isCollapsed} />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-md border-b border-border/60 z-20 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary/90 to-emerald-500/80 text-primary-foreground flex items-center justify-center">
            <Languages className="size-4" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Learn Language</h1>
        </div>
        <div className="flex items-center gap-2">
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
      <main className={cn("flex-1 pt-16 md:pt-0 min-h-screen transition-all duration-300", mainOffsetClass)}>
        <div className="container max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
