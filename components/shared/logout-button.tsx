"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AppModal } from "@/components/ui/app-modal";
import { useState } from "react";

export function LogoutButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/login" });
    setIsOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        Logout
      </Button>

      <AppModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Logout"
        description="Are you sure you want to log out? You will need to sign in again to access your account."
        primaryAction={{
          label: "Logout",
          onClick: handleLogout,
          variant: "destructive",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsOpen(false),
        }}
      />
    </>
  );
}
