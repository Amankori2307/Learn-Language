import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useStats } from "@/hooks/use-quiz";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  BrainCircuit, 
  Flame, 
  Target, 
  Zap, 
  ArrowRight, 
  BookOpen, 
  Dumbbell 
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const defaultStats = {
    totalWords: 0,
    mastered: 0,
    learning: 0,
    weak: 0,
    streak: 0,
    xp: 0
  };

  const s = stats || defaultStats;

  const cards = [
    {
      title: "Daily Review",
      description: "Review words due for repetition",
      icon: Zap,
      href: "/quiz?mode=daily_review",
      color: "bg-amber-100 text-amber-700",
      buttonColor: "bg-amber-500 hover:bg-amber-600",
      count: s.learning
    },
    {
      title: "New Words",
      description: "Learn 10 new words today",
      icon: BookOpen,
      href: "/quiz?mode=new_words",
      color: "bg-emerald-100 text-emerald-700",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700",
      count: 10
    },
    {
      title: "Weak Spots",
      description: "Practice words you struggle with",
      icon: Dumbbell,
      href: "/quiz?mode=weak_words",
      color: "bg-rose-100 text-rose-700",
      buttonColor: "bg-rose-500 hover:bg-rose-600",
      count: s.weak
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName || 'Learner'}!</h2>
            <p className="text-muted-foreground mt-1">You're making great progress with your Telugu.</p>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full border border-orange-100 shadow-sm">
            <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
            <span className="font-bold">{s.streak} Day Streak</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Total XP" 
            value={s.xp} 
            icon={Zap} 
            color="accent" 
          />
          <StatCard 
            label="Words Mastered" 
            value={s.mastered} 
            icon={Target} 
            color="primary" 
          />
          <StatCard 
            label="Learning" 
            value={s.learning} 
            icon={BrainCircuit} 
            color="blue" 
          />
          <StatCard 
            label="Needs Review" 
            value={s.weak} 
            icon={Dumbbell} 
            color="orange" 
          />
        </div>

        {/* Action Cards */}
        <h3 className="text-xl font-bold mt-8 mb-4">Start Learning</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-card rounded-3xl p-6 border border-border/50 shadow-sm hover:shadow-xl hover:border-border transition-all duration-300 flex flex-col justify-between h-64"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold">{card.title}</h4>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{card.description}</p>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                  {card.count} items
                </span>
                <Link href={card.href}>
                  <Button className={`${card.buttonColor} text-white rounded-full w-10 h-10 p-0 shadow-lg group-hover:scale-110 transition-transform`}>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
