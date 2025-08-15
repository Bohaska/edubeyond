import { Protected } from "@/lib/protected-page";
import { TutorChat } from "@/components/TutorChat";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function Tutor() {
    const { user } = useAuth();
    const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
    const conversations = useQuery(api.tutorStore.getConversations);
    const createConversation = useMutation(api.tutorStore.createConversation);

    useEffect(() => {
        if (conversations && conversations.length > 0) {
            // Use the most recent conversation
            setConversationId(conversations[0]._id);
        } else if (user && conversations !== undefined) {
            // Create a new conversation if none exist
            createConversation({ title: "Physics Tutor Session" })
                .then((id) => setConversationId(id));
        }
    }, [conversations, user, createConversation]);

    if (!conversationId) {
        return (
            <Protected>
                <div className="flex items-center justify-center min-h-screen">
                    <p>Loading tutor...</p>
                </div>
            </Protected>
        );
    }

    return (
        <Protected>
            <TutorChat conversationId={conversationId} />
        </Protected>
    );
}