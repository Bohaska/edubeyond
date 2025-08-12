import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User } from "lucide-react";
import { MarkdownRenderer } from "./ui/markdown-renderer";
import { Id } from "@/convex/_generated/dataModel";

export function TutorChat() {
    const [message, setMessage] = useState("");
    const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
    const conversations = useQuery(api.tutor.getConversations);
    const messages = useQuery(api.tutor.getMessages, conversationId ? { conversationId } : "skip");
    const sendMessage = useAction(api.tutor.sendMessage);
    const createConversation = useMutation(api.tutor.createConversation);

    const handleSendMessage = async () => {
        if (message.trim() === "") return;

        let currentConversationId = conversationId;
        if (!currentConversationId) {
            const newConversationId = await createConversation({ title: message.substring(0, 50) });
            setConversationId(newConversationId);
            currentConversationId = newConversationId;
        }

        sendMessage({ message, conversationId: currentConversationId });
        setMessage("");
    };

    return (
        <div className="flex h-full">
            <div className="w-1/4 border-r">
                <CardHeader>
                    <CardTitle>Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => setConversationId(null)} className="w-full mb-2">New Chat</Button>
                    <ScrollArea className="h-[calc(100vh-200px)]">
                        {conversations?.map((convo) => (
                            <div key={convo._id} onClick={() => setConversationId(convo._id)} className="p-2 cursor-pointer hover:bg-muted rounded">
                                {convo.title}
                            </div>
                        ))}
                    </ScrollArea>
                </CardContent>
            </div>
            <div className="w-3/4 flex flex-col">
                <CardHeader>
                    <CardTitle>AI Tutor</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                    <ScrollArea className="flex-grow p-4 border rounded-lg mb-4">
                        {messages?.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-4 mb-4 ${msg.isViewer ? "justify-end" : ""}`}>
                                {msg.isViewer ? <User className="h-8 w-8" /> : <Bot className="h-8 w-8" />}
                                <div className={`p-3 rounded-lg ${msg.isViewer ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                    <MarkdownRenderer content={msg.text} />
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                    <div className="flex gap-2">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            placeholder="Ask a question..."
                        />
                        <Button onClick={handleSendMessage}>Send</Button>
                    </div>
                </CardContent>
            </div>
        </div>
    );
}