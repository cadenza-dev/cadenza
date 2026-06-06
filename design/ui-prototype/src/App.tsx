import type { PointerEvent, WheelEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { BlockingBanner, DeckSurface } from "./components/Deck";
import { FullscreenView } from "./components/FullscreenView";
import { MobilePanel } from "./components/MobilePanel";
import {
  defaultPresenterLayout,
  type PresenterLayout,
  PresenterView,
} from "./components/PresenterView";
import { InspectorRail, RailPanel, SlideRail } from "./components/Rails";
import { PlaybackToolbar, StatusBar, TopBar } from "./components/ShellChrome";
import type { StateId, Topic } from "./fixture";
import { states } from "./fixture";
import {
  clampIndex,
  getInitialAnchor,
  getInitialTheme,
  getInitialTopic,
  initialParam,
  isMobilePanelId,
  isStateId,
  outlineAt,
  persistThemePreference,
  replaceThemeSearchParam,
} from "./prototype-utils";
import type { MobilePanelId, Theme } from "./types";
import { cn, ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui";

type RailKind = "inspector" | "slides";
type RailSide = "left" | "right";

const inspectorCollapsedWidth = 42;

const railSizeBounds = {
  inspector: { defaultRatio: 0.21, max: 680, min: 300 },
  slides: { defaultRatio: 0.16, max: 520, min: 240 },
} as const satisfies Record<
  RailKind,
  { readonly defaultRatio: number; readonly max: number; readonly min: number }
>;

function clampRailSize(kind: RailKind, size: number, availableMax?: number) {
  const bounds = railSizeBounds[kind];
  const max = Math.max(
    bounds.min,
    Math.min(bounds.max, availableMax ?? bounds.max),
  );
  return Math.round(Math.min(Math.max(size, bounds.min), max));
}

function createInitialRailSizes(): Record<RailKind, number> {
  const viewportWidth =
    typeof window === "undefined" ? 1440 : window.innerWidth;
  return {
    inspector: clampRailSize(
      "inspector",
      viewportWidth * railSizeBounds.inspector.defaultRatio,
    ),
    slides: clampRailSize(
      "slides",
      viewportWidth * railSizeBounds.slides.defaultRatio,
    ),
  };
}

function App() {
  const initialState = initialParam("state", "ready");
  const initialStateId: StateId = isStateId(initialState)
    ? initialState
    : "ready";
  const [scenarioId, setScenarioId] = useState<StateId>(initialStateId);
  const selectedState = states[scenarioId];
  const [anchorIndex, setAnchorIndex] = useState(getInitialAnchor);
  const [topic, setTopic] = useState<Topic>(() =>
    getInitialTopic(selectedState),
  );
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
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
  const [copiedNotice, setCopiedNotice] = useState("");
  const initialPanel = initialParam("panel", "none");
  const [mobilePanel, setMobilePanel] = useState<MobilePanelId>(
    isMobilePanelId(initialPanel) ? initialPanel : "none",
  );
  const [presenterMode, setPresenterMode] = useState(
    initialParam("presenter", "false") === "true",
  );
  const [presenterLayout, setPresenterLayout] = useState<PresenterLayout>(
    defaultPresenterLayout,
  );
  const [actionControlsHeight, setActionControlsHeight] = useState(
    defaultPresenterLayout.controlsHeight,
  );
  const [railSizes, setRailSizes] = useState(createInitialRailSizes);
  const [activeRailResize, setActiveRailResize] = useState<RailSide | null>(
    null,
  );

  const selectedSlide = outlineAt(anchorIndex);
  const leftKind = sideSwap ? "inspector" : "slides";
  const rightKind = sideSwap ? "slides" : "inspector";
  const leftOpen = leftKind === "inspector" ? true : slideOpen;
  const rightOpen = rightKind === "inspector" ? true : slideOpen;
  const railIsResizable = (kind: RailKind) =>
    kind === "inspector" ? inspectorOpen : slideOpen;
  const railRenderWidth = useCallback(
    (kind: RailKind) =>
      kind === "inspector" && !inspectorOpen
        ? inspectorCollapsedWidth
        : railSizes[kind],
    [inspectorOpen, railSizes],
  );
  const leftResizable = leftOpen && railIsResizable(leftKind);
  const rightResizable = rightOpen && railIsResizable(rightKind);
  const leftHandleVisible = leftOpen;
  const rightHandleVisible = rightOpen;
  const layoutColumns = [
    leftOpen ? `${railRenderWidth(leftKind)}px` : null,
    leftHandleVisible ? "10px" : null,
    "minmax(0, 1fr)",
    rightHandleVisible ? "10px" : null,
    rightOpen ? `${railRenderWidth(rightKind)}px` : null,
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    persistThemePreference(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((value) => {
      const nextTheme = value === "dark" ? "light" : "dark";
      persistThemePreference(nextTheme);
      replaceThemeSearchParam(nextTheme);
      return nextTheme;
    });
  }, []);

  const goToAnchor = useCallback((index: number) => {
    setAnchorIndex(clampIndex(index));
  }, []);

  const previous = useCallback(() => {
    goToAnchor(anchorIndex - 1);
  }, [anchorIndex, goToAnchor]);

  const next = useCallback(() => {
    goToAnchor(anchorIndex + 1);
  }, [anchorIndex, goToAnchor]);

  const wheelAnchor = useCallback((event: WheelEvent<HTMLElement>) => {
    if (
      Math.abs(event.deltaY) < 12 ||
      Math.abs(event.deltaY) < Math.abs(event.deltaX)
    ) {
      return;
    }

    event.preventDefault();
    setAnchorIndex((current) =>
      clampIndex(current + (event.deltaY > 0 ? 1 : -1)),
    );
  }, []);

  const switchScenario = useCallback((nextState: StateId) => {
    setScenarioId(nextState);
    setTopic(states[nextState].defaultTopic);
    setAnchorIndex(states[nextState].selectedIndex);
  }, []);

  const startRailResize = useCallback(
    (
      kind: RailKind,
      side: RailSide,
      event: PointerEvent<HTMLButtonElement>,
    ) => {
      event.preventDefault();
      const startX = event.clientX;
      const startSize = railSizes[kind];
      const otherKind = kind === leftKind ? rightKind : leftKind;
      const otherMounted = otherKind === "inspector" ? true : slideOpen;
      const otherWidth = otherMounted ? railRenderWidth(otherKind) : 0;
      const availableMax =
        window.innerWidth - otherWidth - inspectorCollapsedWidth - 620;
      const direction = side === "left" ? 1 : -1;

      setActiveRailResize(side);

      const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
        const nextSize = clampRailSize(
          kind,
          startSize + (moveEvent.clientX - startX) * direction,
          availableMax,
        );
        setRailSizes((current) => ({ ...current, [kind]: nextSize }));
      };

      const stopResize = () => {
        setActiveRailResize(null);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", stopResize);
        window.removeEventListener("pointercancel", stopResize);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", stopResize);
      window.addEventListener("pointercancel", stopResize);
    },
    [leftKind, railRenderWidth, railSizes, rightKind, slideOpen],
  );

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

  const openPresenterView = useCallback(() => {
    setPresenterLayout((current) => ({
      ...current,
      controlsHeight: actionControlsHeight,
    }));
    setPresenterMode(true);
    setFullscreen(true);
  }, [actionControlsHeight]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      }
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        if (presenterMode) {
          setPresenterMode(false);
          setFullscreen(false);
        } else {
          setFullscreen((value) => !value);
        }
      }
      if (event.key === "Escape") {
        setFullscreen(false);
        setPresenterMode(false);
        setMobilePanel("none");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, presenterMode, previous]);

  if (presenterMode) {
    return (
      <PresenterView
        anchorIndex={anchorIndex}
        copiedNotice={copiedNotice}
        layout={presenterLayout}
        next={next}
        onCopy={copyText}
        onExit={() => {
          setPresenterMode(false);
          setFullscreen(false);
        }}
        onHidePresenter={() => {
          setPresenterMode(false);
          setFullscreen(true);
        }}
        onLayoutChange={setPresenterLayout}
        previous={previous}
        selectedSlide={selectedSlide}
        state={selectedState}
      />
    );
  }

  if (fullscreen) {
    return (
      <FullscreenView
        anchorIndex={anchorIndex}
        copiedNotice={copiedNotice}
        next={next}
        onCopy={copyText}
        onExit={() => setFullscreen(false)}
        onPresenter={openPresenterView}
        previous={previous}
        selectedSlide={selectedSlide}
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
        onTheme={toggleTheme}
        scenarioId={scenarioId}
        setBottomOpen={setBottomOpen}
        setInspectorOpen={setInspectorOpen}
        setSlideOpen={setSlideOpen}
        sideSwap={sideSwap}
        slideOpen={slideOpen}
        theme={theme}
      />

      <main
        className="layout-frame"
        aria-label="Cadenza Player App prototype"
        style={{ gridTemplateColumns: layoutColumns }}
      >
        <RailPanel
          contentOpen={leftKind === "inspector" ? inspectorOpen : undefined}
          isOpen={leftOpen}
          kind={leftKind}
          width={railRenderWidth(leftKind)}
        >
          {leftKind === "inspector" ? (
            <InspectorRail
              activeTopic={topic}
              copyText={copyText}
              onAnchor={goToAnchor}
              onOpenChange={setInspectorOpen}
              onTopic={setTopic}
              open={inspectorOpen}
              side="left"
              selectedSlide={selectedSlide}
              state={selectedState}
            />
          ) : (
            <SlideRail
              currentSlideId={selectedSlide.slideId}
              onSelect={goToAnchor}
              state={selectedState}
            />
          )}
        </RailPanel>
        {leftHandleVisible && (
          <RailResizeHandle
            active={activeRailResize === "left"}
            label="Resize left rail boundary"
            onPointerDown={(event) => startRailResize(leftKind, "left", event)}
            resizable={leftResizable}
          />
        )}
        <section className="center-panel" aria-label="Deck and controls">
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
                onWheel={wheelAnchor}
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
                  defaultSize={`${defaultPresenterLayout.controlsHeight}px`}
                  maxSize="124px"
                  minSize="88px"
                  onWheel={wheelAnchor}
                  onResize={(panelSize) =>
                    setActionControlsHeight(Math.round(panelSize.inPixels))
                  }
                >
                  <PlaybackToolbar
                    anchorIndex={anchorIndex}
                    next={next}
                    onFullscreen={() => setFullscreen(true)}
                    previous={previous}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </section>
        {rightHandleVisible && (
          <RailResizeHandle
            active={activeRailResize === "right"}
            label="Resize right rail boundary"
            onPointerDown={(event) =>
              startRailResize(rightKind, "right", event)
            }
            resizable={rightResizable}
          />
        )}
        <RailPanel
          contentOpen={rightKind === "inspector" ? inspectorOpen : undefined}
          isOpen={rightOpen}
          kind={rightKind}
          width={railRenderWidth(rightKind)}
        >
          {rightKind === "slides" ? (
            <SlideRail
              currentSlideId={selectedSlide.slideId}
              onSelect={goToAnchor}
              state={selectedState}
            />
          ) : (
            <InspectorRail
              activeTopic={topic}
              copyText={copyText}
              onAnchor={goToAnchor}
              onOpenChange={setInspectorOpen}
              onTopic={setTopic}
              open={inspectorOpen}
              side="right"
              selectedSlide={selectedSlide}
              state={selectedState}
            />
          )}
        </RailPanel>
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
          onWheel={wheelAnchor}
          selectedSlide={selectedSlide}
          state={selectedState}
        />
        <PlaybackToolbar
          anchorIndex={anchorIndex}
          next={next}
          onFullscreen={() => setFullscreen(true)}
          previous={previous}
        />
      </main>

      <StatusBar
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

type RailResizeHandleProps = {
  readonly active: boolean;
  readonly label: string;
  readonly onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  readonly resizable: boolean;
};

function RailResizeHandle({
  active,
  label,
  onPointerDown,
  resizable,
}: RailResizeHandleProps) {
  return (
    <button
      aria-label={label}
      className="resize-handle rail-resize-handle"
      data-resize-handle-active={active ? "" : undefined}
      disabled={!resizable}
      onPointerDown={onPointerDown}
      type="button"
    >
      <span />
    </button>
  );
}

export default App;
