"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LoadingDots } from "./loading-dots";
import { User, Sparkles, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ChatMessageProps {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatMessage({
  content,
  isUser,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      console.error("Failed to copy message");
    }
  };

  return (
    <div
      className={`group flex w-full ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[850px] gap-3 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div
          className={`
            mt-1 flex h-8 w-8 shrink-0 items-center justify-center
            rounded-xl border
            ${
              isUser
                ? "border-white/10 bg-white/[0.07]"
                : "border-white/[0.08] bg-white/[0.045]"
            }
          `}
        >
          {isUser ? (
            <User className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Sparkles className="h-4 w-4 text-foreground" />
          )}
        </div>

        {/* Message */}
        <div
          className={`
            min-w-0
            ${
              isUser
                ? "rounded-2xl rounded-tr-md border border-white/[0.08] bg-white/[0.07] px-4 py-3"
                : "px-1 py-2"
            }
          `}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-[14px] leading-6 text-foreground">
              {content}
            </p>
          ) : (
            <div className="relative">
              {content ? (
                <>
                  <div
                    className="
                      prose prose-sm max-w-none
                      text-foreground/90
                      prose-p:my-2
                      prose-p:leading-7
                      prose-headings:text-foreground
                      prose-strong:text-foreground
                      prose-li:my-1
                    "
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="mb-3 last:mb-0">
                            {children}
                          </p>
                        ),

                        h1: ({ children }) => (
                          <h1 className="mb-4 mt-5 text-xl font-semibold tracking-tight">
                            {children}
                          </h1>
                        ),

                        h2: ({ children }) => (
                          <h2 className="mb-3 mt-5 text-lg font-semibold tracking-tight">
                            {children}
                          </h2>
                        ),

                        h3: ({ children }) => (
                          <h3 className="mb-2 mt-4 text-base font-semibold">
                            {children}
                          </h3>
                        ),

                        ul: ({ children }) => (
                          <ul className="mb-3 list-disc space-y-1 pl-5">
                            {children}
                          </ul>
                        ),

                        ol: ({ children }) => (
                          <ol className="mb-3 list-decimal space-y-1 pl-5">
                            {children}
                          </ol>
                        ),

                        li: ({ children }) => (
                          <li className="leading-6">
                            {children}
                          </li>
                        ),

                        blockquote: ({ children }) => (
                          <blockquote
                            className="
                              my-3 border-l-2
                              border-white/20
                              pl-4
                              italic
                              text-muted-foreground
                            "
                          >
                            {children}
                          </blockquote>
                        ),

                        a: ({ children, href }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                              text-foreground
                              underline
                              decoration-white/30
                              underline-offset-4
                              transition-colors
                              hover:decoration-white/70
                            "
                          >
                            {children}
                          </a>
                        ),

                        code: ({
                          children,
                          className,
                        }) => {
                          const isInline = !className;

                          if (isInline) {
                            return (
                              <code
                                className="
                                  rounded-md
                                  border border-white/[0.08]
                                  bg-white/[0.06]
                                  px-1.5
                                  py-0.5
                                  font-mono
                                  text-[12px]
                                  text-foreground
                                "
                              >
                                {children}
                              </code>
                            );
                          }

                          return (
                            <code
                              className="
                                block
                                overflow-x-auto
                                font-mono
                                text-[12px]
                                leading-6
                                text-foreground/90
                              "
                            >
                              {children}
                            </code>
                          );
                        },

                        pre: ({ children }) => (
                          <pre
                            className="
                              my-4
                              overflow-x-auto
                              rounded-xl
                              border border-white/[0.08]
                              bg-black/30
                              p-4
                              shadow-inner
                            "
                          >
                            {children}
                          </pre>
                        ),

                        hr: () => (
                          <hr className="my-5 border-white/[0.08]" />
                        ),

                        table: ({ children }) => (
                          <div className="my-4 overflow-x-auto rounded-xl border border-white/[0.08]">
                            <table className="w-full border-collapse text-sm">
                              {children}
                            </table>
                          </div>
                        ),

                        th: ({ children }) => (
                          <th className="border-b border-white/[0.08] bg-white/[0.04] px-3 py-2 text-left font-medium">
                            {children}
                          </th>
                        ),

                        td: ({ children }) => (
                          <td className="border-b border-white/[0.06] px-3 py-2">
                            {children}
                          </td>
                        ),
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>

                  {/* Copy button */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="
                      mt-2
                      flex
                      items-center
                      gap-1.5
                      rounded-lg
                      px-2
                      py-1
                      text-[11px]
                      text-muted-foreground
                      opacity-0
                      transition-all
                      hover:bg-white/[0.06]
                      hover:text-foreground
                      group-hover:opacity-100
                    "
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="flex items-center py-2">
                  <LoadingDots className="text-muted-foreground" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}