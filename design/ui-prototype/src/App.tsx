import {
  AlertTriangle,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Clock,
  Columns3,
  Copy,
  FileJson,
  Gauge,
  Info,
  ListTree,
  type LucideIcon,
  Maximize,
  Minimize,
  Moon,
  PanelBottom,
  PanelLeft,
  PanelRight,
  Pause,
  Play,
  Presentation,
  Route,
  ShieldCheck,
  Sun,
  Terminal,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import type { OutlineEntry, PrototypeState, StateId, Topic } from "./fixture";
import { deck, outline, states, topics } from "./fixture";
import {
  Badge,
  Button,
  cn,
  IconButton,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Section,
} from "./ui";

type Theme = "dark" | "light";
type MobilePanelId = "inspector" | "none" | "slides";
type InspectorSide = "left" | "right";

const stateEntries = Object.values(states);

const topicIcons: Record<Topic, LucideIcon> = {
  Diagnostics: Terminal,
  Limitations: AlertTriangle,
  Notes: Presentation,
  Outline: ListTree,
  Provenance: FileJson,
  Readiness: Gauge,
};

function initialParam(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return new URLSearchParams(window.location.search).get(name) ?? fallback;
}

function isStateId(value: string): value is StateId {
  return Object.hasOwn(states, value);
}

function isTopic(value: string): value is Topic {
  return topics.includes(value as Topic);
}

function isTheme(value: string): value is Theme {
  return value === "dark" || value === "light";
}

function isMobilePanelId(value: string): value is MobilePanelId {
  return value === "inspector" || value === "none" || value === "slides";
}

function clampIndex(value: number) {
  return Math.max(0, Math.min(value, outline.length - 1));
}

function outlineAt(index: number): OutlineEntry {
  return outline[clampIndex(index)] ?? outline[0];
}

function getInitialAnchor(stateId: StateId) {
  const raw = Number(
    initialParam("anchor", String(states[stateId].selectedIndex)),
  );
  return Number.isFinite(raw) ? clampIndex(raw) : states[stateId].selectedIndex;
}

function getInitialTopic(state: PrototypeState) {
  const value = initialParam("topic", state.defaultTopic);
  return isTopic(value) ? value : state.defaultTopic;
}

function App() {
  const initialState = initialParam("state", "ready");
  const initialStateId: StateId = isStateId(initialState)
    ? initialState
    : "ready";
  const [scenarioId, setScenarioId] = useState<StateId>(initialStateId);
  const selectedState = states[scenarioId];
  const [anchorIndex, setAnchorIndex] = useState(
    getInitialAnchor(initialStateId),
  );
  const [topic, setTopic] = useState<Topic>(() =>
    getInitialTopic(selectedState),
  );
  const initialTheme = initialParam("theme", "light");
  const [theme, setTheme] = useState<Theme>(
    isTheme(initialTheme) ? initialTheme : "light",
  );
  const [slideOpen, setSlideOpen] = useState(
    initialParam("slides", "open") !== "closed",
  );
  const [inspectorOpen, setInspectorOpen] = useState(
    initialParam("inspector", "open") !== "closed",
  );
  const [bottomOpen, setBottomOpen] = useState(
    initialParam("bottom", "open") !== "closed",
  );
  const [sideSwap, setSideSwap] = useState(
    initialParam("swap", "false") === "true",
  );
  const [fullscreen, setFullscreen] = useState(
    initialParam("fullscreen", "false") === "true",
  );
  const [playing, setPlaying] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState("");
  const initialPanel = initialParam("panel", "none");
  const [mobilePanel, setMobilePanel] = useState<MobilePanelId>(
    isMobilePanelId(initialPanel) ? initialPanel : "none",
  );

  const presenter = initialParam("presenter", "false") === "true";
  const selectedSlide = outlineAt(anchorIndex);
  const inspectorSide: InspectorSide = sideSwap ? "left" : "right";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const goToAnchor = useCallback((index: number) => {
    setPlaying(false);
    setAnchorIndex(clampIndex(index));
  }, []);

  const previous = useCallback(() => {
    goToAnchor(anchorIndex - 1);
  }, [anchorIndex, goToAnchor]);

  const next = useCallback(() => {
    goToAnchor(anchorIndex + 1);
  }, [anchorIndex, goToAnchor]);

  const switchScenario = useCallback((nextState: StateId) => {
    setScenarioId(nextState);
    setTopic(states[nextState].defaultTopic);
    setAnchorIndex(states[nextState].selectedIndex);
  }, []);

  const openHealthTopic = useCallback(() => {
    setInspectorOpen(true);
    setTopic(
      selectedState.health === "Blocked" || selectedState.health === "Warnings"
        ? "Diagnostics"
        : "Readiness",
    );
  }, [selectedState.health]);

  const copyText = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopiedNotice(`${label} copied`);
    } catch {
      setCopiedNotice(`${label} selected`);
    }
    window.setTimeout(() => setCopiedNotice(""), 1600);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      const activeControl =
        target instanceof HTMLElement &&
        Boolean(target.closest("button,input,summary,a"));
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      }
      if (event.key === " " && !activeControl) {
        event.preventDefault();
        setPlaying((value) => !value);
      }
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        setFullscreen((value) => !value);
      }
      if (event.key === "Escape") {
        setFullscreen(false);
        setMobilePanel("none");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, previous]);

  if (fullscreen) {
    return (
      <FullscreenView
        copiedNotice={copiedNotice}
        next={next}
        onCopy={copyText}
        onExit={() => setFullscreen(false)}
        playing={playing}
        previous={previous}
        selectedSlide={selectedSlide}
        setPlaying={setPlaying}
        state={selectedState}
      />
    );
  }

  return (
    <div className={cn("app-shell", `state-${selectedState.accent}`)}>
      <TopBar
        bottomOpen={bottomOpen}
        copiedNotice={copiedNotice}
        inspectorOpen={inspectorOpen}
        mobilePanel={mobilePanel}
        onMobilePanel={setMobilePanel}
        onScenario={switchScenario}
        onSwap={() => setSideSwap((value) => !value)}
        onTheme={() =>
          setTheme((value) => (value === "dark" ? "light" : "dark"))
        }
        scenarioId={scenarioId}
        setBottomOpen={setBottomOpen}
        setInspectorOpen={setInspectorOpen}
        setSlideOpen={setSlideOpen}
        sideSwap={sideSwap}
        slideOpen={slideOpen}
        theme={theme}
      />

      <main className="layout-frame" aria-label="Cadenza Player App prototype">
        <ResizablePanelGroup orientation="horizontal">
          <RailPanel
            isOpen={sideSwap ? inspectorOpen : slideOpen}
            kind={sideSwap ? "inspector" : "slides"}
          >
            {sideSwap ? (
              <InspectorRail
                activeTopic={topic}
                copyText={copyText}
                onAnchor={goToAnchor}
                onTopic={setTopic}
                open={inspectorOpen}
                selectedSlide={selectedSlide}
                state={selectedState}
                toggleOpen={() => setInspectorOpen((value) => !value)}
              />
            ) : (
              <SlideRail
                currentSlideId={selectedSlide.slideId}
                onSelect={goToAnchor}
              />
            )}
          </RailPanel>
          {(sideSwap ? inspectorOpen : slideOpen) && (
            <ResizableHandle label="Resize left rail boundary" />
          )}
          <ResizablePanel
            className="center-panel"
            defaultSize="52%"
            minSize="42%"
          >
            <ResizablePanelGroup orientation="vertical">
              <ResizablePanel
                className="deck-panel"
                defaultSize="78%"
                minSize="58%"
              >
                {selectedState.health === "Blocked" &&
                  selectedState.diagnostics[0] && (
                    <BlockingBanner
                      diagnostic={selectedState.diagnostics[0]}
                      onOpenDiagnostics={() => {
                        setInspectorOpen(true);
                        setTopic("Diagnostics");
                      }}
                    />
                  )}
                <DeckSurface
                  anchorIndex={anchorIndex}
                  presenter={presenter}
                  selectedSlide={selectedSlide}
                  state={selectedState}
                />
              </ResizablePanel>
              {bottomOpen && (
                <>
                  <ResizableHandle
                    className="resize-handle-horizontal"
                    label="Resize bottom action-anchor controls"
                  />
                  <ResizablePanel
                    className="center-bottom-panel"
                    defaultSize="22%"
                    maxSize="32%"
                    minSize="14%"
                  >
                    <PlaybackToolbar
                      anchorIndex={anchorIndex}
                      fullscreen={fullscreen}
                      next={next}
                      onFullscreen={() => setFullscreen(true)}
                      playing={playing}
                      previous={previous}
                      selectedSlide={selectedSlide}
                      setPlaying={setPlaying}
                      state={selectedState}
                    />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>
          {(sideSwap ? slideOpen : inspectorOpen) && (
            <ResizableHandle label="Resize right rail boundary" />
          )}
          <RailPanel
            isOpen={sideSwap ? slideOpen : inspectorOpen}
            kind={sideSwap ? "slides" : "inspector"}
          >
            {sideSwap ? (
              <SlideRail
                currentSlideId={selectedSlide.slideId}
                onSelect={goToAnchor}
              />
            ) : (
              <InspectorRail
                activeTopic={topic}
                copyText={copyText}
                onAnchor={goToAnchor}
                onTopic={setTopic}
                open={inspectorOpen}
                selectedSlide={selectedSlide}
                state={selectedState}
                toggleOpen={() => setInspectorOpen((value) => !value)}
              />
            )}
          </RailPanel>
        </ResizablePanelGroup>
      </main>

      <main
        className="mobile-layout-frame"
        aria-label="Cadenza Player App mobile prototype"
      >
        {selectedState.health === "Blocked" && selectedState.diagnostics[0] && (
          <BlockingBanner
            diagnostic={selectedState.diagnostics[0]}
            onOpenDiagnostics={() => {
              setTopic("Diagnostics");
              setMobilePanel("inspector");
            }}
          />
        )}
        <DeckSurface
          anchorIndex={anchorIndex}
          presenter={false}
          selectedSlide={selectedSlide}
          state={selectedState}
        />
        <PlaybackToolbar
          anchorIndex={anchorIndex}
          fullscreen={fullscreen}
          next={next}
          onFullscreen={() => setFullscreen(true)}
          playing={playing}
          previous={previous}
          selectedSlide={selectedSlide}
          setPlaying={setPlaying}
          state={selectedState}
        />
      </main>

      <StatusBar
        inspectorSide={inspectorSide}
        onOpenHealth={openHealthTopic}
        selectedSlide={selectedSlide}
        state={selectedState}
      />

      <MobilePanel
        copyText={copyText}
        currentSlideId={selectedSlide.slideId}
        mobilePanel={mobilePanel}
        onAnchor={goToAnchor}
        onClose={() => setMobilePanel("none")}
        onSelectTopic={(nextTopic) => {
          setTopic(nextTopic);
          setMobilePanel("inspector");
        }}
        selectedSlide={selectedSlide}
        state={selectedState}
        topic={topic}
      />
    </div>
  );
}

type RailPanelProps = {
  readonly children: ReactNode;
  readonly isOpen: boolean;
  readonly kind: "inspector" | "slides";
};

function RailPanel({ children, isOpen, kind }: RailPanelProps) {
  const defaultSize = kind === "inspector" ? 25 : 18;
  const minSize = kind === "inspector" ? 20 : 14;
  const maxSize = kind === "inspector" ? 34 : 25;

  if (!isOpen) return null;

  return (
    <ResizablePanel
      className={cn("rail-panel", `rail-panel-${kind}`)}
      defaultSize={`${defaultSize}%`}
      maxSize={`${maxSize}%`}
      minSize={`${minSize}%`}
    >
      {children}
    </ResizablePanel>
  );
}

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

function TopBar({
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
          variant={mobilePanel === "inspector" ? "primary" : "ghost"}
        >
          <PanelRight size={17} />
        </IconButton>
      </fieldset>

      <fieldset className="layout-actions">
        <legend className="sr-only">Layout controls</legend>
        <IconButton
          aria-pressed={slideOpen}
          label="Toggle slide preview rail"
          onClick={() => setSlideOpen((value) => !value)}
          variant={slideOpen ? "outline" : "ghost"}
        >
          <PanelLeft size={17} />
        </IconButton>
        <IconButton
          aria-pressed={bottomOpen}
          label="Toggle action-anchor controls"
          onClick={() => setBottomOpen((value) => !value)}
          variant={bottomOpen ? "outline" : "ghost"}
        >
          <PanelBottom size={17} />
        </IconButton>
        <IconButton
          aria-pressed={inspectorOpen}
          label="Toggle inspector rail"
          onClick={() => setInspectorOpen((value) => !value)}
          variant={inspectorOpen ? "outline" : "ghost"}
        >
          <PanelRight size={17} />
        </IconButton>
        <IconButton
          aria-pressed={sideSwap}
          label="Swap slide and inspector rails"
          onClick={onSwap}
          variant={sideSwap ? "primary" : "ghost"}
        >
          <ArrowLeftRight size={17} />
        </IconButton>
        <IconButton
          label={theme === "dark" ? "Use light theme" : "Use dark theme"}
          onClick={onTheme}
          variant="ghost"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </IconButton>
      </fieldset>
    </header>
  );
}

type SlideRailProps = {
  readonly currentSlideId: string;
  readonly onSelect: (index: number) => void;
};

function SlideRail({ currentSlideId, onSelect }: SlideRailProps) {
  return (
    <aside className="slide-rail" aria-label="Static slide preview rail">
      <div className="rail-header">
        <div>
          <h2>Slides</h2>
          <p>{outline.length} action anchors</p>
        </div>
        <Badge tone="neutral">
          <Route size={12} />
          step/action
        </Badge>
      </div>
      <div className="thumbnail-list">
        {outline.map((slide, index) => (
          <button
            aria-current={currentSlideId === slide.slideId ? "step" : undefined}
            className={cn(
              "thumbnail",
              currentSlideId === slide.slideId && "active",
            )}
            data-anchor-index={index}
            key={slide.slideId}
            onClick={() => onSelect(index)}
            type="button"
          >
            <span className="thumb-number">{index + 1}</span>
            <span className="thumb-frame">
              <span className="thumb-title">{slide.title}</span>
              <span className="thumb-summary">{slide.summary}</span>
              <span className="thumb-segment">
                {slide.segment[0]}-{slide.segment[1]}
              </span>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

type DeckSurfaceProps = {
  readonly anchorIndex: number;
  readonly presenter: boolean;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

function DeckSurface({
  anchorIndex,
  presenter,
  selectedSlide,
  state,
}: DeckSurfaceProps) {
  if (presenter) {
    return (
      <PresenterView
        anchorIndex={anchorIndex}
        selectedSlide={selectedSlide}
        state={state}
      />
    );
  }

  return (
    <section className="deck-zone" aria-label="Deck playback surface">
      <DeckSlide selectedSlide={selectedSlide} state={state} />
    </section>
  );
}

type DeckSlideProps = {
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

function DeckSlide({ selectedSlide, state }: DeckSlideProps) {
  return (
    <div className="deck-frame">
      <article
        aria-label={`Deck slide ${selectedSlide.title}`}
        className="deck-slide"
      >
        <div className="slide-topline">
          <span>{deck.deckId}</span>
          <Badge tone={state.accent}>{state.health}</Badge>
        </div>
        <h1>{selectedSlide.title}</h1>
        <p>{selectedSlide.summary}</p>
        <div className="slide-evidence-strip">
          <span>Chapter {selectedSlide.chapterId}</span>
          <span>
            Anchor {selectedSlide.segment[0]}-{selectedSlide.segment[1]}
          </span>
          <span>{selectedSlide.purpose}</span>
        </div>
      </article>
    </div>
  );
}

type BlockingBannerProps = {
  readonly diagnostic: PrototypeState["diagnostics"][number];
  readonly onOpenDiagnostics: () => void;
};

function BlockingBanner({
  diagnostic,
  onOpenDiagnostics,
}: BlockingBannerProps) {
  return (
    <div className="blocking-banner" role="alert">
      <AlertTriangle size={17} />
      <div>
        <strong>{diagnostic.code}</strong>
        <span>{diagnostic.message}</span>
      </div>
      <Button onClick={onOpenDiagnostics} size="xs" variant="destructive">
        <Terminal size={14} />
        Diagnostics
      </Button>
    </div>
  );
}

type PlaybackToolbarProps = {
  readonly anchorIndex: number;
  readonly fullscreen: boolean;
  readonly next: () => void;
  readonly onFullscreen: () => void;
  readonly playing: boolean;
  readonly previous: () => void;
  readonly selectedSlide: OutlineEntry;
  readonly setPlaying: (value: (current: boolean) => boolean) => void;
  readonly state: PrototypeState;
};

function PlaybackToolbar({
  anchorIndex,
  fullscreen,
  next,
  onFullscreen,
  playing,
  previous,
  selectedSlide,
  setPlaying,
  state,
}: PlaybackToolbarProps) {
  return (
    <section className="playback-toolbar" aria-label="Action-anchor controls">
      <div className="transport">
        <IconButton label="Previous action anchor" onClick={previous}>
          <ArrowLeft size={18} />
        </IconButton>
        <IconButton
          label={playing ? "Pause playback" : "Play playback"}
          onClick={() => setPlaying((value) => !value)}
          variant="primary"
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </IconButton>
        <IconButton label="Next action anchor" onClick={next}>
          <ArrowRight size={18} />
        </IconButton>
        <IconButton
          label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onClick={onFullscreen}
          variant="outline"
        >
          {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </IconButton>
      </div>
      <div className="anchor-progress" data-anchor-title={selectedSlide.title}>
        <div>
          <strong>{selectedSlide.title}</strong>
          <span>{state.statusCopy}</span>
        </div>
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

type InspectorRailProps = {
  readonly activeTopic: Topic;
  readonly copyText: (text: string, label: string) => void;
  readonly onAnchor: (index: number) => void;
  readonly onTopic: (topic: Topic) => void;
  readonly open: boolean;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
  readonly toggleOpen: () => void;
};

function InspectorRail({
  activeTopic,
  copyText,
  onAnchor,
  onTopic,
  open,
  selectedSlide,
  state,
  toggleOpen,
}: InspectorRailProps) {
  return (
    <aside className="inspector-rail" aria-label="Read-only inspector rail">
      <nav className="activity-bar" aria-label="Inspector topics">
        {topics.map((topic) => {
          const Icon = topicIcons[topic];
          const active = activeTopic === topic;
          return (
            <IconButton
              aria-current={active ? "page" : undefined}
              aria-pressed={active}
              className={cn("activity-button", active && "active")}
              key={topic}
              label={active && open ? `Collapse ${topic}` : `Open ${topic}`}
              onClick={() => {
                if (active) toggleOpen();
                else onTopic(topic);
              }}
              variant={active ? "primary" : "ghost"}
            >
              <Icon size={17} />
            </IconButton>
          );
        })}
      </nav>
      <div className="inspector-pane">
        <div className="inspector-title-row">
          <div>
            <h2>{activeTopic}</h2>
            <p>
              Read-only inspection; no editor, repair, or re-export surface.
            </p>
          </div>
          <Badge tone={state.accent}>{state.health}</Badge>
        </div>
        <InspectorContent
          activeTopic={activeTopic}
          copyText={copyText}
          onAnchor={onAnchor}
          selectedSlide={selectedSlide}
          state={state}
        />
      </div>
    </aside>
  );
}

type InspectorContentProps = {
  readonly activeTopic: Topic;
  readonly copyText: (text: string, label: string) => void;
  readonly onAnchor: (index: number) => void;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

function InspectorContent({
  activeTopic,
  copyText,
  onAnchor,
  selectedSlide,
  state,
}: InspectorContentProps) {
  return (
    <div className="section-stack">
      <Section defaultOpen id="summary" meta={state.health} title="Summary">
        <div className="summary-grid">
          <Info size={16} />
          <div>
            <strong>{selectedSlide.title}</strong>
            <p>{state.description}</p>
          </div>
        </div>
        <dl className="key-value-grid">
          <div>
            <dt>Deck</dt>
            <dd>{deck.deckId}</dd>
          </div>
          <div>
            <dt>Anchor</dt>
            <dd>
              {selectedSlide.segment[0]}-{selectedSlide.segment[1]}
            </dd>
          </div>
          <div>
            <dt>Diagnostics</dt>
            <dd>{state.diagnostics.length}</dd>
          </div>
          <div>
            <dt>Limitations</dt>
            <dd>{state.limitations.length}</dd>
          </div>
        </dl>
      </Section>

      {activeTopic === "Outline" && (
        <>
          <Section defaultOpen id="outline" title="Outline">
            <OutlineList
              currentSlideId={selectedSlide.slideId}
              onAnchor={onAnchor}
            />
          </Section>
          <Section id="timeline" title="Timeline">
            <TimelineList
              currentSlideId={selectedSlide.slideId}
              onAnchor={onAnchor}
            />
          </Section>
        </>
      )}

      {activeTopic === "Readiness" && (
        <>
          <Section defaultOpen id="readiness" title="Readiness">
            <ReadinessList state={state} />
          </Section>
          <Section id="readiness-diagnostics" title="Diagnostics">
            <DiagnosticsList copyText={copyText} state={state} />
          </Section>
        </>
      )}

      {activeTopic === "Diagnostics" && (
        <>
          <Section
            defaultOpen
            id="diagnostics"
            meta={`${state.diagnostics.length} items`}
            title="Diagnostics"
          >
            <DiagnosticsList copyText={copyText} state={state} />
          </Section>
          <Section id="diagnostic-limitations" title="Limitations">
            <LimitationsList state={state} />
          </Section>
        </>
      )}

      {activeTopic === "Provenance" && (
        <>
          <Section
            defaultOpen
            id="format-capabilities"
            title="Format Capabilities"
          >
            <FormatCapabilities state={state} />
          </Section>
          <Section defaultOpen id="evidence-files" title="Evidence Files">
            <EvidenceFiles copyText={copyText} state={state} />
          </Section>
          <Section id="selector-provenance" title="Selector Provenance">
            <SelectorProvenance copyText={copyText} state={state} />
          </Section>
          <Section id="raw-details" title="Raw Details">
            <pre>{JSON.stringify(state.provenance, null, 2)}</pre>
          </Section>
        </>
      )}

      {activeTopic === "Notes" && (
        <>
          <Section defaultOpen id="notes-boundary" title="Notes Boundary">
            <div className="notice-card">
              <Presentation size={16} />
              <p>
                Normal player view hides speaker notes. Notes appear only
                through explicit presenter metadata affordances.
              </p>
            </div>
          </Section>
          <Section id="speaker-notes" title="Presenter Notes">
            <p>
              Suggested speaker cue: connect local export proof to the
              maintainer-approved alpha boundary without implying hosted
              release.
            </p>
          </Section>
        </>
      )}

      {activeTopic === "Limitations" && (
        <>
          <Section defaultOpen id="limitations" title="Limitations">
            <LimitationsList state={state} />
          </Section>
          <Section id="limitation-provenance" title="Provenance">
            <EvidenceFiles copyText={copyText} state={state} />
          </Section>
        </>
      )}
    </div>
  );
}

type AnchorListProps = {
  readonly currentSlideId: string;
  readonly onAnchor: (index: number) => void;
};

function OutlineList({ currentSlideId, onAnchor }: AnchorListProps) {
  return (
    <div className="outline-list">
      {outline.map((slide, index) => (
        <button
          className={cn(
            "outline-row",
            currentSlideId === slide.slideId && "active",
          )}
          key={slide.slideId}
          onClick={() => onAnchor(index)}
          type="button"
        >
          <BookOpen size={15} />
          <span>
            <strong>{slide.title}</strong>
            <small>{slide.chapterId}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

function TimelineList({ currentSlideId, onAnchor }: AnchorListProps) {
  return (
    <ol className="timeline-list">
      {outline.map((slide, index) => (
        <li key={slide.slideId}>
          <button
            className={cn(
              "timeline-row",
              currentSlideId === slide.slideId && "active",
            )}
            onClick={() => onAnchor(index)}
            type="button"
          >
            <CircleMarker active={currentSlideId === slide.slideId} />
            <span>
              {slide.segment[0]}-{slide.segment[1]}
            </span>
            <strong>{slide.title}</strong>
          </button>
        </li>
      ))}
    </ol>
  );
}

function CircleMarker({ active }: { readonly active: boolean }) {
  return <span className={cn("circle-marker", active && "active")} />;
}

function ReadinessList({ state }: { readonly state: PrototypeState }) {
  return (
    <div className="readiness-list">
      {state.readiness.map((item) => (
        <div className="readiness-row" key={`${item.source}-${item.label}`}>
          <StatusGlyph tone={item.status} />
          <span>
            <strong>{item.label}</strong>
            <small>{item.source}</small>
          </span>
          <Badge tone={readinessTone(item.status)}>{item.status}</Badge>
        </div>
      ))}
    </div>
  );
}

function readinessTone(status: PrototypeState["readiness"][number]["status"]) {
  if (status === "blocked") return "blocked";
  if (status === "ready") return "ready";
  if (status === "limited") return "warning";
  return "checking";
}

function StatusGlyph({ tone }: { readonly tone: string }) {
  if (tone === "blocked") return <AlertTriangle size={16} />;
  if (tone === "ready") return <BadgeCheck size={16} />;
  if (tone === "checking" || tone === "pending") return <Clock size={16} />;
  return <Info size={16} />;
}

type DiagnosticsListProps = {
  readonly copyText: (text: string, label: string) => void;
  readonly state: PrototypeState;
};

function DiagnosticsList({ copyText, state }: DiagnosticsListProps) {
  if (state.diagnostics.length === 0) {
    return (
      <div className="empty-state">
        <ShieldCheck size={18} />
        <p>No diagnostics for this fixture state.</p>
      </div>
    );
  }

  return (
    <div className="diagnostics-list">
      {state.diagnostics.map((diagnostic) => (
        <article className="diagnostic-card" key={diagnostic.code}>
          <div className="diagnostic-header">
            <Badge tone={diagnostic.severity}>{diagnostic.severity}</Badge>
            <code>{diagnostic.code}</code>
          </div>
          <p>{diagnostic.message}</p>
          <dl>
            <div>
              <dt>Evidence locator</dt>
              <dd>{diagnostic.locator}</dd>
            </div>
            <div>
              <dt>Repair hint</dt>
              <dd>{diagnostic.hint}</dd>
            </div>
          </dl>
          <div className="inline-actions">
            <Button
              onClick={() => copyText(diagnostic.code, "Diagnostic code")}
              size="xs"
              variant="outline"
            >
              <Copy size={13} />
              Code
            </Button>
            <Button
              onClick={() => copyText(diagnostic.locator, "Locator")}
              size="xs"
              variant="outline"
            >
              <Copy size={13} />
              Locator
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

function FormatCapabilities({ state }: { readonly state: PrototypeState }) {
  return (
    <div className="capability-list">
      {state.provenance.formatCapabilities.map((capability) => (
        <article className="capability-card" key={capability.format}>
          <Badge tone={capability.status === "supported" ? "ready" : "warning"}>
            {capability.format}
          </Badge>
          <p>{capability.description}</p>
        </article>
      ))}
    </div>
  );
}

type EvidenceFilesProps = {
  readonly copyText: (text: string, label: string) => void;
  readonly state: PrototypeState;
};

function EvidenceFiles({ copyText, state }: EvidenceFilesProps) {
  return (
    <div className="artifact-list">
      <div className="artifact-card">
        <Boxes size={16} />
        <span>
          <strong>{state.provenance.manifestPath}</strong>
          <small>{state.provenance.outputDirectory}</small>
        </span>
        <Button
          onClick={() =>
            copyText(state.provenance.manifestPath, "Manifest path")
          }
          size="xs"
          variant="outline"
        >
          <Copy size={13} />
          Path
        </Button>
      </div>
      {state.provenance.artifacts.map((artifact) => (
        <div
          className="artifact-card"
          key={`${artifact.role}-${artifact.path}`}
        >
          <FileJson size={16} />
          <span>
            <strong>{artifact.path}</strong>
            <small>
              {artifact.role} · {artifact.byteSize} bytes · {artifact.sha256}
            </small>
          </span>
          <Badge tone="neutral">{artifact.format}</Badge>
        </div>
      ))}
    </div>
  );
}

function SelectorProvenance({ copyText, state }: EvidenceFilesProps) {
  return (
    <dl className="selector-grid">
      {Object.entries(state.provenance.selector).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>
            <span>{value}</span>
            <Button
              onClick={() => copyText(value, `${key} value`)}
              size="xs"
              variant="ghost"
            >
              <Copy size={13} />
            </Button>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function LimitationsList({ state }: { readonly state: PrototypeState }) {
  return (
    <div className="limitation-list">
      {state.limitations.map((limitation) => (
        <article
          className="limitation-card"
          key={`${limitation.affected}-${limitation.copy}`}
        >
          <Badge
            tone={
              limitation.severity === "blocked"
                ? "blocked"
                : limitation.severity === "warning"
                  ? "warning"
                  : "neutral"
            }
          >
            {limitation.severity}
          </Badge>
          <span>
            <strong>{limitation.affected}</strong>
            <p>{limitation.copy}</p>
          </span>
        </article>
      ))}
    </div>
  );
}

type PresenterViewProps = {
  readonly anchorIndex: number;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

function PresenterView({
  anchorIndex,
  selectedSlide,
  state,
}: PresenterViewProps) {
  const nextSlide = outlineAt(anchorIndex + 1);

  return (
    <section
      className="presenter-grid"
      aria-label="Presenter-view representation"
    >
      <div className="presenter-current">
        <DeckSlide selectedSlide={selectedSlide} state={state} />
      </div>
      <aside className="presenter-side">
        <div className="presenter-card next-card">
          <Badge tone="neutral">
            <ArrowRight size={12} />
            Next
          </Badge>
          <h2>{nextSlide.title}</h2>
          <p>{nextSlide.summary}</p>
        </div>
        <div className="presenter-card notes-card">
          <Badge tone="checking">
            <Presentation size={12} />
            Presenter metadata
          </Badge>
          <p>
            Notes are hidden in normal player view. This route represents the
            explicit presenter affordance only; browser multi-screen placement
            remains Stage A research.
          </p>
        </div>
        <div className="presenter-metrics">
          <span>
            <Clock size={15} />
            08:42
          </span>
          <span>
            <Route size={15} />
            {anchorIndex + 1}/{outline.length}
          </span>
        </div>
      </aside>
    </section>
  );
}

type StatusBarProps = {
  readonly inspectorSide: InspectorSide;
  readonly onOpenHealth: () => void;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

function StatusBar({
  inspectorSide,
  onOpenHealth,
  selectedSlide,
  state,
}: StatusBarProps) {
  const health = (
    <button
      className={cn("health-signal", `health-${state.accent}`)}
      data-health-side={inspectorSide}
      onClick={onOpenHealth}
      type="button"
    >
      <Gauge size={14} />
      <span>
        {state.health}: {state.statusCopy}
      </span>
    </button>
  );
  const deckCluster = (
    <div className="status-cluster">
      <Columns3 size={14} />
      <span>{deck.deckId}</span>
      <span>{selectedSlide.slideId}</span>
    </div>
  );

  return (
    <footer className="status-bar">
      {inspectorSide === "left" ? health : deckCluster}
      <div className="status-center">
        <ShieldCheck size={14} />
        <span>pre-Architect prototype · non-freeze evidence</span>
      </div>
      {inspectorSide === "left" ? deckCluster : health}
    </footer>
  );
}

type MobilePanelProps = {
  readonly copyText: (text: string, label: string) => void;
  readonly currentSlideId: string;
  readonly mobilePanel: MobilePanelId;
  readonly onAnchor: (index: number) => void;
  readonly onClose: () => void;
  readonly onSelectTopic: (topic: Topic) => void;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
  readonly topic: Topic;
};

function MobilePanel({
  copyText,
  currentSlideId,
  mobilePanel,
  onAnchor,
  onClose,
  onSelectTopic,
  selectedSlide,
  state,
  topic,
}: MobilePanelProps) {
  if (mobilePanel === "none") return null;

  return (
    <div className="mobile-sheet" data-mobile-panel={mobilePanel}>
      <button className="mobile-scrim" onClick={onClose} type="button" />
      <aside className="mobile-sheet-panel">
        <div className="mobile-sheet-header">
          <strong>{mobilePanel === "slides" ? "Slides" : "Inspector"}</strong>
          <IconButton label="Close drawer" onClick={onClose} variant="ghost">
            <X size={17} />
          </IconButton>
        </div>
        {mobilePanel === "slides" ? (
          <SlideRail
            currentSlideId={currentSlideId}
            onSelect={(index) => {
              onAnchor(index);
              onClose();
            }}
          />
        ) : (
          <>
            <div className="mobile-topic-tabs">
              {topics.map((nextTopic) => {
                const Icon = topicIcons[nextTopic];
                return (
                  <IconButton
                    aria-pressed={topic === nextTopic}
                    key={nextTopic}
                    label={nextTopic}
                    onClick={() => onSelectTopic(nextTopic)}
                    variant={topic === nextTopic ? "primary" : "ghost"}
                  >
                    <Icon size={16} />
                  </IconButton>
                );
              })}
            </div>
            <InspectorContent
              activeTopic={topic}
              copyText={copyText}
              onAnchor={onAnchor}
              selectedSlide={selectedSlide}
              state={state}
            />
          </>
        )}
      </aside>
    </div>
  );
}

type FullscreenViewProps = {
  readonly copiedNotice: string;
  readonly next: () => void;
  readonly onCopy: (text: string, label: string) => void;
  readonly onExit: () => void;
  readonly playing: boolean;
  readonly previous: () => void;
  readonly selectedSlide: OutlineEntry;
  readonly setPlaying: (value: (current: boolean) => boolean) => void;
  readonly state: PrototypeState;
};

function FullscreenView({
  copiedNotice,
  next,
  onCopy,
  onExit,
  playing,
  previous,
  selectedSlide,
  setPlaying,
  state,
}: FullscreenViewProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [lastTapAt, setLastTapAt] = useState(0);

  return (
    <main
      className={cn("fullscreen-shell", `state-${state.accent}`)}
      onContextMenu={(event) => {
        event.preventDefault();
        setMenuOpen((value) => !value);
      }}
      onTouchEnd={(event) => {
        const endX = event.changedTouches[0]?.clientX ?? 0;
        const delta = touchStart === null ? 0 : endX - touchStart;
        const now = Date.now();
        if (Math.abs(delta) > 36) {
          if (delta < 0) previous();
          else next();
        } else if (now - lastTapAt < 320) {
          next();
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
      <button
        aria-label="Previous action anchor"
        className="edge-hit edge-hit-left"
        onClick={previous}
        type="button"
      >
        <ChevronLeft size={34} />
      </button>
      <button
        aria-label="Next action anchor"
        className="edge-hit edge-hit-right"
        onClick={next}
        type="button"
      >
        <ChevronRight size={34} />
      </button>
      <div className="fullscreen-hud">
        <Badge tone={state.accent}>{state.health}</Badge>
        <span>{selectedSlide.title}</span>
        <small>
          {outline.findIndex(
            (slide) => slide.slideId === selectedSlide.slideId,
          ) + 1}
          /{outline.length}
        </small>
      </div>
      <div className="fullscreen-controls">
        <IconButton label="Previous action anchor" onClick={previous}>
          <ArrowLeft size={18} />
        </IconButton>
        <IconButton
          label={playing ? "Pause playback" : "Play playback"}
          onClick={() => setPlaying((value) => !value)}
          variant="primary"
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </IconButton>
        <IconButton label="Next action anchor" onClick={next}>
          <ArrowRight size={18} />
        </IconButton>
        <IconButton label="Exit fullscreen" onClick={onExit} variant="outline">
          <Minimize size={18} />
        </IconButton>
      </div>
      {menuOpen && (
        <div className="fullscreen-menu" role="menu">
          <Button onClick={previous} size="xs" variant="ghost">
            <ArrowLeft size={14} />
            previous
          </Button>
          <Button onClick={next} size="xs" variant="ghost">
            <ArrowRight size={14} />
            next
          </Button>
          <Button
            onClick={() => onCopy(selectedSlide.slideId, "Action anchor")}
            size="xs"
            variant="ghost"
          >
            <Copy size={14} />
            copy anchor
          </Button>
          <Button onClick={onExit} size="xs" variant="ghost">
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

export default App;
