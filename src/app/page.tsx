"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  Lightbulb,
  BookOpen,
  PenLine,
  Sparkles,
} from "lucide-react";

import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { MemoryBadge } from "@/components/memory-badge";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatHeader } from "@/components/chat-header";

import { MemoryStorageService } from "@/lib/memory-storage";
import { MemorySummarizationService } from "@/lib/memory-summarization";
import { TitleGenerationService } from "@/lib/title-generation";

import {
  ConversationMemory,
  ChatMessage as MemoryChatMessage,
} from "@/lib/memory-types";

interface ChatMessageType {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const suggestions = [
  {
    icon: Lightbulb,
    title: "Explain something",
    description: "Break down a difficult concept",
    prompt:
      "Explain a difficult concept to me in a simple and easy-to-understand way.",
  },
  {
    icon: BookOpen,
    title: "Help me learn",
    description: "Explore a new topic",
    prompt:
      "Teach me something interesting and useful that I can learn today.",
  },
  {
    icon: PenLine,
    title: "Write something",
    description: "Create or improve your writing",
    prompt:
      "Help me write something professional and well-structured.",
  },
  {
    icon: MessageCircle,
    title: "Brainstorm ideas",
    description: "Think through an idea with me",
    prompt:
      "Help me brainstorm some creative and practical ideas.",
  },
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversation, setCurrentConversation] =
    useState<ConversationMemory | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);

  const memoryStorage = MemoryStorageService.getInstance();
  const summarizationService =
    MemorySummarizationService.getInstance();
  const titleGenerationService =
    TitleGenerationService.getInstance();

  useEffect(() => {
    const initializeConversation = () => {
      let conversation =
        memoryStorage.getCurrentConversation();

      if (!conversation) {
        const savedContext =
          localStorage.getItem("chat_context") || "";

        conversation =
          memoryStorage.createConversation(savedContext);
      } else {
        const latestContext =
          localStorage.getItem("chat_context") || "";

        if (latestContext !== conversation.context) {
          conversation.context = latestContext;
          memoryStorage.updateConversation(conversation);
        }
      }

      setCurrentConversation(conversation);

      const displayMessages: ChatMessageType[] =
        conversation.messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.isUser,
          timestamp: new Date(msg.timestamp),
        }));

      setMessages(displayMessages);
    };

    initializeConversation();
  }, [memoryStorage]);

  useEffect(() => {
    const handleContextChange = () => {
      const latestContext =
        localStorage.getItem("chat_context") || "";

      if (currentConversation) {
        currentConversation.context = latestContext;
        memoryStorage.updateConversation(currentConversation);
      }
    };

    window.addEventListener(
      "storage",
      handleContextChange
    );

    window.addEventListener(
      "contextUpdated",
      handleContextChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleContextChange
      );

      window.removeEventListener(
        "contextUpdated",
        handleContextChange
      );
    };
  }, [currentConversation, memoryStorage]);

  const handleSummarization = async () => {
    if (!currentConversation || isSummarizing) return;

    setIsSummarizing(true);

    try {
      const {
        oldMessages,
        recentMessages,
      } =
        memoryStorage.getMessagesForSummarization();

      if (oldMessages.length === 0) {
        setIsSummarizing(false);
        return;
      }

      const selectedProvider =
        localStorage.getItem("selected_provider") ||
        "gemini";

      const apiKey =
        selectedProvider === "gemini"
          ? localStorage.getItem("gemini_api_key")
          : localStorage.getItem("openai_api_key");

      if (!apiKey) {
        setIsSummarizing(false);
        return;
      }

      const result =
        await summarizationService.summarizeConversation(
          oldMessages,
          currentConversation.context,
          apiKey,
          selectedProvider
        );

      const updatedConversation = {
        ...currentConversation,
        summary: result.summary,
        messages: [...recentMessages],
        totalWords:
          result.totalWords +
          recentMessages.reduce(
            (sum, msg) =>
              sum +
              msg.content.split(/\s+/).length,
            0
          ),
        lastSummarizedAt: new Date(),
        isSummarizing: false,
      };

      memoryStorage.updateConversation(
        updatedConversation
      );

      setCurrentConversation(updatedConversation);

      const displayMessages: ChatMessageType[] =
        recentMessages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.isUser,
          timestamp: new Date(msg.timestamp),
        }));

      setMessages(displayMessages);
    } catch (error) {
      console.error(
        "Summarization failed:",
        error
      );
    } finally {
      setIsSummarizing(false);
    }
  };

  const generateTitle = async (
    firstMessage: string
  ) => {
    if (
      !currentConversation ||
      currentConversation.title !== "New Chat"
    ) {
      return;
    }

    setIsGeneratingTitle(true);

    try {
      const selectedProvider =
        localStorage.getItem("selected_provider") ||
        "gemini";

      const apiKey =
        selectedProvider === "gemini"
          ? localStorage.getItem("gemini_api_key")
          : localStorage.getItem("openai_api_key");

      if (!apiKey) {
        return;
      }

      const title =
        await titleGenerationService.generateTitle(
          firstMessage,
          apiKey,
          selectedProvider
        );

      memoryStorage.updateConversationTitle(
        currentConversation.id,
        title
      );

      const updatedConversation = {
        ...currentConversation,
        title,
      };

      setCurrentConversation(
        updatedConversation
      );

      setSidebarRefreshTrigger(
        (prev) => prev + 1
      );
    } catch (error) {
      console.error(
        "Title generation failed:",
        error
      );
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const handleNewChat = () => {
    const savedContext =
      localStorage.getItem("chat_context") || "";

    const newConversation =
      memoryStorage.createConversation(
        savedContext
      );

    setCurrentConversation(
      newConversation
    );

    setMessages([]);

    setIsSidebarOpen(false);

    setSidebarRefreshTrigger(
      (prev) => prev + 1
    );
  };

  const handleConversationSelect = (
    conversation: ConversationMemory
  ) => {
    setCurrentConversation(conversation);

    const displayMessages: ChatMessageType[] =
      conversation.messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.isUser,
        timestamp: new Date(msg.timestamp),
      }));

    setMessages(displayMessages);

    setIsSidebarOpen(false);
  };

  const handleConversationDelete = (
    conversationId: string
  ) => {
    if (
      currentConversation?.id ===
      conversationId
    ) {
      handleNewChat();
    }
  };

  const handleConversationRename = (
    conversationId: string,
    newTitle: string
  ) => {
    if (
      currentConversation?.id ===
      conversationId
    ) {
      setCurrentConversation(
        (prev) =>
          prev
            ? {
                ...prev,
                title: newTitle,
              }
            : null
      );
    }

    setSidebarRefreshTrigger(
      (prev) => prev + 1
    );
  };

  const handleSendMessage = async (
    message: string
  ) => {
    if (!currentConversation) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    };

    const memoryUserMessage: MemoryChatMessage = {
      id: userMessage.id,
      content: userMessage.content,
      isUser: userMessage.isUser,
      timestamp: userMessage.timestamp,
    };

    const isFirstMessage =
      currentConversation.messages.length ===
      0;

    memoryStorage.addMessage(
      memoryUserMessage
    );

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setIsLoading(true);

    if (isFirstMessage) {
      generateTitle(message);
    }

    try {
      const selectedProvider =
        localStorage.getItem(
          "selected_provider"
        ) || "gemini";

      const apiKey =
        selectedProvider === "gemini"
          ? localStorage.getItem(
              "gemini_api_key"
            )
          : localStorage.getItem(
              "openai_api_key"
            );

      if (!apiKey) {
        const errorMessage: ChatMessageType =
          {
            id: (
              Date.now() + 1
            ).toString(),
            content: `Please add your ${selectedProvider} API key in the settings dialog.`,
            isUser: false,
            timestamp: new Date(),
          };

        setMessages((prev) => [
          ...prev,
          errorMessage,
        ]);

        return;
      }

      if (
        memoryStorage.needsSummarization()
      ) {
        await handleSummarization();
      }

      const aiMessageId = (
        Date.now() + 1
      ).toString();

      const aiMessage: ChatMessageType = {
        id: aiMessageId,
        content: "",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [
        ...prev,
        aiMessage,
      ]);

      const conversation =
        memoryStorage.getCurrentConversation();

      const latestContext =
        localStorage.getItem(
          "chat_context"
        ) || "";

      let fullContext =
        latestContext ||
        conversation?.context ||
        "";

      if (conversation?.summary) {
        fullContext +=
          `\n\nPrevious conversation summary: ${conversation.summary}`;
      }

      if (
        conversation?.messages &&
        conversation.messages.length > 0
      ) {
        const conversationHistory =
          conversation.messages
            .map(
              (msg) =>
                `${
                  msg.isUser
                    ? "User"
                    : "Assistant"
                }: ${msg.content}`
            )
            .join("\n\n");

        fullContext +=
          `\n\nRecent conversation history:\n${conversationHistory}`;
      }

      const response = await fetch(
        "/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message,
            context: fullContext,
            apiKey,
            selectedProvider,
          }),
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json();

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: `Error: ${errorData.error}`,
                }
              : msg
          )
        );

        return;
      }

      const data = await response.json();

      if (data.error) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: `Error: ${data.error}`,
                }
              : msg
          )
        );
      } else {
        const words =
          data.message.split(" ");

        let currentContent = "";

        for (
          let i = 0;
          i < words.length;
          i++
        ) {
          currentContent +=
            words[i] +
            (i < words.length - 1
              ? " "
              : "");

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content:
                      currentContent,
                  }
                : msg
            )
          );

          await new Promise(
            (resolve) =>
              setTimeout(resolve, 50)
          );
        }

        const memoryAiMessage:
          MemoryChatMessage = {
          id: aiMessageId,
          content: data.message,
          isUser: false,
          timestamp: new Date(),
        };

        memoryStorage.addMessage(
          memoryAiMessage
        );
      }
    } catch (error) {
      console.error(
        "Message sending failed:",
        error
      );

      const errorMessage: ChatMessageType =
        {
          id: (
            Date.now() + 1
          ).toString(),
          content:
            "Failed to send message. Please try again.",
          isUser: false,
          timestamp: new Date(),
        };

      setMessages((prev) => [
        ...prev,
        errorMessage,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="shrink-0">
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() =>
            setIsSidebarOpen(
              !isSidebarOpen
            )
          }
          currentConversation={
            currentConversation
          }
          isGeneratingTitle={
            isGeneratingTitle
          }
          onNewChat={handleNewChat}
        />
      </div>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="relative flex min-h-0 flex-1">
        {/* Sidebar */}

        <ChatSidebar
          isOpen={isSidebarOpen}
          onClose={() =>
            setIsSidebarOpen(false)
          }
          currentConversationId={
            currentConversation?.id || null
          }
          onConversationSelect={
            handleConversationSelect
          }
          onNewChat={handleNewChat}
          onConversationDelete={
            handleConversationDelete
          }
          onConversationRename={
            handleConversationRename
          }
          refreshTrigger={
            sidebarRefreshTrigger
          }
        />

        {/* Chat Area */}

        <div className="flex min-h-0 flex-1 flex-col">
          {/* Memory Badge */}

          <div className="shrink-0">
            <MemoryBadge
              isSummarizing={
                isSummarizing
              }
              totalWords={
                currentConversation?.totalWords ||
                0
              }
              maxWords={262144}
            />
          </div>

          {/* =================================================
              MESSAGES
          ================================================== */}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              /* =================================================
                 PREMIUM EMPTY STATE
              ================================================== */

              <div className="flex min-h-full items-center justify-center px-5 py-10">
                <div className="w-full max-w-3xl">
                  {/* Icon */}

                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-sm">
                    <Sparkles className="h-6 w-6 text-foreground/80" />
                  </div>

                  {/* Heading */}

                  <div className="text-center">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      Your personal AI assistant
                    </h1>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                      Ask anything you want to
                      learn, explore, create, or
                      understand. I'm here to
                      help.
                    </p>
                  </div>

                  {/* Suggestions */}

                  <div className="mt-8 grid gap-2 sm:grid-cols-2">
                    {suggestions.map(
                      (suggestion) => {
                        const Icon =
                          suggestion.icon;

                        return (
                          <button
                            key={
                              suggestion.title
                            }
                            type="button"
                            onClick={() =>
                              handleSendMessage(
                                suggestion.prompt
                              )
                            }
                            className="
                              group
                              flex
                              items-center
                              gap-3
                              rounded-xl
                              border
                              border-border/70
                              bg-card/50
                              px-4
                              py-3.5
                              text-left
                              transition-all
                              duration-200
                              hover:-translate-y-[1px]
                              hover:bg-accent
                              hover:shadow-sm
                            "
                          >
                            <div
                              className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-border/60
                                bg-background
                                transition-colors
                                group-hover:bg-background
                              "
                            >
                              <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-medium">
                                {
                                  suggestion.title
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {
                                  suggestion.description
                                }
                              </p>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Small footer */}

                  <p className="mt-7 text-center text-[11px] text-muted-foreground/50">
                    Your conversations and
                    memory stay in your personal
                    workspace.
                  </p>
                </div>
              </div>
            ) : (
              /* =================================================
                 NORMAL CHAT
              ================================================== */

              <div className="mx-auto w-full max-w-4xl space-y-4 p-5 pb-8 sm:p-6">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    id={msg.id}
                    content={msg.content}
                    isUser={msg.isUser}
                    timestamp={
                      msg.timestamp
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* =================================================
              INPUT
          ================================================== */}

          <div className="shrink-0">
            <ChatInput
              onSendMessage={
                handleSendMessage
              }
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}