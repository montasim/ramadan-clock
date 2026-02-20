"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export type GradientColor = "primary" | "success" | "danger";

export interface PrimaryAction {
  label: string | ((loading: boolean) => string);
  onClick: () => void | Promise<void>;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  icon?: React.ReactNode;
}

export interface SecondaryAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: boolean;
  className?: string;
}

export interface AppModalProps {
  // Control
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Header
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;

  // Visual Customization
  showGradientBorder?: boolean;
  gradientColor?: GradientColor;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  className?: string;

  // Content
  children?: React.ReactNode;

  // Footer
  showFooter?: boolean;
  primaryAction?: PrimaryAction;
  secondaryAction?: SecondaryAction;
  footerClassName?: string;

  // Close Button
  showCloseButton?: boolean;
}

// ============================================================================
// Utilities
// ============================================================================

const getGradientColor = (color: GradientColor): string => {
  switch (color) {
    case "primary":
      return "var(--grad-primary)";
    case "success":
      return "linear-gradient(135deg,#10b981,#059669)";
    case "danger":
      return "linear-gradient(135deg,#ef4444,#dc2626)";
    default:
      return "var(--grad-primary)";
  }
};

const getMaxWidthClass = (maxWidth?: "sm" | "md" | "lg" | "xl"): string => {
  switch (maxWidth) {
    case "sm":
      return "sm:max-w-sm";
    case "md":
      return "sm:max-w-md";
    case "lg":
      return "sm:max-w-lg";
    case "xl":
      return "sm:max-w-xl";
    default:
      return "sm:max-w-md";
  }
};

// ============================================================================
// Component
// ============================================================================

export function AppModal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  iconClassName = "bg-primary/10",
  titleClassName,
  descriptionClassName,
  maxWidth = "md",
  className,
  children,
  showFooter = true,
  primaryAction,
  secondaryAction,
  footerClassName,
  showCloseButton = true,
}: AppModalProps) {
  const handlePrimaryAction = async () => {
    if (primaryAction?.onClick) {
      await primaryAction.onClick();
    }
  };

  const getPrimaryLabel = () => {
    if (!primaryAction) return "";
    if (typeof primaryAction.label === "function") {
      return primaryAction.label(primaryAction.loading || false);
    }
    return primaryAction.loading && primaryAction.loadingText
      ? primaryAction.loadingText
      : primaryAction.label;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "border-border/60 bg-card",
          getMaxWidthClass(maxWidth),
          className
        )}
        showCloseButton={showCloseButton}
      >
        <DialogHeader>
          {icon && (
            <div className="flex items-center gap-3 mb-1">
              <div className={cn("p-2.5 rounded-xl", iconClassName)}>
                {icon}
              </div>
              <DialogTitle className={cn("text-lg font-bold", titleClassName)}>
                {title}
              </DialogTitle>
            </div>
          )}
          {!icon && (
            <DialogTitle className={cn("text-lg font-bold", titleClassName)}>
              {title}
            </DialogTitle>
          )}
          {description && (
            <div className={cn(icon ? "pl-[52px]" : "", descriptionClassName)}>
              <DialogDescription asChild>
                <span>{description}</span>
              </DialogDescription>
            </div>
          )}
        </DialogHeader>

        {children && <div className="py-2">{children}</div>}

        {showFooter && (primaryAction || secondaryAction) && (
          <DialogFooter className={cn(icon ? "mt-2" : "", footerClassName)}>
            {secondaryAction && (
              <Button
                variant={secondaryAction.variant || "outline"}
                className={cn("rounded-full", secondaryAction.className)}
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled || primaryAction?.loading}
              >
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                variant={primaryAction.variant || "default"}
                className={cn(
                  primaryAction.variant === "default" ? "btn-gradient" : "",
                  "rounded-full",
                  primaryAction.className
                )}
                onClick={handlePrimaryAction}
                disabled={primaryAction.disabled || primaryAction.loading}
              >
                {primaryAction.loading && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {primaryAction.icon && !primaryAction.loading && (
                  <span className="mr-2">{primaryAction.icon}</span>
                )}
                {getPrimaryLabel()}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
