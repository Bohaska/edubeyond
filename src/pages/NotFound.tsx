import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen"
    >
      <div className="max-w-5xl mx-auto relative px-4">
        <div className="flex items-center justify-center min-h-[200px]">
          404 Page Not Found
        </div>
      </div>
    </motion.div>
  );
}