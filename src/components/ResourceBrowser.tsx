import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, Link as LinkIcon, Video } from "lucide-react";
import { Loader2 } from "lucide-react";

const ResourceNode = ({ resourceId }: { resourceId: Id<"resources"> }) => {
    const resource = useQuery(api.resources.get, { id: resourceId });
    const children = useQuery(api.resources.getResources, { parentId: resource?._id });

    if (!resource) {
        return null;
    }

    if (resource.type === "category") {
        const hasSimulations = children?.some(c => c.type === 'simulation');
        return (
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={resource.name}>
                    <AccordionTrigger>{resource.name}</AccordionTrigger>
                    <AccordionContent className="pl-4">
                        {hasSimulations ? (
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
                                {children?.map((child) => (
                                    <ResourceNode key={child._id} resourceId={child._id} />
                                ))}
                            </div>
                        ) : (
                            children?.map((child) => (
                                <ResourceNode key={child._id} resourceId={child._id} />
                            ))
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        );
    }

    if (resource.type === "simulation") {
        return (
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="group block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="overflow-hidden h-40">
                    <img src={resource.url} alt={resource.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                </div>
                <div className="p-3">
                    <h3 className="font-semibold text-sm truncate">{resource.name}</h3>
                </div>
            </a>
        )
    }

    const Icon = resource.type === 'guidesheet' ? FileText : resource.type === 'video' ? Video : LinkIcon;

    return (
        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
            <Icon className="h-4 w-4" />
            <span>{resource.name}</span>
        </a>
    );
};

export function ResourceBrowser() {
    const [search, setSearch] = useState("");
    const topLevelResources = useQuery(api.resources.getResources, { parentId: undefined });
    const searchResults = useQuery(api.resources.getResources, search ? { search } : "skip");

    const resourcesToDisplay = search ? searchResults : topLevelResources;

    return (
        <div>
            <Input
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4"
            />
            {resourcesToDisplay === undefined && <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}
            
            {search && searchResults?.map((resource) => (
                 <a key={resource._id} href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                    {resource.type === 'guidesheet' ? <FileText className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                    <span>{resource.name}</span>
                </a>
            ))}

            {!search && topLevelResources?.map((resource) => (
                <ResourceNode key={resource._id} resourceId={resource._id} />
            ))}
        </div>
    );
}