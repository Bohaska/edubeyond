import {
  BarChart,
  BookOpen,
  BrainCircuit,
  FlaskConical,
  Home,
  MessageSquare,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { UserButton } from "../auth/UserButton";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/problem-solver", icon: FlaskConical, label: "Problem Solver" },
  { href: "/question-generator", icon: BrainCircuit, label: "Generator" },
  { href: "/tutor", icon: MessageSquare, label: "AI Tutor" },
  { href: "/resources", icon: BookOpen, label: "Resources" },
  { href: "/analytics", icon: BarChart, label: "Analytics" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-16 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:w-64">
      <div className="flex items-center justify-center border-b border-sidebar-border p-4 md:justify-start">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-8" />
          <span className="hidden font-bold md:inline">Physics AI</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md p-3 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              location.pathname === item.href
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground",
            )}
          >
            <item.icon className="h-6 w-6 md:h-5 md:w-5" />
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <UserButton />
      </div>
    </aside>
  );
}
