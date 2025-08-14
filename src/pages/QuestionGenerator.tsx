import { Protected } from "@/lib/protected-page";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Id } from "@/convex/_generated/dataModel";
import { Sparkles, Trash2, Image as ImageIcon } from "lucide-react";

export default function QuestionGenerator() {
  const [topic, setTopic] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [generatedQuestion, setGeneratedQuestion] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuestionAction = useAction(api.questions.generateQuestion);
  const saveQuestionMutation = useMutation(api.questions.saveQuestion);
  const userQuestions = useQuery(api.questions.getUserQuestions);
  const datasets = useQuery(api.datasets.getAllDatasets);
  const initializeDatasets = useMutation(api.datasets.initializeDefaultDatasets);

  const [activeTab, setActiveTab] = useState("generator");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");

  const generateDiagramAction = useAction(api.diagrams.generateDiagram);
  const removeDiagramMutation = useMutation(api.diagrams.removeDiagram);
  const [diagrams, setDiagrams] = useState<Record<string, string | undefined>>({});
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState<string | null>(null);

  // Initialize datasets on component mount
  useEffect(() => {
    if (datasets?.length === 0) {
      initializeDatasets();
    }
  }, [datasets, initializeDatasets]);

  const handleGenerateQuestion = async () => {
    if (!topic || !questionType || !difficulty) {
      toast.error("Please select a topic, question type, and difficulty.");
      return;
    }

    setIsGenerating(true);
    setGeneratedQuestion("");

    try {
      const result = await generateQuestionAction({
        topic,
        questionType,
        difficulty,
      });

      // Store the raw result for saving
      setGeneratedQuestion(result);
      toast.success("Question generated successfully!");
    } catch (error) {
      console.error("Error generating question:", error);
      toast.error("Failed to generate question. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!generatedQuestion) {
      toast.error("No question to save.");
      return;
    }

    try {
      await saveQuestionMutation({
        topic,
        questionType,
        difficulty,
        questionText: generatedQuestion.questionText,
        explanation: generatedQuestion.explanation,
        choices: generatedQuestion.choices,
        correctChoice: generatedQuestion.correctChoice || "",
      });

      toast.success("Question saved to your library!");
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("Failed to save question.");
    }
  };

  const handleGenerateDiagram = async (questionId: Id<"questions">, questionText: string) => {
    setIsGeneratingDiagram(questionId);
    try {
      const diagram = await generateDiagramAction({ questionId, questionText });
      setDiagrams((prev) => ({ ...prev, [questionId]: diagram }));
      toast.success("Diagram generated successfully!");
    } catch (error) {
      console.error("Error generating diagram:", error);
      toast.error("Failed to generate diagram.");
    } finally {
      setIsGeneratingDiagram(null);
    }
  };

  const handleRemoveDiagram = async (questionId: Id<"questions">) => {
    try {
      await removeDiagramMutation({ questionId });
      setDiagrams((prev) => ({ ...prev, [questionId]: undefined }));
      toast.success("Diagram removed.");
    } catch (error) {
      console.error("Error removing diagram:", error);
      toast.error("Failed to remove diagram.");
    }
  };

  const filteredQuestions = userQuestions?.filter((q: any) => {
    const topicMatch = (selectedTopic === "" || selectedTopic === "all") ? true : q.topic === selectedTopic;
    const typeMatch = (selectedType === "" || selectedType === "all") ? true : q.questionType === selectedType;
    const difficultyMatch = (selectedDifficulty === "" || selectedDifficulty === "all") ? true : q.difficulty === selectedDifficulty;
    return topicMatch && typeMatch && difficultyMatch;
  }) || [];

  return (
    <Protected>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8"
      >
        <h1 className="text-3xl font-bold mb-6">AP Physics C Question Generator</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="library">Question Library</TabsTrigger>
            <TabsTrigger value="datasets">Dataset Catalog</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Topic</Label>
                    <Select onValueChange={setTopic} value={topic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Newton's Laws">Newton's Laws</SelectItem>
                        <SelectItem value="Rotational Motion">Rotational Motion</SelectItem>
                        <SelectItem value="Oscillations">Oscillations</SelectItem>
                        <SelectItem value="Gravitation">Gravitation</SelectItem>
                        <SelectItem value="Fluid Mechanics">Fluid Mechanics</SelectItem>
                        <SelectItem value="Thermodynamics">Thermodynamics</SelectItem>
                        <SelectItem value="Electric Fields">Electric Fields</SelectItem>
                        <SelectItem value="Gauss's Law">Gauss's Law</SelectItem>
                        <SelectItem value="Electric Potential">Electric Potential</SelectItem>
                        <SelectItem value="Capacitance">Capacitance</SelectItem>
                        <SelectItem value="Current and Resistance">Current and Resistance</SelectItem>
                        <SelectItem value="DC Circuits">DC Circuits</SelectItem>
                        <SelectItem value="Magnetic Fields">Magnetic Fields</SelectItem>
                        <SelectItem value="Electromagnetic Induction">Electromagnetic Induction</SelectItem>
                        <SelectItem value="AC Circuits">AC Circuits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Question Type</Label>
                    <Select onValueChange={setQuestionType} value={questionType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MCQ">Multiple Choice (MCQ)</SelectItem>
                        <SelectItem value="FRQ">Free Response (FRQ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select onValueChange={setDifficulty} value={difficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleGenerateQuestion} disabled={isGenerating} className="flex-1">
                      {isGenerating ? "Generating..." : "Generate Question"}
                    </Button>
                    {generatedQuestion && (
                      <Button onClick={handleSaveQuestion} variant="outline">
                        Save Question
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Generated Question</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedQuestion ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      <div>
                        <h4 className="font-semibold mb-2">Question:</h4>
                        <MarkdownRenderer content={generatedQuestion.questionText} />
                      </div>
                      
                      {generatedQuestion.choices && (
                        <div>
                          <h4 className="font-semibold mb-2">Choices:</h4>
                          <div className="space-y-1">
                            {generatedQuestion.choices.map((choice: string, index: number) => (
                              <div key={index} className="flex items-start gap-2">
                                <span className="font-mono text-sm mt-1">
                                  {String.fromCharCode(65 + index)}.
                                </span>
                                <MarkdownRenderer content={choice} className="flex-1" />
                              </div>
                            ))}
                          </div>
                          <div className="mt-2">
                            <span className="font-semibold">Correct Answer: </span>
                            <span className="font-mono">{generatedQuestion.correctChoice}</span>
                          </div>
                        </div>
                      )}
                      
                      {generatedQuestion.answer && !generatedQuestion.choices && (
                        <div>
                          <h4 className="font-semibold mb-2">Answer:</h4>
                          <MarkdownRenderer content={generatedQuestion.answer} />
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-semibold mb-2">Explanation:</h4>
                        <MarkdownRenderer content={generatedQuestion.explanation} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Your generated question will appear here with proper mathematical formatting.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Question Library</CardTitle>
                <CardDescription>Browse and filter your saved questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Select onValueChange={setSelectedTopic} value={selectedTopic}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      <SelectItem value="Newton's Laws">Newton's Laws</SelectItem>
                      <SelectItem value="Rotational Motion">Rotational Motion</SelectItem>
                      <SelectItem value="Gauss's Law">Gauss's Law</SelectItem>
                      <SelectItem value="Electromagnetic Induction">Electromagnetic Induction</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={setSelectedType} value={selectedType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="MCQ">MCQ</SelectItem>
                      <SelectItem value="FRQ">FRQ</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={setSelectedDifficulty} value={selectedDifficulty}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  {filteredQuestions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No questions found. Generate some questions to build your library!
                    </p>
                  ) : (
                    filteredQuestions.map((question: any) => (
                      <Card key={question._id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2">
                            <Badge variant="secondary">{question.topic}</Badge>
                            <Badge variant={question.questionType === "MCQ" ? "default" : "outline"}>
                              {question.questionType}
                            </Badge>
                            <Badge variant={
                              question.difficulty === "easy" ? "secondary" :
                              question.difficulty === "medium" ? "default" : "destructive"
                            }>
                              {question.difficulty}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(question._creationTime).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="mb-2">
                          <MarkdownRenderer content={question.questionText} />
                        </div>

                        {question.diagram && (
                          <div className="my-4 p-2 border rounded-md bg-muted/20">
                            <h4 className="font-semibold text-sm mb-2">Diagram:</h4>
                            <div dangerouslySetInnerHTML={{ __html: question.diagram }} />
                          </div>
                        )}
                        
                        {question.choices && (
                          <div className="mb-2">
                            <div className="space-y-1">
                              {question.choices.map((choice: string, index: number) => (
                                <div key={index} className="flex items-start gap-2">
                                  <span className="font-mono text-sm mt-1">
                                    {String.fromCharCode(65 + index)}.
                                  </span>
                                  <MarkdownRenderer content={choice} className="flex-1" />
                                </div>
                              ))}
                            </div>
                            <div className="mt-2">
                              <span className="font-semibold">Answer: </span>
                              <span className="font-mono">{question.correctChoice}</span>
                            </div>
                          </div>
                        )}
                        
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium">Show Explanation</summary>
                          <div className="mt-2">
                            <MarkdownRenderer content={question.explanation} />
                          </div>
                        </details>

                        <div className="mt-4 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGenerateDiagram(question._id, question.questionText)}
                            disabled={isGeneratingDiagram === question._id}
                          >
                            {isGeneratingDiagram === question._id ? (
                              "Generating..."
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                {question.diagram ? "Regenerate Diagram" : "Add Diagram"}
                              </>
                            )}
                          </Button>
                          {question.diagram && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveDiagram(question._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Diagram
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="datasets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dataset Catalog</CardTitle>
                <CardDescription>Explore curated physics resources and question databases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {datasets?.map((dataset) => (
                    <Card key={dataset._id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{dataset.name}</h3>
                        <a 
                          href={dataset.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Visit Resource
                        </a>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{dataset.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium mb-1">Question Types:</h4>
                          <div className="flex flex-wrap gap-1">
                            {dataset.questionTypes.map((type, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Topics Covered:</h4>
                          <div className="flex flex-wrap gap-1">
                            {dataset.topics.slice(0, 3).map((topic, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {dataset.topics.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{dataset.topics.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium text-green-700 mb-1">Strengths:</h4>
                          <p className="text-muted-foreground">{dataset.strengths}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-700 mb-1">Limitations:</h4>
                          <p className="text-muted-foreground">{dataset.limitations}</p>
                        </div>
                      </div>
                    </Card>
                  )) || (
                    <p className="text-center text-muted-foreground py-8">Loading datasets...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Protected>
  );
}