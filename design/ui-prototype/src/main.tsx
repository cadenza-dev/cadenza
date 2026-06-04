import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from "react";
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type {
  OutlineEntry,
  PrototypeState,
  StateId,
  Tone,
  Topic,
} from "./fixture";
import {
  deck,
  outline,
  provenanceRows,
  sourceMaterials,
  states,
  topics,
} from "./fixture";
import "./styles.css";

const stateEntries = Object.values(states);

type Theme = "dark" | "light";
type MobilePanelId = "inspector" | "none" | "slides";
type InspectorSide = "left" | "right";
type InspectorSectionName =
  | "Diagnostics"
  | "Limitations"
  | "Notes"
  | "Outline"
  | "Provenance"
  | "Readiness"
  | "Summary";

type LayoutStyle = CSSProperties & {
  "--bottom-height": string;
  "--left-width": string;
  "--right-width": string;
};

function cx(...parts: Array<false | null | string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function initialParam(name: string, fallback: string): string {
  const value = new URLSearchParams(window.location.search).get(name);
  return value || fallback;
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

function outlineAt(index: number): OutlineEntry {
  return outline[index] ?? outline[0];
}

function App() {
  const initialState = initialParam("state", "ready");
  const [stateId, setStateId] = useState<StateId>(
    isStateId(initialState) ? initialState : "ready",
  );
  const selectedState = states[stateId];
  const initialTopic = initialParam("topic", selectedState.defaultTopic);
  const [topic, setTopic] = useState<Topic>(
    isTopic(initialTopic) ? initialTopic : selectedState.defaultTopic,
  );
  const initialTheme = initialParam("theme", "light");
  const [theme, setTheme] = useState<Theme>(
    isTheme(initialTheme) ? initialTheme : "light",
  );
  const [leftOpen, setLeftOpen] = useState(
    initialParam("left", "open") !== "closed",
  );
  const [rightOpen, setRightOpen] = useState(
    initialParam("right", "open") !== "closed",
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
  const initialPanel = initialParam("panel", "none");
  const [mobilePanel, setMobilePanel] = useState<MobilePanelId>(
    isMobilePanelId(initialPanel) ? initialPanel : "none",
  );
  const [leftWidth, setLeftWidth] = useState(248);
  const [rightWidth, setRightWidth] = useState(368);
  const [bottomHeight, setBottomHeight] = useState(112);

  useEffect(() => {
    document.documentElement.dataset.theme =
      theme === "dark" ? "dark" : "light";
  }, [theme]);

  useEffect(() => {
    setTopic((current) =>
      isTopic(current) ? current : selectedState.defaultTopic,
    );
  }, [selectedState.defaultTopic]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        setPlaying(false);
        setStateId((current) => nextStateId(current, 1));
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPlaying(false);
        setStateId((current) => nextStateId(current, -1));
      }
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        setFullscreen((current) => !current);
      }
      if (event.key === "Escape") {
        setFullscreen(false);
        setMobilePanel("none");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectedSlide = outlineAt(selectedState.selectedIndex);
  const inspectorSide: InspectorSide = sideSwap ? "left" : "right";
  const presenter = initialParam("presenter", "false") === "true";
  const blockingDiagnostic = selectedState.diagnostics[0];

  const layoutStyle: LayoutStyle = {
    "--left-width": leftOpen ? `${leftWidth}px` : "0px",
    "--right-width": rightOpen ? `${rightWidth}px` : "0px",
    "--bottom-height": bottomOpen ? `${bottomHeight}px` : "0px",
  };

  const leftRail = (
    <SlideRail
      currentSlideId={selectedSlide.slideId}
      leftWidth={leftWidth}
      onResize={setLeftWidth}
      open={leftOpen}
    />
  );
  const inspectorRail = (
    <Inspector
      activeTopic={topic}
      onTopicButton={(nextTopic) => {
        if (nextTopic === topic && rightOpen) setRightOpen(false);
        else {
          setRightOpen(true);
          setTopic(nextTopic);
        }
      }}
      onResize={setRightWidth}
      rightWidth={rightWidth}
      selectedSlide={selectedSlide}
      state={selectedState}
    />
  );

  return (
    <div
      className={cx(
        "app-shell",
        fullscreen && "is-fullscreen",
        sideSwap && "is-swapped",
        `state-${selectedState.accent}`,
      )}
      style={layoutStyle}
    >
      <TopBar
        bottomOpen={bottomOpen}
        leftOpen={leftOpen}
        onMobilePanel={setMobilePanel}
        onState={setStateId}
        onSwap={() => setSideSwap((value) => !value)}
        onTheme={() =>
          setTheme((value) => (value === "dark" ? "light" : "dark"))
        }
        rightOpen={rightOpen}
        selectedState={selectedState}
        setBottomOpen={setBottomOpen}
        setLeftOpen={setLeftOpen}
        setRightOpen={setRightOpen}
        sideSwap={sideSwap}
        theme={theme}
      />

      <main className="main-layout" aria-label="Cadenza Player App prototype">
        {sideSwap ? inspectorRail : leftRail}
        <section className="center-column" aria-label="Deck playback surface">
          {selectedState.health === "Blocked" && blockingDiagnostic && (
            <BlockingBanner
              diagnostic={blockingDiagnostic}
              onOpenDiagnostics={() => {
                setRightOpen(true);
                setTopic("Diagnostics");
              }}
            />
          )}
          <DeckCanvas
            fullscreen={fullscreen}
            onNext={() => setStateId((current) => nextStateId(current, 1))}
            onPrevious={() => setStateId((current) => nextStateId(current, -1))}
            presenter={presenter}
            selectedSlide={selectedSlide}
            state={selectedState}
          />
          <BottomControls
            bottomHeight={bottomHeight}
            fullscreen={fullscreen}
            onFullscreen={() => setFullscreen((value) => !value)}
            onNext={() => setStateId((current) => nextStateId(current, 1))}
            onPlay={() => setPlaying((value) => !value)}
            onPrevious={() => setStateId((current) => nextStateId(current, -1))}
            onResize={setBottomHeight}
            open={bottomOpen}
            playing={playing}
            selectedSlide={selectedSlide}
            state={selectedState}
          />
        </section>
        {sideSwap ? leftRail : inspectorRail}
      </main>

      <StatusBar
        inspectorSide={inspectorSide}
        onOpenHealth={() => {
          setRightOpen(true);
          setTopic(
            selectedState.health === "Blocked" ||
              selectedState.health === "Warnings"
              ? "Diagnostics"
              : "Readiness",
          );
        }}
        selectedSlide={selectedSlide}
        state={selectedState}
      />

      <MobilePanel
        currentSlideId={selectedSlide.slideId}
        mobilePanel={mobilePanel}
        onClose={() => setMobilePanel("none")}
        onSelectTopic={setTopic}
        selectedSlide={selectedSlide}
        state={selectedState}
        topic={topic}
      />
    </div>
  );
}

function nextStateId(current: StateId, direction: -1 | 1): StateId {
  const ids = stateEntries.map((entry) => entry.id);
  const index = ids.indexOf(current);
  const next = (index + direction + ids.length) % ids.length;
  return ids[next] ?? "ready";
}

type TopBarProps = {
  readonly bottomOpen: boolean;
  readonly leftOpen: boolean;
  readonly onMobilePanel: Dispatch<SetStateAction<MobilePanelId>>;
  readonly onState: Dispatch<SetStateAction<StateId>>;
  readonly onSwap: () => void;
  readonly onTheme: () => void;
  readonly rightOpen: boolean;
  readonly selectedState: PrototypeState;
  readonly setBottomOpen: Dispatch<SetStateAction<boolean>>;
  readonly setLeftOpen: Dispatch<SetStateAction<boolean>>;
  readonly setRightOpen: Dispatch<SetStateAction<boolean>>;
  readonly sideSwap: boolean;
  readonly theme: Theme;
};

function TopBar({
  bottomOpen,
  leftOpen,
  onMobilePanel,
  onState,
  onSwap,
  onTheme,
  rightOpen,
  selectedState,
  setBottomOpen,
  setLeftOpen,
  setRightOpen,
  sideSwap,
  theme,
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="brand-cluster">
        <span className="app-mark" aria-hidden="true">
          C
        </span>
        <div>
          <div className="product-name">Cadenza Player App</div>
          <div className="deck-subtitle">{deck.title}</div>
        </div>
      </div>
      <nav className="state-switcher" aria-label="Prototype states">
        {stateEntries.map((state) => (
          <button
            className={cx(
              "segmented-button",
              selectedState.id === state.id && "active",
            )}
            key={state.id}
            onClick={() => onState(state.id)}
            type="button"
          >
            {state.label}
          </button>
        ))}
      </nav>
      <fieldset className="mobile-actions">
        <legend className="sr-only">Mobile panels</legend>
        <Button label="Slides" onClick={() => onMobilePanel("slides")} />
        <Button label="Inspector" onClick={() => onMobilePanel("inspector")} />
      </fieldset>
      <fieldset className="layout-actions">
        <legend className="sr-only">Layout controls</legend>
        <Button
          active={leftOpen}
          label="Left rail"
          onClick={() => setLeftOpen((value) => !value)}
        />
        <Button
          active={bottomOpen}
          label="Bottom rail"
          onClick={() => setBottomOpen((value) => !value)}
        />
        <Button
          active={rightOpen}
          label="Right rail"
          onClick={() => setRightOpen((value) => !value)}
        />
        <Button active={sideSwap} label="Swap sides" onClick={onSwap} />
        <Button label={theme === "dark" ? "Light" : "Dark"} onClick={onTheme} />
      </fieldset>
    </header>
  );
}

type ButtonProps = {
  readonly active?: boolean;
  readonly label: string;
  readonly onClick: () => void;
};

function Button({ active = false, label, onClick }: ButtonProps) {
  return (
    <button
      aria-pressed={active || undefined}
      className={cx("button", active && "active")}
      onClick={onClick}
      title={label}
      type="button"
    >
      {label}
    </button>
  );
}

type SlideRailProps = {
  readonly currentSlideId: string;
  readonly leftWidth: number;
  readonly onResize: (width: number) => void;
  readonly open: boolean;
};

function SlideRail({
  currentSlideId,
  leftWidth,
  onResize,
  open,
}: SlideRailProps) {
  return (
    <aside
      className={cx("slide-rail", !open && "collapsed")}
      aria-label="Static slide preview rail"
    >
      <div className="rail-header">
        <div>
          <h2>Slides</h2>
          <p>{outline.length} action anchors</p>
        </div>
      </div>
      <div className="thumbnail-list">
        {outline.map((slide, index) => (
          <button
            className={cx(
              "thumbnail",
              currentSlideId === slide.slideId && "active",
            )}
            key={slide.slideId}
            type="button"
          >
            <span className="thumb-number">{index + 1}</span>
            <span className="thumb-frame">
              <span className="thumb-title">{slide.title}</span>
              <span className="thumb-line" />
              <span className="thumb-line short" />
            </span>
          </button>
        ))}
      </div>
      <label className="resize-control">
        <span>Width</span>
        <input
          aria-label="Resize slide preview rail"
          max="320"
          min="180"
          onChange={(event) => onResize(Number(event.target.value))}
          type="range"
          value={leftWidth}
        />
      </label>
    </aside>
  );
}

type DeckCanvasProps = {
  readonly fullscreen: boolean;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
  readonly presenter: boolean;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

function DeckCanvas({
  fullscreen,
  onNext,
  onPrevious,
  presenter,
  selectedSlide,
  state,
}: DeckCanvasProps) {
  const nextSlide = outlineAt(state.selectedIndex + 1);

  return (
    <section
      className={cx("deck-zone", presenter && "presenter-mode")}
      aria-label="Deck canvas"
    >
      {fullscreen && (
        <>
          <button className="edge-nav left" onClick={onPrevious} type="button">
            Previous
          </button>
          <button className="edge-nav right" onClick={onNext} type="button">
            Next
          </button>
        </>
      )}
      <div className="deck-frame">
        <div className="deck-slide">
          <div className="slide-kicker">{deck.deckId}</div>
          <h1>{selectedSlide.title}</h1>
          <p>{selectedSlide.summary}</p>
          <div className="slide-meta-row">
            <Badge tone={state.accent}>{state.health}</Badge>
            <span>
              Action anchor {selectedSlide.segment[0]}-
              {selectedSlide.segment[1]}
            </span>
          </div>
        </div>
      </div>
      {presenter && (
        <aside
          className="presenter-pane"
          aria-label="Presenter metadata mock state"
        >
          <h2>Presenter metadata</h2>
          <p>
            Notes are hidden in normal player view and shown only through an
            explicit presenter affordance.
          </p>
          <dl>
            <div>
              <dt>Current</dt>
              <dd>{selectedSlide.title}</dd>
            </div>
            <div>
              <dt>Next</dt>
              <dd>{nextSlide.title}</dd>
            </div>
          </dl>
        </aside>
      )}
    </section>
  );
}

type BottomControlsProps = {
  readonly bottomHeight: number;
  readonly fullscreen: boolean;
  readonly onFullscreen: () => void;
  readonly onNext: () => void;
  readonly onPlay: () => void;
  readonly onPrevious: () => void;
  readonly onResize: (height: number) => void;
  readonly open: boolean;
  readonly playing: boolean;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

function BottomControls({
  bottomHeight,
  fullscreen,
  onFullscreen,
  onNext,
  onPlay,
  onPrevious,
  onResize,
  open,
  playing,
  selectedSlide,
  state,
}: BottomControlsProps) {
  return (
    <section
      className={cx("bottom-controls", !open && "collapsed")}
      aria-label="Action-anchor controls"
    >
      <div className="transport">
        <button className="control-button" onClick={onPrevious} type="button">
          Previous
        </button>
        <button
          className="control-button primary"
          onClick={onPlay}
          type="button"
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button className="control-button" onClick={onNext} type="button">
          Next
        </button>
        <button className="control-button" onClick={onFullscreen} type="button">
          {fullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>
      </div>
      <div className="anchor-status">
        <strong>{selectedSlide.title}</strong>
        <span>{state.statusCopy}</span>
      </div>
      <label className="resize-control compact">
        <span>Height</span>
        <input
          aria-label="Resize bottom controls"
          max="164"
          min="84"
          onChange={(event) => onResize(Number(event.target.value))}
          type="range"
          value={bottomHeight}
        />
      </label>
    </section>
  );
}

type InspectorProps = {
  readonly activeTopic: Topic;
  readonly onResize: (width: number) => void;
  readonly onTopicButton: (topic: Topic) => void;
  readonly rightWidth: number;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

function Inspector({
  activeTopic,
  onResize,
  onTopicButton,
  rightWidth,
  selectedSlide,
  state,
}: InspectorProps) {
  return (
    <aside className="inspector-rail" aria-label="Read-only inspector rail">
      <nav className="activity-bar" aria-label="Inspector topics">
        {topics.map((topic) => (
          <button
            aria-current={activeTopic === topic ? "page" : undefined}
            className={cx("activity-button", activeTopic === topic && "active")}
            key={topic}
            onClick={() => onTopicButton(topic)}
            title={topic}
            type="button"
          >
            {topic.slice(0, 2)}
          </button>
        ))}
      </nav>
      <div className="inspector-pane">
        <div className="inspector-heading">
          <div>
            <h2>{activeTopic}</h2>
            <p>Read-only evidence and context</p>
          </div>
          <Badge tone={state.accent}>{state.health}</Badge>
        </div>
        <InspectorContent
          activeTopic={activeTopic}
          selectedSlide={selectedSlide}
          state={state}
        />
        <label className="resize-control">
          <span>Width</span>
          <input
            aria-label="Resize inspector rail"
            max="460"
            min="300"
            onChange={(event) => onResize(Number(event.target.value))}
            type="range"
            value={rightWidth}
          />
        </label>
      </div>
    </aside>
  );
}

type InspectorContentProps = {
  readonly activeTopic: Topic;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
};

function InspectorContent({
  activeTopic,
  selectedSlide,
  state,
}: InspectorContentProps) {
  const topicSections = useMemo<readonly InspectorSectionName[]>(() => {
    if (activeTopic === "Outline") return ["Summary", "Outline"];
    if (activeTopic === "Readiness")
      return ["Summary", "Readiness", "Diagnostics"];
    if (activeTopic === "Diagnostics")
      return ["Summary", "Diagnostics", "Limitations"];
    if (activeTopic === "Provenance")
      return ["Summary", "Provenance", "Limitations"];
    if (activeTopic === "Notes") return ["Summary", "Notes"];
    return ["Summary", "Limitations", "Provenance"];
  }, [activeTopic, selectedSlide, state]);

  return (
    <div className="section-stack">
      {topicSections.map((name, index) => (
        <Section
          defaultOpen={
            index === 0 || name === activeTopic || shouldOpen(name, state)
          }
          key={name}
          title={name}
        >
          {renderSection(name, selectedSlide, state)}
        </Section>
      ))}
    </div>
  );
}

function shouldOpen(
  name: InspectorSectionName,
  state: PrototypeState,
): boolean {
  if (name === "Diagnostics") return state.diagnostics.length > 0;
  if (name === "Readiness")
    return state.health === "Checking" || state.health === "Blocked";
  if (name === "Limitations") return state.limitations.length > 0;
  return false;
}

function renderSection(
  name: InspectorSectionName,
  selectedSlide: OutlineEntry,
  state: PrototypeState,
) {
  if (name === "Summary")
    return <SummarySection selectedSlide={selectedSlide} state={state} />;
  if (name === "Outline")
    return <OutlineSection selectedSlide={selectedSlide} />;
  if (name === "Readiness") return <ReadinessSection state={state} />;
  if (name === "Diagnostics") return <DiagnosticsSection state={state} />;
  if (name === "Provenance") return <ProvenanceSection state={state} />;
  if (name === "Notes") return <NotesSection />;
  return <LimitationsSection state={state} />;
}

type SectionProps = {
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly title: string;
};

function Section({ children, defaultOpen = false, title }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={cx("inspector-section", open && "open")}>
      <button
        aria-expanded={open}
        className="section-trigger"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span>{title}</span>
        <span aria-hidden="true">{open ? "-" : "+"}</span>
      </button>
      {open && <div className="section-content">{children}</div>}
    </section>
  );
}

type StateSectionProps = {
  readonly state: PrototypeState;
};

type SelectedSlideProps = {
  readonly selectedSlide: OutlineEntry;
};

function SummarySection({
  selectedSlide,
  state,
}: SelectedSlideProps & StateSectionProps) {
  return (
    <div className="summary-grid">
      <Metric label="Health" tone={state.accent} value={state.health} />
      <Metric label="Slide" value={selectedSlide.title} />
      <Metric label="Stable hash" value={deck.stableHash.slice(0, 12)} />
      <Metric label="Source" value={deck.sourcePath} />
    </div>
  );
}

function OutlineSection({ selectedSlide }: SelectedSlideProps) {
  return (
    <ol className="outline-list">
      {outline.map((item, index) => (
        <li
          className={cx(item.slideId === selectedSlide.slideId && "active")}
          key={item.slideId}
        >
          <span>{index + 1}</span>
          <div>
            <strong>{item.title}</strong>
            <p>{item.summary}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ReadinessSection({ state }: StateSectionProps) {
  return (
    <div className="readiness-list">
      {state.readiness.map((item) => (
        <div className="readiness-row" key={item.label}>
          <div>
            <strong>{item.label}</strong>
            <span>{item.source}</span>
          </div>
          <Badge tone={toneForStatus(item.status)}>{item.status}</Badge>
        </div>
      ))}
    </div>
  );
}

function DiagnosticsSection({ state }: StateSectionProps) {
  if (state.diagnostics.length === 0) {
    return <p className="empty-note">No diagnostics in this fixture state.</p>;
  }
  return (
    <div className="diagnostic-list">
      {state.diagnostics.map((diagnostic) => (
        <article
          className={cx("diagnostic-card", diagnostic.severity)}
          key={diagnostic.code}
        >
          <div className="diagnostic-topline">
            <Badge
              tone={diagnostic.severity === "blocked" ? "blocked" : "warning"}
            >
              {diagnostic.severity}
            </Badge>
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
          <button className="copy-button" type="button">
            Copy locator
          </button>
        </article>
      ))}
    </div>
  );
}

function ProvenanceSection({ state }: StateSectionProps) {
  return (
    <div className="provenance-panel">
      <dl className="provenance-summary">
        <div>
          <dt>Manifest path</dt>
          <dd>{state.provenance.manifestPath}</dd>
        </div>
        <div>
          <dt>Selector</dt>
          <dd>{state.provenance.selector.requested}</dd>
        </div>
        <div>
          <dt>Resolved path</dt>
          <dd>{state.provenance.selector.resolvedPath}</dd>
        </div>
        <div>
          <dt>Output</dt>
          <dd>{state.provenance.outputDirectory}</dd>
        </div>
      </dl>
      <div className="capability-list">
        {state.provenance.formatCapabilities.map((capability) => (
          <article key={capability.format}>
            <Badge
              tone={capability.status === "supported" ? "ready" : "warning"}
            >
              {capability.format} {capability.status}
            </Badge>
            <p>{capability.description}</p>
          </article>
        ))}
      </div>
      <div className="artifact-list">
        {state.provenance.artifacts.map((artifact) => (
          <div className="artifact-row" key={artifact.path}>
            <span>{artifact.role}</span>
            <code>{artifact.path}</code>
            <small>{artifact.sha256}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotesSection() {
  return (
    <div className="notes-boundary">
      <p>
        Speaker notes are hidden in the normal player view. They appear only
        through explicit presenter metadata affordances and remain read-only.
      </p>
      <ul>
        <li>
          Browser local-ready should not promise automatic multi-screen
          placement.
        </li>
        <li>
          Right-click force-open presenter view is a prototype flow, not a
          production contract.
        </li>
        <li>
          No source editing or repair actions are present in presenter metadata.
        </li>
      </ul>
    </div>
  );
}

function LimitationsSection({ state }: StateSectionProps) {
  return (
    <div className="limitation-list">
      {state.limitations.map((item) => (
        <article
          className={cx("limitation-row", item.severity)}
          key={`${item.affected}-${item.copy}`}
        >
          <Badge
            tone={
              item.severity === "blocked"
                ? "blocked"
                : item.severity === "warning"
                  ? "warning"
                  : "neutral"
            }
          >
            {item.affected}
          </Badge>
          <p>{item.copy}</p>
        </article>
      ))}
    </div>
  );
}

type MetricProps = {
  readonly label: string;
  readonly tone?: Tone;
  readonly value: string;
};

function Metric({ label, tone = "neutral", value }: MetricProps) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong className={cx(tone !== "neutral" && `text-${tone}`)}>
        {value}
      </strong>
    </div>
  );
}

type BadgeProps = {
  readonly children: ReactNode;
  readonly tone?: Tone;
};

function Badge({ children, tone = "neutral" }: BadgeProps) {
  return <span className={cx("badge", `badge-${tone}`)}>{children}</span>;
}

function toneForStatus(
  status: PrototypeState["readiness"][number]["status"],
): Tone {
  if (status === "ready") return "ready";
  if (status === "checking" || status === "pending") return "checking";
  if (status === "blocked") return "blocked";
  if (status === "limited") return "warning";
  return "neutral";
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
      <Badge tone="blocked">Blocked</Badge>
      <span>{diagnostic.message}</span>
      <button onClick={onOpenDiagnostics} type="button">
        Open Diagnostics
      </button>
    </div>
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
  const leftCluster = (
    <div className="status-cluster">
      <span>{deck.deckId}</span>
      <span>{selectedSlide.slideId}</span>
      <span>{deck.stableHash.slice(0, 10)}</span>
    </div>
  );
  const health = (
    <button
      className={cx("health-signal", state.accent)}
      onClick={onOpenHealth}
      type="button"
    >
      {state.health} · {state.diagnostics.length} diagnostics
    </button>
  );
  return (
    <footer className="status-bar" role="status">
      {inspectorSide === "left" ? health : leftCluster}
      <div className="status-center" aria-hidden="true" />
      {inspectorSide === "left" ? leftCluster : health}
    </footer>
  );
}

type MobilePanelProps = {
  readonly currentSlideId: string;
  readonly mobilePanel: MobilePanelId;
  readonly onClose: () => void;
  readonly onSelectTopic: (topic: Topic) => void;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
  readonly topic: Topic;
};

function MobilePanel({
  currentSlideId,
  mobilePanel,
  onClose,
  onSelectTopic,
  selectedSlide,
  state,
  topic,
}: MobilePanelProps) {
  return (
    <div
      className={cx("mobile-panel", mobilePanel !== "none" && "open")}
      aria-hidden={mobilePanel === "none"}
    >
      <div className="mobile-panel-sheet">
        <button className="close-button" onClick={onClose} type="button">
          Close
        </button>
        {mobilePanel === "slides" ? (
          <SlideRail
            currentSlideId={currentSlideId}
            leftWidth={240}
            onResize={() => {}}
            open={true}
          />
        ) : (
          <Inspector
            activeTopic={topic}
            onResize={() => {}}
            onTopicButton={onSelectTopic}
            rightWidth={340}
            selectedSlide={selectedSlide}
            state={state}
          />
        )}
      </div>
    </div>
  );
}

function AppProvenanceFooter() {
  return (
    <aside className="provenance-footer" aria-label="Fixture source material">
      <h2>Fixture source material</h2>
      <ul>
        {sourceMaterials.map((material) => (
          <li key={material.path}>
            <code>{material.path}</code>
            <span>{material.role}</span>
          </li>
        ))}
      </ul>
      <h2>Field source classes</h2>
      <ul>
        {provenanceRows.slice(0, 4).map(([field, source, note]) => (
          <li key={field}>
            <code>{field}</code>
            <span>
              {source}: {note}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element for Cadenza UI prototype.");
}

createRoot(root).render(
  <React.StrictMode>
    <App />
    <AppProvenanceFooter />
  </React.StrictMode>,
);
