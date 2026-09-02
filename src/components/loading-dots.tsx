"use client";

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({
  className = "",
}: LoadingDotsProps) {
  return (
    <div
      className={`inline-flex items-center ${className}`}
      aria-label="Chat Assistant is thinking"
      role="status"
    >
      <div
        className="
          flex items-center gap-1
          rounded-full
          border border-white/[0.07]
          bg-white/[0.035]
          px-2.5 py-1.5
        "
      >
        <span
          className="
            h-1.5 w-1.5
            rounded-full
            bg-current
            animate-bounce
            [animation-delay:-0.3s]
          "
        />

        <span
          className="
            h-1.5 w-1.5
            rounded-full
            bg-current
            animate-bounce
            [animation-delay:-0.15s]
          "
        />

        <span
          className="
            h-1.5 w-1.5
            rounded-full
            bg-current
            animate-bounce
          "
        />
      </div>
    </div>
  );
}