"use client";

import { ConversationMemory } from "@/lib/memory-types";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatListItemProps {
  conversation: ConversationMemory;
  isActive: boolean;
  onSelect: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  onRename: (conversationId: string, newTitle: string) => void;
}

export function ChatListItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: ChatListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [showMenu, setShowMenu] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditTitle(conversation.title);
  }, [conversation.title]);

  useEffect(() => {
    if (!showMenu) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showMenu]);

  useEffect(() => {
    if (!isEditing) return;

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [isEditing]);

  const handleRename = () => {
    const trimmedTitle = editTitle.trim();

    if (trimmedTitle && trimmedTitle !== conversation.title) {
      onRename(conversation.id, trimmedTitle);
    } else {
      setEditTitle(conversation.title);
    }

    setIsEditing(false);
  };

  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleRename();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setEditTitle(conversation.title);
      setIsEditing(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const target = new Date(date);

    const difference = now.getTime() - target.getTime();

    const minutes = Math.floor(difference / 60000);
    const hours = Math.floor(difference / 3600000);
    const days = Math.floor(difference / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;

    return target.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={`
        group relative flex w-full items-center
        rounded-xl
        border
        transition-all duration-200
        ${
          isActive
            ? "border-white/[0.07] bg-white/[0.065] shadow-sm dark:border-white/[0.07] dark:bg-white/[0.065]"
            : "border-transparent hover:border-black/[0.05] hover:bg-black/[0.035] dark:hover:border-white/[0.04] dark:hover:bg-white/[0.035]"
        }
      `}
    >
      {/* Active indicator */}
      <div
        className={`
          absolute left-0 top-2.5 bottom-2.5
          w-[2px]
          rounded-full
          transition-all duration-200
          ${
            isActive
              ? "bg-foreground opacity-100"
              : "bg-foreground opacity-0"
          }
        `}
      />

      {/* Conversation */}
      <button
        type="button"
        onClick={() => {
          if (!isEditing) {
            onSelect(conversation.id);
          }
        }}
        className="
          min-w-0 flex-1
          cursor-pointer
          px-3 py-2.5
          text-left
          outline-none
        "
      >
        <div className="flex min-w-0 gap-2.5">
          {/* Conversation icon */}
          <div
            className={`
              mt-0.5
              flex h-7 w-7 shrink-0
              items-center justify-center
              rounded-lg
              border
              transition-colors
              ${
                isActive
                  ? "border-black/[0.08] bg-black/[0.05] text-foreground dark:border-white/[0.09] dark:bg-white/[0.07] dark:text-foreground"
                  : "border-black/[0.05] bg-black/[0.025] text-muted-foreground dark:border-white/[0.05] dark:bg-white/[0.025] dark:text-muted-foreground"
              }
            `}
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Title */}
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                onBlur={handleRename}
                onKeyDown={handleKeyPress}
                onClick={(event) => event.stopPropagation()}
                className="
                  h-7 w-full
                  rounded-lg
                  border border-black/[0.12]
                  bg-black/[0.04]
                  px-2
                  text-xs font-medium
                  text-foreground
                  outline-none
                  placeholder:text-muted-foreground
                  focus:border-black/[0.2]
                  focus:bg-black/[0.06]
                  dark:border-white/[0.12]
                  dark:bg-white/[0.06]
                  dark:focus:border-white/[0.22]
                  dark:focus:bg-white/[0.08]
                "
              />
            ) : (
              <div
                className={`
                  truncate
                  pr-7
                  text-[12px]
                  font-medium
                  tracking-[-0.01em]
                  ${
                    isActive
                      ? "text-foreground"
                      : "text-foreground/80"
                  }
                `}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  setIsEditing(true);
                }}
                title={conversation.title}
              >
                {conversation.title}
              </div>
            )}

            {/* Preview */}
            {!isEditing && conversation.lastMessagePreview && (
              <div
                className="
                  mt-1
                  truncate
                  pr-7
                  text-[10px]
                  leading-4
                  text-muted-foreground/55
                "
                title={conversation.lastMessagePreview}
              >
                {conversation.lastMessagePreview}
              </div>
            )}

            {/* Metadata */}
            {!isEditing && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-[9px] text-muted-foreground/45">
                  {formatTime(conversation.updatedAt)}
                </span>

                {conversation.totalWords > 0 && (
                  <>
                    <span className="text-[8px] text-muted-foreground/25">
                      •
                    </span>

                    <span className="text-[9px] text-muted-foreground/40">
                      {conversation.totalWords.toLocaleString()} words
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Action Menu */}
      <div
        ref={menuRef}
        className="absolute right-1.5 top-1/2 -translate-y-1/2"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            setShowMenu((previous) => !previous);
          }}
          className={`
            h-7 w-7 rounded-lg
            text-muted-foreground
            transition-all duration-150
            ${
              showMenu
                ? "bg-black/[0.06] opacity-100 dark:bg-white/[0.08]"
                : "opacity-0 group-hover:opacity-100"
            }
            hover:bg-black/[0.08]
            hover:text-foreground
            dark:hover:bg-white/[0.09]
            dark:hover:text-foreground
          `}
          aria-label="Conversation options"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>

        {/* Context Menu */}
        {showMenu && (
          <div
            className="
              absolute right-0 top-8
              z-50
              w-36
              overflow-hidden
              rounded-xl
              border
              border-black/[0.08]
              bg-white/95
              p-1
              text-foreground
              shadow-2xl
              shadow-black/15
              backdrop-blur-2xl

              dark:border-white/[0.09]
              dark:bg-[#111214]/95
              dark:text-white
              dark:shadow-black/50
            "
            onClick={(event) => event.stopPropagation()}
          >
            {/* Rename */}
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                setIsEditing(true);
              }}
              className="
                flex w-full items-center gap-2
                rounded-lg
                px-2.5 py-2
                text-left
                text-xs
                font-medium
                text-black
                transition-colors
                hover:bg-black/[0.06]
                hover:text-black

                dark:text-white
                dark:hover:bg-white/[0.07]
                dark:hover:text-white
              "
            >
              <Pencil className="h-3.5 w-3.5 shrink-0" />
              <span>Rename</span>
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                onDelete(conversation.id);
              }}
              className="
                flex w-full items-center gap-2
                rounded-lg
                px-2.5 py-2
                text-left
                text-xs
                font-medium
                text-red-600
                transition-colors
                hover:bg-red-500/[0.08]
                hover:text-red-600

                dark:text-red-400
                dark:hover:bg-red-500/[0.08]
                dark:hover:text-red-400
              "
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}