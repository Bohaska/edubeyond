import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, BookCopy, LineChart, Loader2, Zap } from "lucide-react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Greeting Card Component
function GreetingCard({ name, streak }: { name: string; streak: number }) {
  return (
    <Card className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back, {name}!</CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Let's keep the momentum going.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6" />
          <div>
            <p className="font-bold text-xl">{streak}</p>
            <p className="text-sm">Day Streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Continue Card Component
function QuickContinueCard({ problemId, title }: { problemId?: string, title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookCopy className="h-5 w-5 text-muted-foreground" />
          <span>Continue Where You Left Off</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          You were last working on:
        </p>
        <h3 className="font-semibold mb-4">{title}</h3>
        <Button asChild disabled={!problemId}>
          <Link to={`/problem-solver?id=${problemId}`}>
            Jump Back In <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// Performance Sparklines Card Component
function PerformanceSparklines({
  mastery,
}: {
  mastery?: { mechanics: number; e_and_m: number };
}) {
  const performanceData = [
    { name: "Unit 1: Mechanics", mastery: mastery?.mechanics ?? 0 },
    { name: "Unit 2: E&M", mastery: mastery?.e_and_m ?? 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>
          Your mastery level across different units.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {performanceData.map((unit) => (
          <div key={unit.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{unit.name}</span>
              <span className="text-muted-foreground">{unit.mastery}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${unit.mastery}%` }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const lastProblem = useQuery(api.questions.getById, user?.lastProblemId ? { id: user.lastProblemId } : "skip");

  if (isLoading || user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (user === null) {
    // This case should ideally be handled by the AppLayout's Protected component
    return <p>Please sign in.</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <GreetingCard name={user.name ?? "User"} streak={user.streak ?? 0} />
        </div>
        <div className="lg:col-span-2">
          <QuickContinueCard 
            problemId={user.lastProblemId}
            title={lastProblem?.questionText ?? "No recent problems"}
          />
        </div>
        <div>
          <PerformanceSparklines mastery={user.mastery} />
        </div>
      </div>
    </motion.div>
  );
}