import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Link } from "react-router";

export function Fab() {
  return (
    <motion.div
      initial={{ scale: 0, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <Button asChild size="lg" className="h-16 w-16 rounded-full shadow-lg">
        <Link to="/problem-solver">
          <Plus className="h-8 w-8" />
          <span className="sr-only">Generate Problem</span>
        </Link>
      </Button>
    </motion.div>
  );
}
