"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Check, AlertCircle, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface SettingsDialogProps {
  selectedProvider: "gemini" | "openai";
  onProviderChange: (provider: "gemini" | "openai") => void;
}

type Theme = "light" | "dark" | "system";

export function SettingsDialog({
  selectedProvider,
  onProviderChange,
}: SettingsDialogProps) {
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [keyStatus, setKeyStatus] = useState({
    gemini: false,
    openai: false,
  });

  const { theme, setTheme } = useTheme();

  // Load API keys
  useEffect(() => {
    const savedGeminiKey =
      localStorage.getItem("gemini_api_key") || "";

    const savedOpenaiKey =
      localStorage.getItem("openai_api_key") || "";

    setGeminiKey(savedGeminiKey);
    setOpenaiKey(savedOpenaiKey);

    setKeyStatus({
      gemini: !!savedGeminiKey,
      openai: !!savedOpenaiKey,
    });
  }, []);

  // Save API key
  const saveApiKey = (
    keyType: "gemini" | "openai",
    keyValue: string
  ) => {
    if (!keyValue.trim()) {
      alert(`Please enter a ${keyType} API key`);
      return;
    }

    try {
      localStorage.setItem(
        `${keyType}_api_key`,
        keyValue.trim()
      );

      if (keyType === "gemini") {
        setGeminiKey("");
      } else {
        setOpenaiKey("");
      }

      setKeyStatus((prev) => ({
        ...prev,
        [keyType]: true,
      }));

      alert(
        `${keyType.toUpperCase()} API key saved successfully!`
      );
    } catch {
      alert("Failed to save API key. Please try again.");
    }
  };

  // Save provider
  const saveProviderSelection = (
    provider: "gemini" | "openai"
  ) => {
    onProviderChange(provider);

    localStorage.setItem(
      "selected_provider",
      provider
    );
  };

  // Change theme
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const themeOptions: {
    value: Theme;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "light",
      label: "Light",
      description: "Bright appearance",
      icon: <Sun className="h-4 w-4" />,
    },
    {
      value: "dark",
      label: "Dark",
      description: "Dark appearance",
      icon: <Moon className="h-4 w-4" />,
    },
    {
      value: "system",
      label: "System",
      description: "Use device preference",
      icon: <Monitor className="h-4 w-4" />,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* =====================================================
              APPEARANCE
          ====================================================== */}

          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium">
                Appearance
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Choose how Chat Assistant looks on your device.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => {
                const isSelected = theme === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handleThemeChange(option.value)
                    }
                    className={`
                      relative
                      flex
                      min-h-[82px]
                      flex-col
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      px-2
                      py-3
                      text-center
                      transition-all
                      duration-200
                      ${
                        isSelected
                          ? "border-foreground/25 bg-foreground/[0.07] shadow-sm"
                          : "border-border/60 bg-muted/30 hover:bg-muted/60"
                      }
                    `}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div
                        className="
                          absolute
                          right-2
                          top-2
                          flex
                          h-4
                          w-4
                          items-center
                          justify-center
                          rounded-full
                          bg-foreground
                          text-background
                        "
                      >
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}

                    <div
                      className={`
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        ${
                          isSelected
                            ? "border-foreground/15 bg-foreground/[0.08]"
                            : "border-border/60 bg-background"
                        }
                      `}
                    >
                      {option.icon}
                    </div>

                    <div>
                      <div className="text-xs font-medium">
                        {option.label}
                      </div>

                      <div className="mt-0.5 text-[9px] text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/60" />

          {/* =====================================================
              AI PROVIDER
          ====================================================== */}

          <div className="space-y-3">
            <div className="text-sm font-medium">
              AI Provider
            </div>

            <div className="flex gap-3">
              <label
                className={`
                  flex
                  flex-1
                  cursor-pointer
                  items-center
                  gap-2
                  rounded-xl
                  border
                  px-3
                  py-3
                  transition-all
                  ${
                    selectedProvider === "gemini"
                      ? "border-foreground/20 bg-foreground/[0.06]"
                      : "border-border/60 hover:bg-muted/50"
                  }
                `}
              >
                <input
                  type="radio"
                  name="provider"
                  value="gemini"
                  checked={selectedProvider === "gemini"}
                  onChange={() =>
                    saveProviderSelection("gemini")
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm">
                  Gemini
                </span>
              </label>

              <label
                className={`
                  flex
                  flex-1
                  cursor-pointer
                  items-center
                  gap-2
                  rounded-xl
                  border
                  px-3
                  py-3
                  transition-all
                  ${
                    selectedProvider === "openai"
                      ? "border-foreground/20 bg-foreground/[0.06]"
                      : "border-border/60 hover:bg-muted/50"
                  }
                `}
              >
                <input
                  type="radio"
                  name="provider"
                  value="openai"
                  checked={selectedProvider === "openai"}
                  onChange={() =>
                    saveProviderSelection("openai")
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm">
                  OpenAI GPT
                </span>
              </label>
            </div>

            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              Currently using:{" "}
              <strong className="text-foreground">
                {selectedProvider === "gemini"
                  ? "Gemini"
                  : "OpenAI GPT"}
              </strong>
            </div>
          </div>

          {/* =====================================================
              API KEYS
          ====================================================== */}

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              API Keys
            </div>

            {/* Status */}
            <div className="space-y-2 rounded-xl border border-border/60 p-3">
              <div className="flex items-center justify-between text-xs">
                <span>Gemini API Key</span>

                <span
                  className={`flex items-center gap-1 ${
                    keyStatus.gemini
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {keyStatus.gemini ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}

                  {keyStatus.gemini
                    ? "Configured"
                    : "Not Set"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span>OpenAI API Key</span>

                <span
                  className={`flex items-center gap-1 ${
                    keyStatus.openai
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {keyStatus.openai ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}

                  {keyStatus.openai
                    ? "Configured"
                    : "Not Set"}
                </span>
              </div>
            </div>

            {/* Gemini */}
            <div className="space-y-2">
              <label
                htmlFor="gemini-key"
                className="text-sm font-medium"
              >
                GEMINI API KEY
              </label>

              <div className="flex gap-2">
                <Input
                  id="gemini-key"
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={geminiKey}
                  onChange={(e) =>
                    setGeminiKey(e.target.value)
                  }
                  className="flex-1"
                />

                <Button
                  onClick={() =>
                    saveApiKey("gemini", geminiKey)
                  }
                  disabled={!geminiKey.trim()}
                  size="sm"
                >
                  Save
                </Button>
              </div>
            </div>

            {/* OpenAI */}
            <div className="space-y-2">
              <label
                htmlFor="openai-key"
                className="text-sm font-medium"
              >
                OPENAI API KEY
              </label>

              <div className="flex gap-2">
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="Enter your OpenAI API key"
                  value={openaiKey}
                  onChange={(e) =>
                    setOpenaiKey(e.target.value)
                  }
                  className="flex-1"
                />

                <Button
                  onClick={() =>
                    saveApiKey("openai", openaiKey)
                  }
                  disabled={!openaiKey.trim()}
                  size="sm"
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Note */}
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <strong className="text-foreground">
                Note:
              </strong>{" "}
              Your API keys are stored in localStorage for
              convenience. Only the selected provider will be
              used for chat responses.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}