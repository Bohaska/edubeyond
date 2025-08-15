import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation, useAction } from "convex/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MessageCircle, Lightbulb, BookOpen, FileText, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function ProblemSolver() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedQuestionId, setSelectedQuestionId] = useState<Id<"questions"> | null>(null);
  const [scratchpad, setScratchpad] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [loadingHints, setLoadingHints] = useState<{ [key: number]: boolean }>({});
  const [resourceSearch, setResourceSearch] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const questions = useQuery(api.questions.list);
  const selectedQuestion = useQuery(
    api.questions.getById,
    selectedQuestionId ? { id: selectedQuestionId } : "skip"
  );
  const resources = useQuery(api.resources.list);
  const generateHint = useAction(api.ai.generateHint);
  const chatWithAI = useAction(api.ai.chatWithAI);

  const filteredResources = resources?.filter(resource =>
    resource.name.toLowerCase().includes(resourceSearch.toLowerCase()) ||
    resource.topic.toLowerCase().includes(resourceSearch.toLowerCase()) ||
    resource.type.toLowerCase().includes(resourceSearch.toLowerCase())
  );

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedQuestion) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsChatLoading(true);

    try {
      const context = {
        question: selectedQuestion.questionText,
        choices: selectedQuestion.choices,
        explanation: selectedQuestion.explanation,
        scratchpad: scratchpad
      };

      const response = await chatWithAI({
        message: userMessage,
        context: JSON.stringify(context)
      });

      setChatMessages(prev => [...prev, { role: "model", text: response ?? "No response received" }]);
    } catch (error) {
      toast.error("Failed to get AI response");
      console.error("Chat error:", error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateHint = async () => {
    if (!selectedQuestion) return;

    const hintIndex = hints.length;
    setLoadingHints(prev => ({ ...prev, [hintIndex]: true }));

    try {
      const context = {
        question: selectedQuestion.questionText,
        choices: selectedQuestion.choices,
        explanation: selectedQuestion.explanation,
        scratchpad: scratchpad,
        previousHints: hints,
      };

      const hint = await generateHint({
        questionId: selectedQuestion._id,
        hintIndex,
        context: JSON.stringify(context),
      });

      if (hint) {
        setHints(prev => [...prev, hint]);
      } else {
        toast.info("No more hints available for this problem.");
      }
    } catch (error) {
      toast.error("Failed to generate hint");
      console.error("Hint generation error:", error);
    } finally {
      setLoadingHints(prev => ({ ...prev, [hintIndex]: false }));
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <p>Please sign in to access the Problem Solver.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-gray-50 dark:bg-gray-900">
      {/* Top Problem Selector Bar */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Select a Problem</h2>
          <Select
            onValueChange={(value) => {
              setSelectedQuestionId(value as Id<"questions">);
              setHints([]);
              setScratchpad("");
            }}
            value={selectedQuestion?._id}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a question to start solving" />
            </SelectTrigger>
            <SelectContent>
              {questions?.map((question: any) => (
                <SelectItem key={question._id} value={question._id}>
                  {question.topic}: {question.questionText.substring(0, 100)}...
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedQuestion ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* Left Column */}
          <div className="flex flex-col gap-4 overflow-y-auto">
            {/* Problem Statement */}
            <Card className="flex-shrink-0">
              <CardHeader>
                <CardTitle>Problem Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {selectedQuestion.questionText}
                  </ReactMarkdown>
                </div>
                {selectedQuestion.diagram && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Diagram</h3>
                    <div
                      className="rounded-lg border p-4 bg-white"
                      dangerouslySetInnerHTML={{ __html: selectedQuestion.diagram }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resources */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredResources?.map((resource: any) => (
                    <div key={resource._id} className="border p-3 rounded-lg">
                      <h4 className="font-semibold">{resource.name}</h4>
                      <p className="text-sm text-muted-foreground">{resource.topic}</p>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                        View Resource
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 overflow-y-auto">
            {/* Scratchpad */}
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle>Scratchpad</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex">
                <Textarea
                  placeholder="Use this space for your notes and calculations..."
                  value={scratchpad}
                  onChange={(e) => setScratchpad(e.target.value)}
                  className="w-full h-full resize-none"
                />
              </CardContent>
            </Card>

            {/* Hints */}
            <Card className="flex-shrink-0">
              <CardHeader>
                <CardTitle>Hints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hints.map((hint, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted">
                      <p className="font-semibold">Hint {index + 1}</p>
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {hint}
                      </ReactMarkdown>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => handleGenerateHint()}
                  disabled={loadingHints[hints.length]}
                  className="mt-4 w-full"
                >
                  {loadingHints[hints.length] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get a Hint"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-xl text-muted-foreground">Please select a problem to begin.</p>
        </div>
      )}

      {/* Ask Tutor Button */}
      {selectedQuestion && (
        <Button 
          className="fixed bottom-4 right-4"
          onClick={() => setShowChat(!showChat)}
        >
          Ask Tutor
        </Button>
      )}

      {/* Chat Overlay */}
      {showChat && selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full h-[80vh] flex flex-col m-4">
            <CardHeader>
              <CardTitle>Chat with your AI Tutor</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2"
                onClick={() => setShowChat(false)}
              >
                ×
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-lg bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </CardContent>
            <div className="p-4 border-t">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  className="flex-1"
                />
                <Button type="submit" disabled={isChatLoading}>Send</Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}