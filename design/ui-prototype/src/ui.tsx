import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import type React from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  Ref,
} from "react";
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
  readonly arrowLeft: number;
  readonly arrowTop: number;
  readonly left: number;
  readonly top: number;
};

type TooltipStyle = React.CSSProperties & {
  "--tooltip-arrow-left": string;
  "--tooltip-arrow-top": string;
};

function clampValue(value: number, min: number, max: number) {
  const safeMax = Math.max(min, max);
  return Math.min(Math.max(value, min), safeMax);
}

function clampArrowOffset(value: number, size: number) {
  const padding = Math.min(14, Math.max(0, size / 2));
  return clampValue(value, padding, size - padding);
}

export function Tooltip({ children, label, side = "bottom" }: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const dismissTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({
    arrowLeft: 0,
    arrowTop: 0,
    left: 0,
    top: 0,
  });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    const rect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const anchorX = rect.left + rect.width / 2;
    const anchorY = rect.top + rect.height / 2;
    const gap = 10;
    const viewportPadding = 8;
    const width = tooltipRect.width;
    const height = tooltipRect.height;
    const unclampedLeft =
      side === "right"
        ? rect.right + gap
        : side === "left"
          ? rect.left - gap - width
          : anchorX - width / 2;
    const unclampedTop =
      side === "bottom"
        ? rect.bottom + gap
        : side === "top"
          ? rect.top - gap - height
          : anchorY - height / 2;
    const left = clampValue(
      unclampedLeft,
      viewportPadding,
      window.innerWidth - width - viewportPadding,
    );
    const top = clampValue(
      unclampedTop,
      viewportPadding,
      window.innerHeight - height - viewportPadding,
    );

    setPosition({
      arrowLeft: clampArrowOffset(anchorX - left, width),
      arrowTop: clampArrowOffset(anchorY - top, height),
      left,
      top,
    });
  }, [side]);

  useLayoutEffect(() => {
    if (!open) return undefined;

    updatePosition();
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(updatePosition);
    if (observer) {
      if (triggerRef.current) observer.observe(triggerRef.current);
      if (tooltipRef.current) observer.observe(tooltipRef.current);
    }
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      observer?.disconnect();
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
  const tooltipStyle: TooltipStyle = {
    "--tooltip-arrow-left": `${position.arrowLeft}px`,
    "--tooltip-arrow-top": `${position.arrowTop}px`,
    left: position.left,
    top: position.top,
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
            ref={tooltipRef}
            role="tooltip"
            style={tooltipStyle}
          >
            <span className="tooltip-label">{label}</span>
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
  readonly bodyRef?: Ref<HTMLDivElement>;
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly id: string;
  readonly meta?: string;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
  readonly title: string;
};

export function Section({
  bodyRef,
  children,
  defaultOpen = false,
  id,
  meta,
  onOpenChange,
  open,
  title,
}: SectionProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const expanded = open ?? uncontrolledOpen;
  const [renderBody, setRenderBody] = useState(expanded);
  const bodyId = `${id}-section-body`;

  useLayoutEffect(() => {
    if (expanded) {
      setRenderBody(true);
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setRenderBody(false);
    }, 170);
    return () => window.clearTimeout(timeout);
  }, [expanded]);

  const toggleOpen = () => {
    const nextOpen = !expanded;
    if (open === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  return (
    <section
      className="section"
      data-open={expanded ? "true" : "false"}
      data-section-id={id}
    >
      <button
        aria-controls={bodyId}
        aria-expanded={expanded}
        className="section-summary"
        onClick={toggleOpen}
        type="button"
      >
        <span>{title}</span>
        <span className="section-summary-end">
          {meta && <small>{meta}</small>}
          <ChevronDown
            aria-hidden="true"
            className="section-chevron"
            size={15}
          />
        </span>
      </button>
      {renderBody && (
        <div className="section-body" id={bodyId} ref={bodyRef}>
          {children}
        </div>
      )}
    </section>
  );
}
