import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
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
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const questions = useQuery(api.questions.list);
  const selectedQuestion = useQuery(
    api.questions.getById,
    selectedQuestionId ? { id: selectedQuestionId } : "skip"
  );
  const resources = useQuery(api.resources.list);
  const generateHint = useMutation(api.questions.generateHint);
  const chatWithAI = useMutation(api.questions.chatWithAI);

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

  const handleGenerateHint = async (hintIndex: number) => {
    if (!selectedQuestion) return;

    setLoadingHints(prev => ({ ...prev, [hintIndex]: true }));

    try {
      const context = {
        question: selectedQuestion.questionText,
        choices: selectedQuestion.choices,
        explanation: selectedQuestion.explanation,
        scratchpad: scratchpad,
        previousHints: hints.slice(0, hintIndex)
      };

      const hint = await generateHint({
        questionId: selectedQuestion._id,
        hintIndex,
        context: JSON.stringify(context)
      });

      setHints(prev => {
        const newHints = [...prev];
        newHints[hintIndex] = hint ?? "No hint available";
        return newHints;
      });
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
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Problem Solver</h1>
          <p className="text-muted-foreground mt-2">
            Work through physics problems with AI assistance, hints, and resources
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Problem</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {questions?.map((question) => (
                      <Button
                        key={question._id}
                        variant={selectedQuestionId === question._id ? "default" : "outline"}
                        className="w-full justify-start text-left h-auto p-3"
                        onClick={() => {
                          setSelectedQuestionId(question._id);
                          setHints([]);
                          setChatMessages([]);
                          setScratchpad("");
                        }}
                      >
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {question.topic} - {question.questionType}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {question.questionText.substring(0, 100)}...
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {question.difficulty}
                          </Badge>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Problem Area */}
          <div className="lg:col-span-2">
            {selectedQuestion ? (
              <div className="space-y-6">
                {/* Question Display */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {selectedQuestion.topic} - {selectedQuestion.questionType}
                      <Badge variant="outline">{selectedQuestion.difficulty}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="prose max-w-none">
                      <p className="text-base leading-relaxed">{selectedQuestion.questionText}</p>
                    </div>
                    
                    {selectedQuestion.diagram && (
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <img 
                          src={selectedQuestion.diagram} 
                          alt="Problem diagram"
                          className="max-w-full h-auto mx-auto"
                        />
                      </div>
                    )}

                    {selectedQuestion.choices && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Answer Choices:</h4>
                        <div className="grid gap-2">
                          {selectedQuestion.choices.map((choice, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 border rounded">
                              <span className="font-medium text-sm">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              <span className="text-sm">{choice}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Scratchpad */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Scratchpad
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Work through the problem here... Show your calculations, thoughts, and approach."
                      value={scratchpad}
                      onChange={(e) => setScratchpad(e.target.value)}
                      className="min-h-32 resize-none"
                    />
                  </CardContent>
                </Card>

                {/* Tabs for Tutor and Hints */}
                <Tabs defaultValue="hints" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="hints" className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Hints
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tutor" 
                      className="flex items-center gap-2"
                      onClick={() => setShowChat(true)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Ask Tutor
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="hints" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Step-by-Step Hints</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          {[0, 1, 2, 3, 4].map((hintIndex) => (
                            <AccordionItem key={hintIndex} value={`hint-${hintIndex}`}>
                              <AccordionTrigger className="text-left">
                                Hint {hintIndex + 1}
                                {hints[hintIndex] && (
                                  <Badge variant="secondary" className="ml-2">
                                    Available
                                  </Badge>
                                )}
                              </AccordionTrigger>
                              <AccordionContent>
                                {hints[hintIndex] ? (
                                  <div className="prose max-w-none">
                                    <p>{hints[hintIndex]}</p>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <p className="text-muted-foreground">
                                      Click to generate a hint for this step.
                                    </p>
                                    <Button
                                      onClick={() => handleGenerateHint(hintIndex)}
                                      disabled={loadingHints[hintIndex]}
                                      size="sm"
                                    >
                                      {loadingHints[hintIndex] ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                          Generating...
                                        </>
                                      ) : (
                                        <>
                                          <Lightbulb className="h-4 w-4 mr-2" />
                                          Generate Hint
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="tutor" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">AI Tutor Chat</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <ScrollArea className="h-96 border rounded-lg p-4">
                            <div className="space-y-4">
                              {chatMessages.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">
                                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <p>Start a conversation with your AI tutor!</p>
                                  <p className="text-sm">Ask questions about the problem, get explanations, or discuss your approach.</p>
                                </div>
                              )}
                              {chatMessages.map((message, index) => (
                                <div
                                  key={index}
                                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={`max-w-[80%] rounded-lg p-3 ${
                                      message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    }`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                  </div>
                                </div>
                              ))}
                              {isChatLoading && (
                                <div className="flex justify-start">
                                  <div className="bg-muted rounded-lg p-3">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </div>
                                </div>
                              )}
                              <div ref={chatEndRef} />
                            </div>
                          </ScrollArea>
                          
                          <div className="flex gap-2">
                            <Input
                              placeholder="Ask your tutor a question..."
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                              disabled={isChatLoading}
                            />
                            <Button 
                              onClick={handleSendMessage} 
                              disabled={!chatInput.trim() || isChatLoading}
                              size="icon"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Select a Problem</p>
                    <p className="text-muted-foreground">Choose a problem from the list to start solving</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resources Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search resources..."
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                />
                
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {filteredResources?.map((resource: any) => (
                      <Card key={resource._id} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm line-clamp-2">
                              {resource.name}
                            </h4>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {resource.type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {resource.topic}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => window.open(resource.url, '_blank')}
                          >
                            Open Resource
                          </Button>
                        </div>
                      </Card>
                    ))}
                    
                    {filteredResources?.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No resources found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}