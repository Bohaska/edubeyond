import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useMutation } from "convex/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";

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
  const generateQuestion = useAction(api.questions.generateQuestion);
  const saveQuestion = useMutation(api.questions.saveQuestion);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] =
    useState<GeneratedQuestion | null>(null);

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
      await saveQuestion({ questionData });
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
                        <Spinner className="mr-2 h-4 w-4 animate-spin" />
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
                  <Spinner size="lg" />
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
    </div>
  );
}