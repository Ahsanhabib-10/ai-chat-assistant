"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConversationMemory } from "@/lib/memory-types";
import {
  Brain,
  MessageSquare,
  Plus,
  Search,
  X,
} from "lucide-react";
import { ChatListItem } from "./chat-list-item";
import { MemoryStorageService } from "@/lib/memory-storage";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentConversationId: string | null;
  onConversationSelect: (conversation: ConversationMemory) => void;
  onNewChat: () => void;
  onConversationDelete: (conversationId: string) => void;
  onConversationRename: (conversationId: string, newTitle: string) => void;
  refreshTrigger?: number;
}

export function ChatSidebar({
  isOpen,
  onClose,
  currentConversationId,
  onConversationSelect,
  onNewChat,
  onConversationDelete,
  onConversationRename,
  refreshTrigger,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<ConversationMemory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<
    ConversationMemory[]
  >([]);

  const memoryStorage = MemoryStorageService.getInstance();

  const loadConversations = () => {
    const allConversations = memoryStorage.getAllConversations();

    setConversations(allConversations);
    setFilteredConversations(allConversations);
  };

  useEffect(() => {
    loadConversations();

    const handleStorageChange = () => {
      loadConversations();
    };

    const handleTitleUpdate = () => {
      loadConversations();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("titleUpdated", handleTitleUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("titleUpdated", handleTitleUpdate);
    };
  }, []);

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadConversations();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter(
      (conversation) =>
        conversation.title.toLowerCase().includes(query) ||
        conversation.lastMessagePreview.toLowerCase().includes(query)
    );

    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

  const handleConversationSelect = (conversationId: string) => {
    const conversation =
      memoryStorage.switchToConversation(conversationId);

    if (conversation) {
      onConversationSelect(conversation);
    }
  };

  const handleDelete = (conversationId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?"
    );

    if (!confirmed) return;

    memoryStorage.deleteConversation(conversationId);
    onConversationDelete(conversationId);

    loadConversations();
  };

  const handleRename = (
    conversationId: string,
    newTitle: string
  ) => {
    memoryStorage.updateConversationTitle(
      conversationId,
      newTitle
    );

    onConversationRename(conversationId, newTitle);

    loadConversations();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto">
      {/* Mobile backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className="
          absolute left-0 top-0 h-full w-[300px]
          bg-[var(--sidebar)]
          border-r border-sidebar-border
          flex flex-col
          shadow-2xl shadow-black/20
          lg:relative lg:translate-x-0
        "
      >
        {/* =====================================================
            BRAND HEADER
        ====================================================== */}

        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Brand mark */}
              <div
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-xl
                  border border-white/10
                  bg-white/[0.06]
                  shadow-inner shadow-white/[0.04]
                "
              >
                <Brain className="h-[18px] w-[18px]" />
              </div>

              <div className="leading-none">
                <div className="text-[15px] font-semibold tracking-tight">
                  Personal Chat Assistant
                </div>

                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  AI Workspace
                </div>
              </div>
            </div>

            {/* Mobile close */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="
                h-8 w-8 rounded-lg
                text-muted-foreground
                hover:bg-white/[0.06]
                hover:text-foreground
                lg:hidden
              "
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* =====================================================
            NEW CHAT
        ====================================================== */}

        <div className="px-3 pt-2">
          <Button
            onClick={onNewChat}
            className="
              h-10 w-full
              justify-start
              gap-2.5
              rounded-xl
              border border-white/[0.08]
              bg-white/[0.055]
              px-3
              text-sm font-medium
              shadow-none
              transition-all
              hover:bg-white/[0.09]
              hover:border-white/[0.12]
              active:scale-[0.99]
            "
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/10">
              <Plus className="h-3.5 w-3.5" />
            </div>

            <span>New conversation</span>

            <span className="ml-auto text-[10px] text-muted-foreground">
              N
            </span>
          </Button>
        </div>

        {/* =====================================================
            SEARCH
        ====================================================== */}

        <div className="px-3 pt-3 pb-3">
          <div className="relative">
            <Search
              className="
                absolute left-3 top-1/2
                h-3.5 w-3.5
                -translate-y-1/2
                text-muted-foreground
              "
            />

            <Input
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search conversations"
              className="
                h-9
                rounded-lg
                border-white/[0.07]
                bg-white/[0.035]
                pl-9 pr-3
                text-xs
                shadow-none
                placeholder:text-muted-foreground/60
                focus-visible:border-white/[0.14]
                focus-visible:ring-0
              "
            />
          </div>
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-white/[0.06]" />

        {/* =====================================================
            CONVERSATION HEADER
        ====================================================== */}

        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Conversations
          </span>

          <span className="text-[10px] tabular-nums text-muted-foreground/70">
            {filteredConversations.length}
          </span>
        </div>

        {/* =====================================================
            CONVERSATION LIST
        ====================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {filteredConversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div
                className="
                  mb-4 flex h-11 w-11
                  items-center justify-center
                  rounded-xl
                  border border-white/[0.07]
                  bg-white/[0.035]
                "
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>

              <p className="text-sm font-medium">
                {searchQuery
                  ? "No conversations found"
                  : "No conversations yet"}
              </p>

              <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-muted-foreground">
                {searchQuery
                  ? "Try searching with another keyword."
                  : "Start a new conversation to begin chatting with Personal Chat Assistant."}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredConversations.map((conversation) => (
                <ChatListItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={
                    conversation.id === currentConversationId
                  }
                  onSelect={handleConversationSelect}
                  onDelete={handleDelete}
                  onRename={handleRename}
                />
              ))}
            </div>
          )}
        </div>

        {/* =====================================================
            SIDEBAR FOOTER
        ====================================================== */}

        <div className="border-t border-white/[0.06] px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Workspace
              </p>

              <p className="mt-0.5 text-xs text-foreground/80">
                {conversations.length}{" "}
                {conversations.length === 1
                  ? "conversation"
                  : "conversations"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Memory
              </p>

              <p className="mt-0.5 text-xs tabular-nums text-foreground/80">
                {memoryStorage
                  .getMemoryStats()
                  .totalWords.toLocaleString()}{" "}
                words
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}