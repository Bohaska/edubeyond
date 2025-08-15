import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Link } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import {
  ExternalLink,
  Loader2,
  Trash2,
} from "lucide-react";

const formSchema = z.object({
  topic: z.string().min(1, "Please select a topic."),
  questionType: z.string().min(1, "Please select a question type."),
  difficulty: z.string().min(1, "Please select a difficulty."),
});

type GeneratedQuestion = {
  questionText: string;
  choices?: string[];
  correctChoice?: string;
  explanation: string;
  diagram?: string;
};

export default function QuestionGenerator() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const generateQuestion = useAction(api.questionGeneration.generateQuestion);
  const saveQuestion = useMutation(api.questions.saveQuestion);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] =
    useState<GeneratedQuestion | null>(null);
  const [generatingDiagramId, setGeneratingDiagramId] = useState<string | null>(
    null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      questionType: "",
      difficulty: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    setGeneratedQuestion(null);
    try {
      const result = await generateQuestion(values);
      setGeneratedQuestion(result);
      toast.success("Question generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate question. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  const handleSaveQuestion = async () => {
    if (!generatedQuestion || !user) return;

    const questionData = {
      ...form.getValues(),
      ...generatedQuestion,
      createdBy: user._id as Id<"users">,
    };

    try {
      await saveQuestion(questionData);
      toast.success("Question saved to your library!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save question.");
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">AP Physics C Question Generator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Generation Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a topic" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Kinematics">Kinematics</SelectItem>
                            <SelectItem value="Newton's Laws">
                              Newton's Laws
                            </SelectItem>
                            <SelectItem value="Work and Energy">
                              Work and Energy
                            </SelectItem>
                            <SelectItem value="Momentum">Momentum</SelectItem>
                            <SelectItem value="Rotational Motion">
                              Rotational Motion
                            </SelectItem>
                            <SelectItem value="Oscillations">
                              Oscillations
                            </SelectItem>
                            <SelectItem value="Gravitation">
                              Gravitation
                            </SelectItem>
                            <SelectItem value="Electrostatics">
                              Electrostatics
                            </SelectItem>
                            <SelectItem value="Conductors and Capacitors">
                              Conductors and Capacitors
                            </SelectItem>
                            <SelectItem value="DC Circuits">DC Circuits</SelectItem>
                            <SelectItem value="Magnetic Fields">
                              Magnetic Fields
                            </SelectItem>
                            <SelectItem value="Electromagnetism">
                              Electromagnetism
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="questionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MCQ">
                              Multiple Choice (MCQ)
                            </SelectItem>
                            <SelectItem value="FRQ">Free Response (FRQ)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Question"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Generated Question</CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
              {generatedQuestion && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Question:</h3>
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {generatedQuestion.questionText}
                    </ReactMarkdown>
                  </div>
                  {generatedQuestion.choices && (
                    <div>
                      <h3 className="font-semibold">Choices:</h3>
                      <ul className="list-disc pl-5">
                        {generatedQuestion.choices.map((choice, index) => (
                          <li key={index}>
                            <ReactMarkdown
                              remarkPlugins={[remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                            >
                              {choice}
                            </ReactMarkdown>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {generatedQuestion.correctChoice && (
                    <div>
                      <h3 className="font-semibold">Correct Answer:</h3>
                       <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {generatedQuestion.correctChoice}
                      </ReactMarkdown>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">Explanation:</h3>
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {generatedQuestion.explanation}
                    </ReactMarkdown>
                  </div>
                  {generatedQuestion.diagram && (
                    <div>
                      <h3 className="font-semibold">Diagram:</h3>
                      <div
                        className="mt-2 p-4 border rounded-lg bg-white"
                        dangerouslySetInnerHTML={{
                          __html: generatedQuestion.diagram,
                        }}
                      />
                    </div>
                  )}
                  <Button onClick={handleSaveQuestion} disabled={!user}>
                    Save to My Library
                  </Button>
                </div>
              )}
              {!isGenerating && !generatedQuestion && (
                <p className="text-muted-foreground">
                  Your generated question will appear here.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <QuestionBank
        generatingDiagramId={generatingDiagramId}
        setGeneratingDiagramId={setGeneratingDiagramId}
      />
    </div>
  );
}

function QuestionBank({
  generatingDiagramId,
  setGeneratingDiagramId,
}: {
  generatingDiagramId: string | null;
  setGeneratingDiagramId: (id: string | null) => void;
}) {
  const { user } = useAuth();
  const questions = useQuery(
    api.questions.getUserQuestions,
    user ? { userId: user._id } : "skip"
  );

  if (!user) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>My Question Library</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please log in to see your saved questions.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (questions === undefined) {
    return (
      <div className="flex items-center justify-center mt-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>My Question Library</CardTitle>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <p className="text-muted-foreground">
            You haven't saved any questions yet. Generate and save a question to
            get started!
          </p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {questions.map((question) => (
              <QuestionBankItem
                key={question._id}
                question={question}
                generatingDiagramId={generatingDiagramId}
                setGeneratingDiagramId={setGeneratingDiagramId}
              />
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

function QuestionBankItem({
  question,
  generatingDiagramId,
  setGeneratingDiagramId,
}: {
  question: Doc<"questions">;
  generatingDiagramId: string | null;
  setGeneratingDiagramId: (id: string | null) => void;
}) {
  const generateDiagramAction = useAction(api.diagramActions.generateDiagram);
  const updateDiagramMutation = useMutation(api.questions.updateDiagram);
  const deleteDiagramMutation = useMutation(api.questions.deleteDiagram);
  const isDiagramGenerating = generatingDiagramId === question._id;

  const handleGenerateDiagram = async () => {
    setGeneratingDiagramId(question._id);
    try {
      const svgCode = await generateDiagramAction({
        questionId: question._id,
        questionText: question.questionText,
      });

      if (svgCode) {
        const promise = updateDiagramMutation({
          questionId: question._id,
          diagram: svgCode,
        });

        toast.promise(promise, {
          loading: "Saving diagram to database...",
          success: "Diagram saved successfully!",
          error: "Failed to save diagram.",
        });
        await promise;
      } else {
        // This case should ideally not be hit if the action throws an error
        throw new Error("Action returned no SVG code.");
      }
    } catch (e: any) {
      console.error("Error during diagram generation:", e);
      // Log the raw AI response if it's included in the error message
      if (e.message.includes("Raw AI response:")) {
        console.log("Raw AI Response from server:", e.message);
      }
      toast.error(e.message || "An error occurred during diagram generation.");
    } finally {
      setGeneratingDiagramId(null);
    }
  };

  const handleDeleteDiagram = async () => {
    const promise = deleteDiagramMutation({ questionId: question._id });
    toast.promise(promise, {
      loading: "Deleting diagram...",
      success: "Diagram deleted.",
      error: "Failed to delete diagram.",
    });
  };

  return (
    <AccordionItem value={question._id}>
      <AccordionTrigger>
        <div className="flex justify-between w-full pr-4 items-center">
          <span className="text-left font-medium">
            {question.topic} - {question.questionType} ({question.difficulty})
          </span>
          <span className="text-muted-foreground text-sm font-normal">
            {new Date(question._creationTime).toLocaleDateString()}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-2">
          <div>
            <h4 className="font-semibold text-sm mb-1">Question</h4>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {question.questionText}
            </ReactMarkdown>
          </div>
          {question.choices && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Choices</h4>
              <ul className="list-disc pl-5 space-y-1">
                {question.choices.map((choice, index) => (
                  <li key={index}>
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {choice}
                    </ReactMarkdown>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {question.correctChoice && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Correct Answer</h4>
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {question.correctChoice}
              </ReactMarkdown>
            </div>
          )}
          <div>
            <h4 className="font-semibold text-sm mb-1">Explanation</h4>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {question.explanation}
            </ReactMarkdown>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="font-semibold text-sm">Diagram</h4>
            {question.diagram ? (
              <div
                className="p-4 border rounded-lg bg-white overflow-auto"
                dangerouslySetInnerHTML={{ __html: question.diagram }}
              />
            ) : (
              <p className="text-muted-foreground text-sm">
                No diagram for this question yet.
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleGenerateDiagram}
                disabled={isDiagramGenerating}
                size="sm"
              >
                {isDiagramGenerating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {question.diagram ? "Regenerate" : "Generate"} Diagram
              </Button>
              {question.diagram && (
                <Button
                  onClick={handleDeleteDiagram}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Diagram
                </Button>
              )}
              <Button size="sm" variant="outline" asChild>
                <Link to={`/problem-solver?id=${question._id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Problem Solver
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}