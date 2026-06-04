import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
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
};

export function IconButton({
  children,
  label,
  title,
  ...props
}: IconButtonProps) {
  return (
    <Tooltip label={label}>
      <Button aria-label={label} size="icon" title={title ?? label} {...props}>
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
};

export function Tooltip({ children, label }: TooltipProps) {
  return (
    <span className="tooltip-wrap">
      {children}
      <span className="tooltip-content" role="tooltip">
        {label}
      </span>
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
        {meta && <small>{meta}</small>}
      </summary>
      <div className="section-body">{children}</div>
    </details>
  );
}
