import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Copy,
  Minimize,
  Pause,
  Play,
  Presentation,
  RotateCcw,
  Timer,
} from "lucide-react";
import {
  type PointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { OutlineEntry, PrototypeState } from "../fixture";
import { outline } from "../fixture";
import { outlineAt } from "../prototype-utils";
import type { CopyText, MenuPosition } from "../types";
import { Badge, Button, cn } from "../ui";
import { DeckSlide } from "./Deck";
import { PlaybackToolbar } from "./ShellChrome";

const presenterSplitBounds = {
  defaultControlsHeight: 88,
  defaultPreviewPercent: 66.667,
  defaultNextPercent: 50,
  maxControlsHeight: 124,
  max: 66.667,
  minControlsHeight: 88,
  min: 33.333,
} as const;

export type PresenterLayout = {
  readonly controlsHeight: number;
  readonly nextPercent: number;
  readonly previewPercent: number;
};

export const defaultPresenterLayout: PresenterLayout = {
  controlsHeight: presenterSplitBounds.defaultControlsHeight,
  nextPercent: presenterSplitBounds.defaultNextPercent,
  previewPercent: presenterSplitBounds.defaultPreviewPercent,
};

type PresenterViewProps = {
  readonly anchorIndex: number;
  readonly copiedNotice: string;
  readonly layout: PresenterLayout;
  readonly next: () => void;
  readonly onCopy: CopyText;
  readonly onExit: () => void;
  readonly onHidePresenter: () => void;
  readonly onLayoutChange: (layout: PresenterLayout) => void;
  readonly previous: () => void;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

type PresenterResizeAxis = "horizontal" | "vertical";
type PresenterResizeTarget = PresenterResizeAxis | "controls";

const presenterDeckSize = {
  height: 630,
  width: 1120,
} as const;

function clampPresenterSplit(value: number) {
  return Math.min(
    Math.max(value, presenterSplitBounds.min),
    presenterSplitBounds.max,
  );
}

function clampControlsHeight(value: number) {
  return Math.min(
    Math.max(value, presenterSplitBounds.minControlsHeight),
    presenterSplitBounds.maxControlsHeight,
  );
}

function formatElapsed(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;
  return [hours, minutes, remainingSeconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

function formatClock(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
  }).format(date);
}

export function PresenterView({
  anchorIndex,
  copiedNotice,
  layout,
  next,
  onCopy,
  onExit,
  onHidePresenter,
  onLayoutChange,
  previous,
  selectedSlide,
  state,
}: PresenterViewProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [clockTime, setClockTime] = useState(() => new Date());
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [activeResize, setActiveResize] =
    useState<PresenterResizeTarget | null>(null);
  const nextSlide = outlineAt(anchorIndex + 1);
  const isLastAnchor = anchorIndex >= outline.length - 1;
  const notes = useMemo(
    () => [
      {
        body: selectedSlide.summary,
        label: "Current cue",
      },
      {
        body: `Connect ${selectedSlide.title} to the local alpha boundary and keep the review surface read-only.`,
        label: "Speaker intent",
      },
      {
        body: "Notes are presenter-only. They do not imply hosted release, repair, editor, or re-export actions.",
        label: "Boundary reminder",
      },
    ],
    [selectedSlide.summary, selectedSlide.title],
  );

  useEffect(() => {
    if (!timerRunning) return undefined;
    const interval = window.setInterval(
      () => setElapsedSeconds((value) => value + 1),
      1000,
    );
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    const interval = window.setInterval(() => setClockTime(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const closeMenu = () => setMenuPosition(null);
  const runMenuAction = (action: () => void) => {
    action();
    closeMenu();
  };
  const nextOrExit = () => {
    if (isLastAnchor) onExit();
    else next();
  };

  const startResize = useCallback(
    (target: PresenterResizeTarget, event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setActiveResize(target);

      const container = event.currentTarget.parentElement;
      if (!container) {
        setActiveResize(null);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const updateFromPointer = (moveEvent: globalThis.PointerEvent) => {
        if (target === "horizontal") {
          const previewPercent =
            ((moveEvent.clientX - containerRect.left) / containerRect.width) *
            100;
          onLayoutChange({
            ...layout,
            previewPercent: clampPresenterSplit(previewPercent),
          });
          return;
        }

        if (target === "controls") {
          const controlsHeight = containerRect.bottom - moveEvent.clientY;
          onLayoutChange({
            ...layout,
            controlsHeight: clampControlsHeight(controlsHeight),
          });
          return;
        }

        const nextPercent =
          ((moveEvent.clientY - containerRect.top) / containerRect.height) *
          100;
        onLayoutChange({
          ...layout,
          nextPercent: clampPresenterSplit(nextPercent),
        });
      };

      const stopResize = () => {
        setActiveResize(null);
        window.removeEventListener("pointermove", updateFromPointer);
        window.removeEventListener("pointerup", stopResize);
        window.removeEventListener("pointercancel", stopResize);
      };

      window.addEventListener("pointermove", updateFromPointer);
      window.addEventListener("pointerup", stopResize);
      window.addEventListener("pointercancel", stopResize);
    },
    [layout, onLayoutChange],
  );

  return (
    <main
      className={cn("presenter-shell", `state-${state.accent}`)}
      onContextMenu={(event) => {
        event.preventDefault();
        const menuWidth = 210;
        const menuHeight = 180;
        setMenuPosition({
          left: Math.max(
            8,
            Math.min(event.clientX, window.innerWidth - menuWidth - 8),
          ),
          top: Math.max(
            8,
            Math.min(event.clientY, window.innerHeight - menuHeight - 8),
          ),
        });
      }}
    >
      <section
        aria-label="Presenter view"
        className="presenter-stage-grid"
        style={{
          gridTemplateColumns: `${layout.previewPercent}% 10px minmax(0, 1fr)`,
        }}
      >
        <section
          className="presenter-preview-pane"
          aria-label="Current slide"
          style={{
            gridTemplateRows: `34px minmax(0, 1fr) 10px ${layout.controlsHeight}px`,
          }}
        >
          <header className="presenter-topbar">
            <div className="presenter-clock-cluster">
              <Timer size={16} />
              <span>{formatElapsed(elapsedSeconds)}</span>
              <Button
                aria-label={timerRunning ? "Pause timer" : "Start timer"}
                onClick={() => setTimerRunning((value) => !value)}
                size="icon"
                variant="ghost"
              >
                {timerRunning ? <Pause size={15} /> : <Play size={15} />}
              </Button>
              <Button
                aria-label="Reset timer"
                onClick={() => {
                  setElapsedSeconds(0);
                  setTimerRunning(true);
                }}
                size="icon"
                variant="ghost"
              >
                <RotateCcw size={15} />
              </Button>
            </div>
            <div className="presenter-clock-cluster presenter-wall-clock">
              <Clock3 size={16} />
              <span>{formatClock(clockTime)}</span>
            </div>
          </header>
          <PresenterDeckPreview
            className="presenter-slide-stage"
            selectedSlide={selectedSlide}
            state={state}
          />
          <button
            aria-label="Resize presenter action-anchor controls"
            className="resize-handle resize-handle-horizontal presenter-resize-handle presenter-controls-resize-handle"
            data-resize-handle-active={
              activeResize === "controls" ? "" : undefined
            }
            onPointerDown={(event) => startResize("controls", event)}
            type="button"
          >
            <span />
          </button>
          <div className="presenter-bottom-nav">
            <PlaybackToolbar
              anchorIndex={anchorIndex}
              fullscreenActive
              fullscreenLabel="Exit presentation"
              next={nextOrExit}
              onFullscreen={onExit}
              previous={previous}
            />
          </div>
        </section>
        <button
          aria-label="Resize presenter preview and notes boundary"
          className="resize-handle rail-resize-handle presenter-resize-handle"
          data-resize-handle-active={
            activeResize === "horizontal" ? "" : undefined
          }
          onPointerDown={(event) => startResize("horizontal", event)}
          type="button"
        >
          <span />
        </button>
        <aside
          aria-label="Next slide and speaker notes"
          className="presenter-side-pane"
          style={{
            gridTemplateRows: `${layout.nextPercent}% 10px minmax(0, 1fr)`,
          }}
        >
          <section className="presenter-panel presenter-next-panel">
            <header className="presenter-panel-header">
              <h2>Next</h2>
              <span>
                {isLastAnchor ? "End" : `Action anchor ${anchorIndex + 2}`}
              </span>
            </header>
            {isLastAnchor ? (
              <div className="presenter-end-state">
                <Presentation size={26} />
                <strong>End of deck</strong>
                <span className="presenter-end-action">
                  <span>Use</span>
                  <Button
                    aria-label="Use next action anchor to return"
                    onClick={onExit}
                    size="icon"
                    variant="ghost"
                  >
                    <ArrowRight size={15} />
                  </Button>
                  <span>/</span>
                  <Button
                    aria-label="Use highlighted exit presentation to return"
                    onClick={onExit}
                    size="icon"
                    variant="primary"
                  >
                    <Minimize size={15} />
                  </Button>
                  <span>to return.</span>
                </span>
              </div>
            ) : (
              <PresenterDeckPreview
                className="presenter-next-preview"
                selectedSlide={nextSlide}
                state={state}
              />
            )}
          </section>
          <button
            aria-label="Resize presenter next and notes boundary"
            className="resize-handle resize-handle-horizontal presenter-resize-handle presenter-resize-handle-horizontal"
            data-resize-handle-active={
              activeResize === "vertical" ? "" : undefined
            }
            onPointerDown={(event) => startResize("vertical", event)}
            type="button"
          >
            <span />
          </button>
          <section className="presenter-panel presenter-notes-panel">
            <header className="presenter-panel-header">
              <h2>Notes</h2>
              <Badge className="presenter-only-badge" tone="neutral">
                presenter-only
              </Badge>
            </header>
            <div className="presenter-notes-content">
              {notes.map((note) => (
                <article key={note.label}>
                  <span>{note.label}</span>
                  <p>{note.body}</p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>
      {menuPosition && (
        <button
          aria-label="Close fullscreen menu"
          className="fullscreen-menu-dismiss"
          onClick={closeMenu}
          type="button"
        />
      )}
      {menuPosition && (
        <div
          className="fullscreen-menu"
          role="menu"
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
          }}
        >
          <Button
            onClick={() => runMenuAction(previous)}
            size="xs"
            variant="ghost"
          >
            <ArrowLeft size={14} />
            previous
          </Button>
          <Button
            onClick={() => runMenuAction(nextOrExit)}
            size="xs"
            variant="ghost"
          >
            <ArrowRight size={14} />
            {isLastAnchor ? "exit fullscreen" : "next"}
          </Button>
          <Button
            onClick={() =>
              runMenuAction(() =>
                onCopy(selectedSlide.slideId, "Action anchor"),
              )
            }
            size="xs"
            variant="ghost"
          >
            <Copy size={14} />
            copy anchor
          </Button>
          <Button
            onClick={() => runMenuAction(onHidePresenter)}
            size="xs"
            variant="ghost"
          >
            <Presentation size={14} />
            hide presenter view
          </Button>
          <Button
            onClick={() => runMenuAction(onExit)}
            size="xs"
            variant="ghost"
          >
            <Minimize size={14} />
            exit
          </Button>
        </div>
      )}
      {copiedNotice && (
        <div className="copy-toast fullscreen">{copiedNotice}</div>
      )}
    </main>
  );
}

type PresenterDeckPreviewProps = {
  readonly className: string;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

function PresenterDeckPreview({
  className,
  selectedSlide,
  state,
}: PresenterDeckPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const updateScale = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const nextScale = Math.min(
      rect.width / presenterDeckSize.width,
      rect.height / presenterDeckSize.height,
      1,
    );
    setScale(Number.isFinite(nextScale) ? Math.max(0.05, nextScale) : 1);
  }, []);

  useLayoutEffect(() => {
    updateScale();
    const container = containerRef.current;
    if (!container) return undefined;

    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [updateScale]);

  return (
    <div className={cn("presenter-deck-preview", className)} ref={containerRef}>
      <div
        className="presenter-deck-scale-box"
        style={{ transform: `scale(${scale})` }}
      >
        <DeckSlide selectedSlide={selectedSlide} state={state} />
      </div>
    </div>
  );
}
