import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Plus, Send, User, Bot } from "lucide-react";

export default function TutorChat() {
    const [message, setMessage] = useState("");
    const [currentConversationId, setCurrentConversationId] = useState<Id<"conversations"> | null>(null);

    const conversations = useQuery(api.tutorStore.getConversations);
    const messages = useQuery(api.tutorStore.getMessages, currentConversationId ? { conversationId: currentConversationId } : "skip");
    
    const createConversation = useMutation(api.tutorStore.createConversation);
    const sendMessage = useAction(api.tutor.sendMessage);

    const handleSendMessage = async () => {
        if (!message.trim()) return;
        
        let conversationId = currentConversationId;
        if (!conversationId) {
            conversationId = await createConversation({ title: message.slice(0, 50) });
            setCurrentConversationId(conversationId);
        }
        
        if (conversationId) {
            await sendMessage({ message, conversationId });
            setMessage("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="container mx-auto h-screen max-h-screen flex">
            {/* Sidebar */}
            <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-80 border-r bg-card"
            >
                <Card className="h-full rounded-none border-0">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Conversations
                        </CardTitle>
                        <Button 
                            onClick={() => setCurrentConversationId(null)}
                            className="w-full justify-start gap-2"
                            variant="outline"
                        >
                            <Plus className="h-4 w-4" />
                            New Chat
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[calc(100vh-140px)]">
                            <div className="space-y-1 p-4 pt-0">
                                {conversations?.map((convo: any) => (
                                    <motion.div
                                        key={convo._id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            variant={currentConversationId === convo._id ? "secondary" : "ghost"}
                                            className="w-full justify-start text-left h-auto p-3"
                                            onClick={() => setCurrentConversationId(convo._id)}
                                        >
                                            <div className="truncate">
                                                {convo.title}
                                            </div>
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </motion.div>
            
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-background">
                {/* Header */}
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="border-b bg-card p-4"
                >
                    <div className="flex items-center gap-2">
                        <Bot className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-semibold">AP Physics C Tutor</h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Ask me anything about AP Physics C concepts, problems, or exam preparation
                    </p>
                </motion.div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="space-y-4 max-w-4xl mx-auto"
                    >
                        {!messages || messages.length === 0 ? (
                            <div className="text-center py-12">
                                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                                <p className="text-muted-foreground">
                                    Ask me about mechanics, electricity & magnetism, or any AP Physics C topic!
                                </p>
                            </div>
                        ) : (
                            messages.map((msg: any, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role !== 'user' && (
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                                <Bot className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                        </div>
                                    )}
                                    
                                    <Card className={`max-w-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                                        <CardContent className="p-4">
                                            {msg.role === "model" ? (
                                                <div className="prose prose-sm dark:prose-invert max-w-none prose-a:text-blue-600 prose-a:underline dark:prose-a:text-blue-400">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkMath]}
                                                        rehypePlugins={[rehypeKatex]}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {msg.role === 'user' && (
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                                <User className="h-4 w-4 text-secondary-foreground" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </ScrollArea>
                
                {/* Input Area */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="border-t bg-card p-4"
                >
                    <div className="max-w-4xl mx-auto">
                        <div className="flex gap-2">
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about AP Physics C concepts, problems, or exam tips..."
                                className="flex-1"
                            />
                            <Button 
                                onClick={handleSendMessage}
                                disabled={!message.trim()}
                                size="icon"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Press Enter to send, Shift+Enter for new line
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}