import { useSearchParams } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

function ProblemStatement({
  questionText,
  choices,
}: {
  questionText?: string;
  choices?: string[];
}) {
  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <CardTitle>Problem Statement</CardTitle>
      </CardHeader>
      <CardContent className="prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {questionText ?? "No question text available."}
        </ReactMarkdown>
        {choices && choices.length > 0 && (
          <div className="mt-4 space-y-2">
            {choices.map((choice, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                <input type="radio" name="choice" id={`choice-${index}`} className="cursor-pointer" />
                <label htmlFor={`choice-${index}`} className="cursor-pointer flex-1">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} className="prose-p:inline">
                    {choice}
                  </ReactMarkdown>
                </label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SolutionWorkspace() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Your Solution</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Use this space to work through the problem. Your work is not yet saved or graded.
        </p>
        {/* Add a text editor or other input mechanism here in the future */}
      </CardContent>
    </Card>
  );
}

export default function ProblemSolver() {
  const [searchParams] = useSearchParams();
  const problemId = searchParams.get("id") as Id<"questions"> | null;

  const problem = useQuery(
    api.questions.getById,
    problemId ? { id: problemId } : "skip"
  );

  const updateLastProblem = useMutation(api.users.updateLastProblem);

  useEffect(() => {
    if (problemId) {
      updateLastProblem({ problemId });
    }
  }, [problemId, updateLastProblem]);

  if (problemId === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Problem Selected</h2>
        <p className="text-muted-foreground">
          Please select a problem from the dashboard or question library to get started.
        </p>
      </div>
    );
  }

  if (problem === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (problem === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Problem Not Found</h2>
        <p className="text-muted-foreground">
          The requested problem could not be found. It may have been deleted.
        </p>
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full max-h-full">
      <ResizablePanel defaultSize={50}>
        <div className="p-6 h-full">
          <ProblemStatement
            questionText={problem.questionText}
            choices={problem.choices}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="p-6 h-full">
          <SolutionWorkspace />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}