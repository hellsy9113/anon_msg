"use client";

import { Switch } from "@/components/ui/switch";

interface AcceptMessagesToggleProps {
  acceptMessages: boolean;
  loading: boolean;
  onToggle: (checked: boolean) => void;
}

export default function AcceptMessagesToggle({
  acceptMessages,
  loading,
  onToggle,
}: AcceptMessagesToggleProps) {
  return (
    <div className="flex items-center gap-4">
      <Switch
        checked={acceptMessages}
        disabled={loading}
        onCheckedChange={onToggle}
      />

      <span className="text-sm font-medium">
        Accept Messages:
        {acceptMessages ? " On" : " Off"}
      </span>
    </div>
  );
}