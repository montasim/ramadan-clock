import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

/**
 * Page Hero Section Component
 * A reusable hero section component for all pages
 */

export interface PageHeroProps {
  /** Subtitle text displayed above the title (can be string or JSX) */
  subtitle?: ReactNode;
  /** Main title of the page (can be string or JSX for gradient text) */
  title: ReactNode;
  /** Optional description text */
  description?: string;
  /** Optional icon to display on the left side of the title */
  icon?: LucideIcon;
  /** Actions/buttons to display on the right side */
  actions?: ReactNode;
  /** Additional class names for the container */
  className?: string;
  /** Position of the decorative orb (default: right) */
  orbPosition?: "left" | "right";
  /** Size of the decorative orb (default: w-48 h-48) */
  orbSize?: string;
  /** Opacity of the decorative orb (default: 15) */
  orbOpacity?: number;
  /** Additional content to display between title and actions */
  extraContent?: ReactNode;
}

export function PageHero({
  subtitle,
  title,
  description,
  icon: Icon,
  actions,
  className = "",
  orbPosition = "right",
  orbSize = "w-48 h-48",
  orbOpacity = 15,
  extraContent,
}: PageHeroProps) {
  const orbClass = orbPosition === "left" ? "-top-16 -left-16" : "-top-16 -right-16";

  return (
    <div className={`hero-section px-5 py-6 sm:px-6 sm:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 overflow-hidden relative ${className}`}>
      {/* Decorative Orb */}
      <div
        className={`absolute ${orbClass} ${orbSize} rounded-full opacity-${orbOpacity} blur-3xl pointer-events-none`}
        style={{ background: "var(--grad-primary)" }}
        aria-hidden="true"
      />

      {/* Left Side: Icon, Title, Description */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 relative z-10 text-center sm:text-left">
        {Icon && (
          <div
            className="p-3 rounded-xl shadow-lg hidden sm:block"
            style={{ background: "var(--grad-primary)" }}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
        <div className="flex-1">
          {subtitle && (
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] gradient-text mb-1 sm:mb-0.5">
              {typeof subtitle === "string" ? subtitle : subtitle}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
            {typeof title === "string" ? title : title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-xs sm:text-sm mt-1 sm:mt-2">
              {description}
            </p>
          )}
          {extraContent && (
            <div className="mt-2">
              {extraContent}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Actions */}
      {actions && (
        <div className="relative z-10 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
