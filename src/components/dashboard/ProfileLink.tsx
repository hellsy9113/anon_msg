"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProfileLinkProps {
  profileUrl: string;
}

export default function ProfileLink({
  profileUrl,
}: ProfileLinkProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        profileUrl
      );

      toast.success("Profile URL copied");
    } catch {
      toast.error("Failed to copy URL");
    }
  };
 return(
 <div className="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={profileUrl}
        disabled
        className="flex-1 rounded-md border px-3 py-2"
      />

      <Button onClick={copyToClipboard}>
        Copy Link
      </Button>
    </div>
  );
}