import type { InitStatus } from "./lib/types";

interface StatusBarProps {
  status: InitStatus;
}

export function StatusBar({ status }: StatusBarProps) {
  const isError = status.stage === "error";

  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        isError
          ? "border-red-200 bg-red-50"
          : "border-border bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Status icon */}
        {isError ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dc2626"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        ) : (
          <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
        )}

        {/* Status text */}
        <div className="flex-1">
          <p
            className={`text-sm ${isError ? "text-red-700" : "text-foreground"}`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {status.message}
          </p>

          {/* Progress bar */}
          {!isError && status.progress > 0 && (
            <div className="mt-2 h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-300 ease-out"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          )}

          {/* Error details */}
          {isError && status.error && (
            <p className="mt-1 text-xs text-red-600" style={{ fontFamily: "'Space Mono', monospace" }}>
              {status.error}
            </p>
          )}
        </div>

        {/* Progress percentage */}
        {!isError && status.progress > 0 && (
          <span
            className="text-xs text-muted-foreground tabular-nums"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {status.progress}%
          </span>
        )}
      </div>
    </div>
  );
}
