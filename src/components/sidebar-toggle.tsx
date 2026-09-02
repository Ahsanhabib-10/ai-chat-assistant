"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SidebarToggle({
  isOpen,
  onToggle,
}: SidebarToggleProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      aria-expanded={isOpen}
      className="
        h-8 w-8
        rounded-lg
        border border-transparent
        text-muted-foreground
        transition-all duration-200
        hover:border-white/[0.07]
        hover:bg-white/[0.055]
        hover:text-foreground
        active:scale-95
      "
    >
      {isOpen ? (
        <X className="h-4 w-4 transition-transform duration-200" />
      ) : (
        <Menu className="h-4 w-4 transition-transform duration-200" />
      )}
    </Button>
  );
}