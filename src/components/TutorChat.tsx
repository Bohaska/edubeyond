import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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

    return (
        <div className="flex h-screen">
            <div className="w-1/4 border-r p-4">
                <h2 className="font-bold mb-4">Conversations</h2>
                <button 
                    onClick={() => setCurrentConversationId(null)}
                    className="w-full mb-2 p-2 bg-blue-500 text-white rounded"
                >
                    New Chat
                </button>
                <div className="space-y-2">
                    {conversations?.map((convo: any) => (
                        <div 
                            key={convo._id}
                            onClick={() => setCurrentConversationId(convo._id)}
                            className={`p-2 cursor-pointer rounded ${currentConversationId === convo._id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                        >
                            {convo.title}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto">
                    {messages?.map((msg: any, index: number) => (
                        <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="p-4 border-t">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask about AP Physics C..."
                            className="flex-1 p-2 border rounded"
                        />
                        <button 
                            onClick={handleSendMessage}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}