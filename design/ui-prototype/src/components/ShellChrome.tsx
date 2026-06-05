import {
  AlertTriangle,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  Columns3,
  Gauge,
  Maximize,
  Moon,
  PanelBottom,
  PanelLeft,
  PanelRight,
  Presentation,
  ShieldCheck,
  Sun,
} from "lucide-react";
import type { OutlineEntry, PrototypeState, StateId } from "../fixture";
import { deck, outline } from "../fixture";
import { outlineAt, stateEntries } from "../prototype-utils";
import type { MobilePanelId, Theme } from "../types";
import { Button, cn, IconButton } from "../ui";

type TopBarProps = {
  readonly bottomOpen: boolean;
  readonly copiedNotice: string;
  readonly inspectorOpen: boolean;
  readonly mobilePanel: MobilePanelId;
  readonly onMobilePanel: (panel: MobilePanelId) => void;
  readonly onScenario: (state: StateId) => void;
  readonly onSwap: () => void;
  readonly onTheme: () => void;
  readonly scenarioId: StateId;
  readonly setBottomOpen: (value: (current: boolean) => boolean) => void;
  readonly setInspectorOpen: (value: (current: boolean) => boolean) => void;
  readonly setSlideOpen: (value: (current: boolean) => boolean) => void;
  readonly sideSwap: boolean;
  readonly slideOpen: boolean;
  readonly theme: Theme;
};

export function TopBar({
  bottomOpen,
  copiedNotice,
  inspectorOpen,
  mobilePanel,
  onMobilePanel,
  onScenario,
  onSwap,
  onTheme,
  scenarioId,
  setBottomOpen,
  setInspectorOpen,
  setSlideOpen,
  sideSwap,
  slideOpen,
  theme,
}: TopBarProps) {
  const leftKind = sideSwap ? "inspector" : "slides";
  const rightKind = sideSwap ? "slides" : "inspector";
  const leftOpen = leftKind === "inspector" ? inspectorOpen : slideOpen;
  const rightOpen = rightKind === "inspector" ? inspectorOpen : slideOpen;
  const toggleLeft = () => {
    if (leftKind === "inspector") setInspectorOpen((value) => !value);
    else setSlideOpen((value) => !value);
  };
  const toggleRight = () => {
    if (rightKind === "inspector") setInspectorOpen((value) => !value);
    else setSlideOpen((value) => !value);
  };

  return (
    <header className="top-bar">
      <div className="brand-cluster">
        <div className="app-mark">
          <Presentation size={18} />
        </div>
        <div>
          <div className="product-name">Cadenza Player App</div>
          <div className="deck-subtitle">{deck.title}</div>
        </div>
      </div>

      <nav className="scenario-switcher" aria-label="Prototype fixture states">
        {stateEntries.map((state) => {
          const Icon = state.health === "Blocked" ? AlertTriangle : Gauge;
          return (
            <Button
              aria-pressed={scenarioId === state.id}
              className={cn(scenarioId === state.id && "active")}
              key={state.id}
              onClick={() => onScenario(state.id)}
              size="xs"
              variant={scenarioId === state.id ? "primary" : "ghost"}
            >
              <Icon size={14} />
              <span>{state.label}</span>
            </Button>
          );
        })}
      </nav>

      <div className="copy-toast" data-copy-status="">
        {copiedNotice}
      </div>

      <fieldset className="mobile-actions">
        <legend className="sr-only">Mobile drawer controls</legend>
        <IconButton
          aria-pressed={mobilePanel === "slides"}
          label="Open slide drawer"
          onClick={() =>
            onMobilePanel(mobilePanel === "slides" ? "none" : "slides")
          }
          tooltipSide="bottom"
          variant={mobilePanel === "slides" ? "primary" : "ghost"}
        >
          <PanelLeft size={17} />
        </IconButton>
        <IconButton
          aria-pressed={mobilePanel === "inspector"}
          label="Open inspector drawer"
          onClick={() =>
            onMobilePanel(mobilePanel === "inspector" ? "none" : "inspector")
          }
          tooltipSide="bottom"
          variant={mobilePanel === "inspector" ? "primary" : "ghost"}
        >
          <PanelRight size={17} />
        </IconButton>
      </fieldset>

      <fieldset className="layout-actions">
        <legend className="sr-only">Layout controls</legend>
        <IconButton
          aria-pressed={leftOpen}
          label={`Toggle left ${leftKind} rail`}
          onClick={toggleLeft}
          tooltipSide="bottom"
          variant={leftOpen ? "outline" : "ghost"}
        >
          <PanelLeft size={17} />
        </IconButton>
        <IconButton
          aria-pressed={bottomOpen}
          label="Toggle action-anchor controls"
          onClick={() => setBottomOpen((value) => !value)}
          tooltipSide="bottom"
          variant={bottomOpen ? "outline" : "ghost"}
        >
          <PanelBottom size={17} />
        </IconButton>
        <IconButton
          aria-pressed={rightOpen}
          label={`Toggle right ${rightKind} rail`}
          onClick={toggleRight}
          tooltipSide="bottom"
          variant={rightOpen ? "outline" : "ghost"}
        >
          <PanelRight size={17} />
        </IconButton>
        <IconButton
          aria-pressed={sideSwap}
          label="Swap slide and inspector rails"
          onClick={onSwap}
          tooltipSide="bottom"
          variant={sideSwap ? "outline" : "ghost"}
        >
          <ArrowLeftRight size={17} />
        </IconButton>
        <IconButton
          label={theme === "dark" ? "Use light theme" : "Use dark theme"}
          onClick={onTheme}
          tooltipSide="bottom"
          variant="ghost"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </IconButton>
      </fieldset>
    </header>
  );
}

