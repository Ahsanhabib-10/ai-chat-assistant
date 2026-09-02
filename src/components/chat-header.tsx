"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConversationMemory } from "@/lib/memory-types";
import { Plus, Sparkles } from "lucide-react";
import { SidebarToggle } from "./sidebar-toggle";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentConversation: ConversationMemory | null;
  isGeneratingTitle: boolean;
  onNewChat: () => void;
}

export function ChatHeader({
  isSidebarOpen,
  onToggleSidebar,
  currentConversation,
  isGeneratingTitle,
  onNewChat,
}: ChatHeaderProps) {
  return (
    <header
      className="
        relative z-40
        h-16 w-full flex-shrink-0
        border-b border-white/[0.06]
        bg-background/80
        backdrop-blur-2xl
      "
    >
      {/* Subtle top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

      <div className="flex h-full items-center justify-between px-3 sm:px-5 lg:px-6">
        {/* =====================================================
            LEFT SIDE
        ====================================================== */}

        <div className="flex min-w-0 items-center gap-3">
          {/* Sidebar toggle */}
          <SidebarToggle
            isOpen={isSidebarOpen}
            onToggle={onToggleSidebar}
          />

          {/* Divider */}
          <div className="hidden h-5 w-px bg-white/[0.08] sm:block" />

          {/* Current conversation */}
          {currentConversation ? (
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2.5">
                {/* AI indicator */}
                <div
                  className="
                    hidden h-7 w-7 shrink-0
                    items-center justify-center
                    rounded-lg
                    border border-white/[0.08]
                    bg-white/[0.045]
                    shadow-inner shadow-white/[0.03]
                    sm:flex
                  "
                >
                  <Sparkles className="h-3.5 w-3.5 text-foreground/80" />
                </div>

                <div className="min-w-0">
                  <h1
                    className="
                      max-w-[170px]
                      truncate
                      text-sm font-medium
                      tracking-tight
                      text-foreground
                      sm:max-w-[260px]
                      md:max-w-md
                    "
                  >
                    {currentConversation.title}
                  </h1>

                  {isGeneratingTitle ? (
                    <div
                      className="
                        mt-0.5 flex items-center gap-1.5
                        text-[10px]
                        text-muted-foreground
                      "
                    >
                      <span className="inline-flex gap-0.5">
                        <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-current" />
                      </span>

                      <span>Generating title</span>
                    </div>
                  ) : (
                    <div className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">
                      Personal Learning Agent
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="
                  flex h-8 w-8
                  items-center justify-center
                  rounded-lg
                  border border-white/[0.08]
                  bg-white/[0.045]
                "
              >
                <Sparkles className="h-3.5 w-3.5" />
              </div>

              <span className="text-sm font-medium">
                Personal Learning Agent
              </span>
            </div>
          )}
        </div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}

        <div className="flex shrink-0 items-center gap-2">
          {/* New Chat */}
          <Button
            onClick={onNewChat}
            variant="outline"
            size="sm"
            className="
              h-9
              rounded-xl
              border-white/[0.08]
              bg-white/[0.035]
              px-3
              shadow-none
              transition-all
              hover:border-white/[0.13]
              hover:bg-white/[0.07]
              active:scale-[0.98]
            "
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />

            <span className="hidden text-xs font-medium sm:inline">
              New Chat
            </span>
          </Button>

          {/* User / Personal Workspace */}
          <div
            className="
              hidden items-center gap-2
              border-l border-white/[0.07]
              pl-3
              sm:flex
            "
          >
            <Avatar
              className="
                h-8 w-8
                border border-white/[0.10]
                ring-1 ring-white/[0.03]
              "
            >
              <AvatarImage
                src="/ahsan.jpeg"
                alt="Personal"
              />

              <AvatarFallback className="text-xs font-medium">
                PW
              </AvatarFallback>
            </Avatar>

            <div className="hidden leading-none md:block">
              <p className="text-xs font-medium">
                Personal
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                Workspace
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
