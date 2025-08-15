import { Protected } from "@/lib/protected-page";
import { TutorChat } from "@/components/TutorChat";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import clsx from "clsx";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Tutor() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);

  const conversations = useQuery(api.tutorStore.getConversations);
  const createConversation = useMutation(api.tutorStore.createConversation);

  // Effect to select a conversation
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0]._id);
    }
  }, [conversations, selectedConversationId]);

  const handleCreateConversation = async () => {
    const newConversationId = await createConversation({});
    setSelectedConversationId(newConversationId);
  };

  const isLoading = conversations === undefined;

  if (isLoading) {
    return (
      <Protected>
        <div className="flex items-center justify-center h-screen">
          <p>Loading conversations...</p>
        </div>
      </Protected>
    );
  }

  return (
    <Protected>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-screen items-stretch"
      >
        <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
          <div className="flex flex-col h-full p-2">
            <Button
              onClick={handleCreateConversation}
              className="mb-4 w-full"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Chat
            </Button>
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {conversations?.map((convo) => (
                  <div
                    key={convo._id}
                    onClick={() => setSelectedConversationId(convo._id)}
                    className={clsx(
                      "p-2 rounded-md cursor-pointer text-sm truncate",
                      {
                        "bg-primary text-primary-foreground":
                          selectedConversationId === convo._id,
                        "hover:bg-accent": selectedConversationId !== convo._id,
                      },
                    )}
                  >
                    {convo.title}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          {selectedConversationId ? (
            <TutorChat conversationId={selectedConversationId} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Select a conversation or start a new one.
              </p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </Protected>
  );
}