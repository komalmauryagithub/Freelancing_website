"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SanitizedUser } from "@/lib/auth";
import { LogOut } from "lucide-react";

export function PortalClientView({ user }: { user: SanitizedUser }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {user.role === "ADMIN" && (
        <Button variant="secondary" size="sm" href="/admin">
          Admin Console
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        isLoading={isLoggingOut}
        icon={<LogOut className="w-3.5 h-3.5" />}
      >
        Sign Out
      </Button>
    </div>
  );
}
