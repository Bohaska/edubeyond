import { Protected } from "@/lib/protected-page";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useState } from "react";
import { toast } from "sonner";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function QuestionGenerator() {
  const [topic, setTopic] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [generatedQuestion, setGeneratedQuestion] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuestion = useAction(api.questions.generateQuestion);
  const saveQuestion = useMutation(api.questions.saveQuestion);
  const userQuestions = useQuery(api.questions.getUserQuestions);
  const datasets = useQuery(api.datasets.getAllDatasets);
  const initializeDatasets = useMutation(api.datasets.initializeDefaultDatasets);

  const handleGenerateQuestion = async () => {
    if (!topic || !questionType || !difficulty) {
      toast.error("Please select a topic, question type, and difficulty.");
      return;
    }

    setIsGenerating(true);
    setGeneratedQuestion(null);

    try {
      const result = await generateQuestion({ topic, questionType, difficulty });
      setGeneratedQuestion(result);
      toast.success("Question generated successfully!");
    } catch (error) {
      toast.error("Failed to generate question. Please try again.");
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!generatedQuestion) return;

    try {
      await saveQuestion({
        topic,
        questionType,
        difficulty,
        ...generatedQuestion,
      });
      toast.success("Question saved successfully!");
    } catch (error) {
      toast.error("Failed to save question.");
      console.error("Save error:", error);
    }
  };

  const handleInitializeDatasets = async () => {
    try {
      await initializeDatasets();
      toast.success("Default datasets initialized!");
    } catch (error) {
      toast.error("Failed to initialize datasets.");
      console.error("Initialize error:", error);
    }
  };

  return (
    <Protected>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8 max-w-6xl"
      >
        <h1 className="text-3xl font-bold mb-6">AP Physics C Question Generator</h1>
        
        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generator">Question Generator</TabsTrigger>
            <TabsTrigger value="library">Question Library</TabsTrigger>
            <TabsTrigger value="datasets">Dataset Catalog</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                        <SelectItem value="Energy and Work">Energy and Work</SelectItem>
                        <SelectItem value="Momentum">Momentum</SelectItem>
                        <SelectItem value="Oscillations">Oscillations</SelectItem>
                        <SelectItem value="Gauss's Law">Gauss's Law</SelectItem>
                        <SelectItem value="Electric Potential">Electric Potential</SelectItem>
                        <SelectItem value="Capacitance">Capacitance</SelectItem>
                        <SelectItem value="Current and Resistance">Current and Resistance</SelectItem>
                        <SelectItem value="Magnetic Fields">Magnetic Fields</SelectItem>
                        <SelectItem value="Electromagnetic Induction">Electromagnetic Induction</SelectItem>
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
                  <Button 
                    onClick={handleGenerateQuestion} 
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? "Generating..." : "Generate Question"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generated Question</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedQuestion ? (
                    <div className="space-y-4">
                      <div className="flex gap-2 mb-4">
                        <Badge variant="secondary">{topic}</Badge>
                        <Badge variant="outline">{questionType}</Badge>
                        <Badge variant="outline">{difficulty}</Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Question:</h4>
                        <p className="text-sm bg-muted p-3 rounded">{generatedQuestion.questionText}</p>
                      </div>

                      {generatedQuestion.choices && (
                        <div>
                          <h4 className="font-semibold mb-2">Answer Choices:</h4>
                          <div className="space-y-1">
                            {generatedQuestion.choices.map((choice: string, index: number) => (
                              <p key={index} className="text-sm bg-muted p-2 rounded">{choice}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold mb-2">Answer:</h4>
                        <p className="text-sm bg-green-50 p-3 rounded border border-green-200">{generatedQuestion.answer}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Explanation:</h4>
                        <p className="text-sm bg-blue-50 p-3 rounded border border-blue-200 whitespace-pre-line">{generatedQuestion.explanation}</p>
                      </div>

                      <Button onClick={handleSaveQuestion} className="w-full">
                        Save Question to Library
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Your generated question will appear here.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Question Library</CardTitle>
              </CardHeader>
              <CardContent>
                {userQuestions && userQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {userQuestions.map((question) => (
                      <div key={question._id} className="border rounded p-4 space-y-2">
                        <div className="flex gap-2 mb-2">
                          <Badge variant="secondary">{question.topic}</Badge>
                          <Badge variant="outline">{question.questionType}</Badge>
                          <Badge variant="outline">{question.difficulty}</Badge>
                        </div>
                        <p className="text-sm font-medium">{question.questionText}</p>
                        <Separator />
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(question._creationTime).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No questions saved yet. Generate and save some questions to build your library!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="datasets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dataset Catalog</CardTitle>
                <Button onClick={handleInitializeDatasets} variant="outline" size="sm">
                  Initialize Default Datasets
                </Button>
              </CardHeader>
              <CardContent>
                {datasets && datasets.length > 0 ? (
                  <div className="space-y-6">
                    {datasets.map((dataset) => (
                      <div key={dataset._id} className="border rounded p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg">{dataset.name}</h3>
                          <a 
                            href={dataset.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Visit Resource
                          </a>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{dataset.description}</p>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-sm">Question Types: </span>
                            <div className="flex gap-1 flex-wrap mt-1">
                              {dataset.questionTypes.map((type, index) => (
                                <Badge key={index} variant="outline" className="text-xs">{type}</Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium text-sm">Topics: </span>
                            <div className="flex gap-1 flex-wrap mt-1">
                              {dataset.topics.map((topic, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">{topic}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-green-700">Strengths:</span>
                            <p className="text-muted-foreground mt-1">{dataset.strengths}</p>
                          </div>
                          <div>
                            <span className="font-medium text-orange-700">Limitations:</span>
                            <p className="text-muted-foreground mt-1">{dataset.limitations}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No datasets cataloged yet. Click "Initialize Default Datasets" to get started!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Protected>
  );
}