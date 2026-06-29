"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { AuthSidePanel } from "./AuthSidePanel";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: "login" | "register";
}

export function AuthModal({
  isOpen,
  onOpenChange,
  defaultView = "login",
}: AuthModalProps) {
  const [view, setView] = useState<"login" | "register">(defaultView);

  // Reset view when modal opens
  if (isOpen && view !== defaultView && !isOpen) {
    setView(defaultView);
  }

  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden border-none shadow-2xl bg-white gap-0">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <div className="flex flex-col md:flex-row h-[600px]">
          {/* Left Side - Image/Branding */}
          <AuthSidePanel />

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 bg-white flex flex-col relative">
            {/* Close button is handled by DialogContent default, but we might want to style it or place it manually if DialogContent's default is not ideal with this layout. 
                 The default DialogContent usually puts a close button absolute top-right. 
                 We'll let the default one be for now, or override styles globally if needed.
             */}

            <div className="flex-1 overflow-y-auto py-8 px-8 md:px-12 flex items-center">
              <div className="w-full">
                {view === "login" ? (
                  <LoginForm
                    isModal
                    onSuccess={handleSuccess}
                    onSwitchToRegister={() => setView("register")}
                  />
                ) : (
                  <RegisterForm
                    isModal
                    onSuccess={handleSuccess}
                    onSwitchToLogin={() => setView("login")}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
