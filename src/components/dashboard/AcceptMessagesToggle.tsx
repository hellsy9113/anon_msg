"use client";

import { Switch } from "@/components/ui/switch";

interface AcceptMessagesToggleProps {
  acceptMessages: boolean;
  loading: boolean;
  onToggle: (checked: boolean) => void | Promise<boolean | void>;
  title?: string;
  activeDescription?: string;
  inactiveDescription?: string;
}

export default function AcceptMessagesToggle({
  acceptMessages,
  loading,
  onToggle,
  title = "Accept messages",
  activeDescription = "Public inbox is open",
  inactiveDescription = "Public inbox is paused",
}: AcceptMessagesToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="text-xs text-muted-foreground">
          {acceptMessages ? activeDescription : inactiveDescription}
        </p>
      </div>

      <Switch
        checked={acceptMessages}
        disabled={loading}
        onCheckedChange={onToggle}
      />
    </div>
  );
}
