import type {
  ChatMessage as ChatMessageType,
} from "./lib/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
          isUser
            ? "bg-foreground text-background rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        }`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
}
