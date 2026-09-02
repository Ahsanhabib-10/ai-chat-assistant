"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContextDialog } from "./context-dialog";
import { SettingsDialog } from "./settings-dialog";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStopGeneration?: () => void;
  isLoading?: boolean;
}

export function ChatInput({
  onSendMessage,
  onStopGeneration,
  isLoading = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [selectedProvider, setSelectedProvider] =
    useState<"gemini" | "openai">("gemini");

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  // ============================================================
  // LOAD SAVED SETTINGS
  // ============================================================

  useEffect(() => {
    const savedProvider =
      (localStorage.getItem(
        "selected_provider"
      ) as "gemini" | "openai") || "gemini";

    const savedContext =
      localStorage.getItem("chat_context") || "";

    setSelectedProvider(savedProvider);
    setContext(savedContext);
  }, []);

  // ============================================================
  // PROVIDER
  // ============================================================

  const handleProviderChange = (
    provider: "gemini" | "openai"
  ) => {
    setSelectedProvider(provider);
  };

  // ============================================================
  // CONTEXT
  // ============================================================

  const handleContextChange = (
    newContext: string
  ) => {
    setContext(newContext);

    localStorage.setItem(
      "chat_context",
      newContext
    );
  };

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSendMessage = () => {
    const trimmedMessage =
      message.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    onSendMessage(trimmedMessage);

    setMessage("");

    // Reset textarea height.
    if (textareaRef.current) {
      textareaRef.current.style.height =
        "auto";
    }

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  // ============================================================
  // STOP GENERATION
  // ============================================================

  const handleStop = () => {
    if (!onStopGeneration) {
      return;
    }

    onStopGeneration();

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  // ============================================================
  // KEYBOARD
  // ============================================================

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      if (!isLoading) {
        handleSendMessage();
      }
    }
  };

  // ============================================================
  // AUTO RESIZE TEXTAREA
  // ============================================================

  const handleInput = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMessage(e.target.value);

    const textarea = e.target;

    textarea.style.height = "auto";

    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      180
    )}px`;
  };

  return (
    <div className="shrink-0 border-t border-white/[0.06] bg-background/80 px-3 py-3 backdrop-blur-xl sm:px-5 sm:py-4">
      <div className="mx-auto w-full max-w-4xl">

        {/* ====================================================
            COMPOSER
        ===================================================== */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border border-white/[0.09]
            bg-white/[0.035]
            shadow-2xl
            shadow-black/20
            transition-all
            focus-within:border-white/[0.16]
            focus-within:bg-white/[0.045]
          "
        >

          {/* ==================================================
              TEXT AREA
          =================================================== */}

          <div className="px-4 pt-3">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
              placeholder="Message Chat Assistant ..."
              className="
                block
                max-h-[180px]
                min-h-[44px]
                w-full
                resize-none
                overflow-y-auto
                border-0
                bg-transparent
                px-0
                py-2
                text-[14px]
                leading-6
                text-foreground
                outline-none
                placeholder:text-muted-foreground/50
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />
          </div>

          {/* ==================================================
              BOTTOM CONTROLS
          =================================================== */}

          <div className="flex items-center justify-between px-3 pb-3 pt-1">

            {/* =================================================
                LEFT CONTROLS
            ================================================= */}

            <div className="flex items-center gap-1">

              {/* Settings */}

              <SettingsDialog
                selectedProvider={
                  selectedProvider
                }
                onProviderChange={
                  handleProviderChange
                }
              />

              {/* Context */}

              <ContextDialog
                context={context}
                onContextChange={
                  handleContextChange
                }
              />

            </div>

            {/* =================================================
                SEND / STOP
            ================================================= */}

            {isLoading ? (
              <Button
                type="button"
                onClick={handleStop}
                size="icon"
                className="
                  h-9
                  w-9
                  rounded-xl
                  bg-foreground
                  text-background
                  shadow-none
                  transition-all
                  hover:scale-[1.03]
                  hover:bg-foreground/90
                  active:scale-95
                "
                aria-label="Stop generating"
                title="Stop generating"
              >
                <Square
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSendMessage}
                disabled={!message.trim()}
                size="icon"
                className="
                  h-9
                  w-9
                  rounded-xl
                  bg-foreground
                  text-background
                  shadow-none
                  transition-all
                  hover:bg-foreground/90
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
                aria-label="Send message"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* ====================================================
            HINT
        ===================================================== */}

        <p className="mt-2 text-center text-[10px] text-muted-foreground/50">
          Chat Assistant can make mistakes. Check
          important information.
        </p>
      </div>
    </div>
  );
}