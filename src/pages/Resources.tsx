import { Protected } from "@/lib/protected-page";
import { ResourceBrowser } from "@/components/ResourceBrowser";
import { motion } from "framer-motion";

export default function Resources() {
    return (
        <Protected>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto py-8"
            >
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight">Resource Library</h1>
                        <p className="text-xl text-muted-foreground">
                            Explore curated physics resources, guides, and videos to aid your learning.
                        </p>
                    </div>
                    <ResourceBrowser />
                </div>
            </motion.div>
        </Protected>
    );
}
