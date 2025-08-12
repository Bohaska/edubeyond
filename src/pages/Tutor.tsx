import { Protected } from "@/lib/protected-page";
import { TutorChat } from "@/components/TutorChat";

export default function Tutor() {
    return (
        <Protected>
            <TutorChat />
        </Protected>
    );
}