type PlaybackToolbarProps = {
  readonly anchorIndex: number;
  readonly next: () => void;
  readonly onFullscreen: () => void;
  readonly previous: () => void;
};

export function PlaybackToolbar({
  anchorIndex,
  next,
  onFullscreen,
  previous,
}: PlaybackToolbarProps) {
  return (
    <section className="playback-toolbar" aria-label="Action-anchor controls">
      <div className="transport">
        <IconButton
          label="Previous action anchor"
          onClick={previous}
          tooltipSide="top"
        >
          <ArrowLeft size={18} />
        </IconButton>
        <IconButton
          label="Enter fullscreen"
          onClick={onFullscreen}
          tooltipSide="top"
          variant="outline"
        >
          <Maximize size={18} />
        </IconButton>
        <IconButton label="Next action anchor" onClick={next} tooltipSide="top">
          <ArrowRight size={18} />
        </IconButton>
      </div>
      <div
        className="anchor-progress"
        data-anchor-title={outlineAt(anchorIndex).title}
      >
        <div className="progress-track" aria-hidden="true">
          <span
            style={{
              width: `${((anchorIndex + 1) / outline.length) * 100}%`,
            }}
          />
        </div>
        <small>
          Action anchor {anchorIndex + 1} of {outline.length}
        </small>
      </div>
    </section>
  );
}

type StatusBarProps = {
  readonly onOpenHealth: () => void;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

export function StatusBar({
  onOpenHealth,
  selectedSlide,
  state,
}: StatusBarProps) {
  return (
    <footer className="status-bar">
      <div className="status-left">
        <div className="status-cluster">
          <Columns3 size={14} />
          <span>{deck.deckId}</span>
        </div>
        <div className="anchor-signal">
          <BookOpen size={14} />
          <span>{selectedSlide.title}</span>
        </div>
      </div>
      <div className="status-right">
        <div className="status-spacer">
          <ShieldCheck size={14} />
          <span>pre-Architect prototype · non-freeze evidence</span>
        </div>
        <button
          className={cn("health-signal", `health-${state.accent}`)}
          data-health-side="right"
          onClick={onOpenHealth}
          type="button"
        >
          <Gauge size={14} />
          <span>{state.health}</span>
        </button>
      </div>
    </footer>
  );
}
