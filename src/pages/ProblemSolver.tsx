import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ProblemSolver() {
  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 border-b flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Problem Solver</h1>
      </header>
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 min-h-0"
      >
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="p-4 h-full overflow-y-auto">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Problem Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed">
                  A block of mass <strong>M</strong> is attached to a spring
                  with spring constant <strong>k</strong> on a frictionless
                  horizontal surface. The block is pulled to a position{" "}
                  <strong>x = A</strong> and released from rest. Find the speed
                  of the block when it is at position <strong>x = A/2</strong>.
                </p>
                {/* This will be populated with data later */}
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="p-4 h-full">
            <Tabs defaultValue="scratchpad" className="h-full flex flex-col">
              <TabsList className="flex-shrink-0">
                <TabsTrigger value="scratchpad">Scratchpad</TabsTrigger>
                <TabsTrigger value="tutor">Ask Tutor</TabsTrigger>
                <TabsTrigger value="hints">Hints</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
              <TabsContent value="scratchpad" className="flex-1 mt-2 min-h-0">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Solution Area</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-[calc(100%-4rem)]">
                    <p className="mb-2 text-sm text-muted-foreground">
                      Use LaTeX for equations (e.g., `$$E = mc^2$$`) and the
                      canvas for diagrams.
                    </p>
                    <div className="flex-1 border rounded-md p-2 mb-4">
                      {/* LaTeX Editor + Drawing Canvas would go here */}
                      <Textarea
                        placeholder="Start your solution here..."
                        className="h-full w-full resize-none border-0 focus-visible:ring-0"
                      />
                    </div>
                    <Button>Verify Step</Button>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tutor" className="flex-1 mt-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>AI Tutor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      AI Tutor chat will be here, pre-loaded with problem
                      context.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="hints" className="flex-1 mt-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Hints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Step-by-step hints will be generated on demand here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="resources" className="flex-1 mt-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Related Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Relevant theory snippets and similar problems will appear
                      here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}