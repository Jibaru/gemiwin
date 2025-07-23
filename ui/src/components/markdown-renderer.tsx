import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: react-syntax-highlighter has no types for esm import
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: style import lacks types
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Determine default style based on prefers-color-scheme; React hooks not available here
const prefersDark =
  typeof window !== 'undefined'
    ? window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    : true;


interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className: cls, children, ...props }: any) {
            const match = /language-(\w+)/.exec(cls || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={prefersDark ? oneDark : oneLight}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={cls} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}; 