import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Custom styling for different elements
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
          h1: ({ children }) => <h1 className="text-lg font-semibold mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>;
            }
            return <code className={className}>{children}</code>;
          },
          pre: ({ children }) => (
            <pre className="bg-muted p-3 rounded-md overflow-x-auto text-sm font-mono mb-2">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic mb-2">
              {children}
            </blockquote>
          ),
          // Style math expressions
          span: ({ children, className }) => {
            if (className?.includes('katex')) {
              return <span className={className}>{children}</span>;
            }
            return <span>{children}</span>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
