import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Copy,
  Minimize,
  Presentation,
} from "lucide-react";
import { useState } from "react";
import type { OutlineEntry, PrototypeState } from "../fixture";
import { outline } from "../fixture";
import type { CopyText, MenuPosition } from "../types";
import { Button, cn } from "../ui";
import { DeckSlide } from "./Deck";

type FullscreenViewProps = {
  readonly anchorIndex: number;
  readonly copiedNotice: string;
  readonly next: () => void;
  readonly onCopy: CopyText;
  readonly onExit: () => void;
  readonly onPresenter: () => void;
  readonly previous: () => void;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

export function FullscreenView({
  anchorIndex,
  copiedNotice,
  next,
  onCopy,
  onExit,
  onPresenter,
  previous,
  selectedSlide,
  state,
}: FullscreenViewProps) {
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [lastTapAt, setLastTapAt] = useState(0);
  const isLastAnchor = anchorIndex >= outline.length - 1;
  const nextOrExit = () => {
    if (isLastAnchor) onExit();
    else next();
  };

  const closeMenu = () => setMenuPosition(null);
  const runMenuAction = (action: () => void) => {
    action();
    closeMenu();
  };

  return (
    <main
      className={cn("fullscreen-shell", `state-${state.accent}`)}
      onContextMenu={(event) => {
        event.preventDefault();
        const menuWidth = 190;
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
      onTouchEnd={(event) => {
        const endX = event.changedTouches[0]?.clientX ?? 0;
        const delta = touchStart === null ? 0 : endX - touchStart;
        const now = Date.now();
        if (Math.abs(delta) > 36) {
          if (delta < 0) nextOrExit();
          else previous();
        } else if (now - lastTapAt < 320) {
          nextOrExit();
        } else {
          previous();
        }
        setLastTapAt(now);
        setTouchStart(null);
      }}
      onTouchStart={(event) => {
        setTouchStart(event.touches[0]?.clientX ?? null);
      }}
    >
      <div className="fullscreen-stage">
        <DeckSlide selectedSlide={selectedSlide} state={state} />
      </div>
      {menuPosition && (
        <button
          aria-label="Close fullscreen menu"
          className="fullscreen-menu-dismiss"
          onClick={closeMenu}
          type="button"
        />
      )}
      <button
        aria-label="Previous action anchor"
        className="edge-hit edge-hit-left"
        onClick={(event) => {
          event.stopPropagation();
          closeMenu();
          previous();
        }}
        type="button"
      >
        <ChevronLeft size={34} />
      </button>
      <button
        aria-label="Next action anchor"
        className="edge-hit edge-hit-right"
        onClick={(event) => {
          event.stopPropagation();
          closeMenu();
          nextOrExit();
        }}
        type="button"
      >
        <ChevronRight size={34} />
      </button>
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
            onClick={() => runMenuAction(onPresenter)}
            size="xs"
            variant="ghost"
          >
            <Presentation size={14} />
            presenter view
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
