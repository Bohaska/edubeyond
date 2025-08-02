// TODO: THIS IS THE DEFAULT DASHBOARD PAGE THAT THE USER WILL SEE AFTER AUTHENTICATION. ADD MAIN FUNCTIONALITY HERE.
// This is the entry point for users who have just signed in

import { Protected } from "@/lib/protected-page";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, Database } from "lucide-react";
import { Link } from "react-router";

export default function Dashboard() {
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
            <h1 className="text-4xl font-bold tracking-tight">AP Physics C Learning Hub</h1>
            <p className="text-xl text-muted-foreground">
              AI-powered question generation and dataset exploration for AP Physics C
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <Brain className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle>Question Generator</CardTitle>
                  <CardDescription>
                    Generate AI-powered AP Physics C questions with detailed solutions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/question-generator">Start Generating</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <BookOpen className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle>Question Library</CardTitle>
                  <CardDescription>
                    Browse and manage your saved questions organized by topic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/question-generator?tab=library">View Library</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <Database className="h-8 w-8 text-purple-600 mb-2" />
                  <CardTitle>Dataset Catalog</CardTitle>
                  <CardDescription>
                    Explore curated physics resources and question databases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/question-generator?tab=datasets">Explore Datasets</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Question Generation Features:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Multiple Choice Questions (MCQs) with explanations</li>
                    <li>• Free Response Questions (FRQs) with step-by-step solutions</li>
                    <li>• Adjustable difficulty levels (Easy, Medium, Hard)</li>
                    <li>• Coverage of Mechanics and E&M topics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Dataset Resources:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• OpenStax College Physics</li>
                    <li>• Khan Academy Physics</li>
                    <li>• College Board AP Physics C</li>
                    <li>• PhET Interactive Simulations</li>
                    <li>• Physics LibreTexts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </Protected>
  );
}