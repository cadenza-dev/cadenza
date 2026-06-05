import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import type React from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Group, Panel, Separator } from "react-resizable-panels";

export function cn(...parts: Array<false | null | string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const buttonVariants = cva("ui-button", {
  defaultVariants: {
    size: "sm",
    variant: "secondary",
  },
  variants: {
    size: {
      icon: "ui-button-icon",
      lg: "ui-button-lg",
      sm: "ui-button-sm",
      xs: "ui-button-xs",
    },
    variant: {
      destructive: "ui-button-destructive",
      ghost: "ui-button-ghost",
      outline: "ui-button-outline",
      primary: "ui-button-primary",
      secondary: "ui-button-secondary",
    },
  },
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  children,
  className,
  size,
  variant,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ size, variant }), className)}
      type={props.type ?? "button"}
      {...props}
    >
      {children}
    </button>
  );
}

type IconButtonProps = ButtonProps & {
  readonly label: string;
  readonly tooltipSide?: TooltipSide;
};

export function IconButton({
  children,
  label,
  tooltipSide,
  ...props
}: IconButtonProps) {
  return (
    <Tooltip label={label} side={tooltipSide}>
      <Button aria-label={label} size="icon" {...props}>
        {children}
      </Button>
    </Tooltip>
  );
}

type BadgeTone =
  | "blocked"
  | "checking"
  | "limited"
  | "neutral"
  | "ready"
  | "warning";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  readonly tone?: BadgeTone;
};

export function Badge({
  children,
  className,
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span className={cn("ui-badge", `ui-badge-${tone}`, className)} {...props}>
      {children}
    </span>
  );
}

type TooltipProps = {
  readonly children: ReactNode;
  readonly label: string;
  readonly side?: TooltipSide;
};

type TooltipSide = "bottom" | "left" | "right" | "top";

type TooltipPosition = {
  readonly left: number;
  readonly top: number;
};

export function Tooltip({ children, label, side = "bottom" }: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const dismissTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({
    left: 0,
    top: 0,
  });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 10;
    const nextPosition =
      side === "right"
        ? { left: rect.right + gap, top: rect.top + rect.height / 2 }
        : side === "left"
          ? { left: rect.left - gap, top: rect.top + rect.height / 2 }
          : side === "top"
            ? { left: rect.left + rect.width / 2, top: rect.top - gap }
            : { left: rect.left + rect.width / 2, top: rect.bottom + gap };

    setPosition(nextPosition);
  }, [side]);

  useLayoutEffect(() => {
    if (!open) return undefined;

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  const show = () => {
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    setDismissed(false);
    setOpen(true);
    updatePosition();
  };

  const hide = () => {
    setOpen(false);
  };

  const dismissAfterClick = () => {
    setDismissed(true);
    setOpen(false);
    dismissTimerRef.current = window.setTimeout(() => {
      setDismissed(false);
      dismissTimerRef.current = null;
    }, 500);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: wrapper only positions the portal tooltip around the nested interactive control.
    <span
      className="tooltip-wrap"
      onBlur={hide}
      onFocus={show}
      onMouseEnter={show}
      onMouseLeave={hide}
      onPointerDown={dismissAfterClick}
      ref={triggerRef}
    >
      {children}
      {open &&
        !dismissed &&
        createPortal(
          <span
            className={`tooltip-content tooltip-${side}`}
            role="tooltip"
            style={{
              left: position.left,
              top: position.top,
            }}
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  );
}

type ResizablePanelGroupProps = React.ComponentProps<typeof Group>;
type ResizablePanelProps = React.ComponentProps<typeof Panel>;
type ResizableHandleProps = React.ComponentProps<typeof Separator> & {
  readonly label: string;
};

export function ResizablePanelGroup(props: ResizablePanelGroupProps) {
  return <Group data-slot="resizable-panel-group" {...props} />;
}

export function ResizablePanel({ children, ...props }: ResizablePanelProps) {
  return (
    <Panel data-slot="resizable-panel" {...props}>
      {children}
    </Panel>
  );
}

export function ResizableHandle({
  className,
  label,
  ...props
}: ResizableHandleProps) {
  return (
    <Separator
      aria-label={label}
      className={cn("resize-handle", className)}
      data-slot="resizable-handle"
      title={label}
      {...props}
    >
      <span />
    </Separator>
  );
}

type SectionProps = {
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly id: string;
  readonly meta?: string;
  readonly title: string;
};

export function Section({
  children,
  defaultOpen = false,
  id,
  meta,
  title,
}: SectionProps) {
  return (
    <details className="section" data-section-id={id} open={defaultOpen}>
      <summary>
        <span>{title}</span>
        <span className="section-summary-end">
          {meta && <small>{meta}</small>}
          <ChevronDown
            aria-hidden="true"
            className="section-chevron"
            size={15}
          />
        </span>
      </summary>
      <div className="section-body">{children}</div>
    </details>
  );
}
