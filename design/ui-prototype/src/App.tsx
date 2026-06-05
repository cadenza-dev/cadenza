import { useCallback, useEffect, useState } from "react";
import { BlockingBanner, DeckSurface } from "./components/Deck";
import { FullscreenView } from "./components/FullscreenView";
import { MobilePanel } from "./components/MobilePanel";
import { InspectorRail, RailPanel, SlideRail } from "./components/Rails";
import { PlaybackToolbar, StatusBar, TopBar } from "./components/ShellChrome";
import type { StateId, Topic } from "./fixture";
import { states } from "./fixture";
import {
  clampIndex,
  getInitialAnchor,
  getInitialTopic,
  initialParam,
  isMobilePanelId,
  isStateId,
  isTheme,
  outlineAt,
} from "./prototype-utils";
import type { MobilePanelId, Theme } from "./types";
import { cn, ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui";

type RailKind = "inspector" | "slides";

const railMinimumSizes = {
  inspector: 20,
  slides: 14,
} as const satisfies Record<RailKind, number>;

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
  const [copiedNotice, setCopiedNotice] = useState("");
  const initialPanel = initialParam("panel", "none");
  const [mobilePanel, setMobilePanel] = useState<MobilePanelId>(
    isMobilePanelId(initialPanel) ? initialPanel : "none",
  );
  const [presenterMode, setPresenterMode] = useState(
    initialParam("presenter", "false") === "true",
  );
  const [railSizes, setRailSizes] =
    useState<Record<RailKind, number>>(railMinimumSizes);

  const selectedSlide = outlineAt(anchorIndex);
  const leftKind = sideSwap ? "inspector" : "slides";
  const rightKind = sideSwap ? "slides" : "inspector";
  const leftOpen = leftKind === "inspector" ? true : slideOpen;
  const rightOpen = rightKind === "inspector" ? true : slideOpen;
  const visibleRailPercent = (kind: RailKind) => {
    if (kind === "slides") return slideOpen ? railSizes.slides : 0;
    return inspectorOpen ? railSizes.inspector : 0;
  };
  const centerDefaultSize = Math.max(
    42,
    100 -
      (leftOpen ? visibleRailPercent(leftKind) : 0) -
      (rightOpen ? visibleRailPercent(rightKind) : 0),
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const goToAnchor = useCallback((index: number) => {
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

  const rememberRailSize = useCallback((kind: RailKind, size: number) => {
    setRailSizes((current) => ({
      ...current,
      [kind]: size,
    }));
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
        anchorIndex={anchorIndex}
        copiedNotice={copiedNotice}
        next={next}
        onCopy={copyText}
        onExit={() => setFullscreen(false)}
        onPresenter={() => {
          setPresenterMode(true);
          setFullscreen(false);
        }}
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
            contentOpen={leftKind === "inspector" ? inspectorOpen : undefined}
            defaultSize={railSizes[leftKind]}
            isOpen={leftOpen}
            kind={leftKind}
            onSizeChange={(size) => rememberRailSize(leftKind, size)}
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
              />
            )}
          </RailPanel>
          {leftOpen && <ResizableHandle label="Resize left rail boundary" />}
          <ResizablePanel
            className="center-panel"
            defaultSize={`${centerDefaultSize}%`}
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
                  presenter={presenterMode}
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
                    defaultSize="88px"
                    maxSize="124px"
                    minSize="88px"
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
          </ResizablePanel>
          {rightOpen && <ResizableHandle label="Resize right rail boundary" />}
          <RailPanel
            contentOpen={rightKind === "inspector" ? inspectorOpen : undefined}
            defaultSize={railSizes[rightKind]}
            isOpen={rightOpen}
            kind={rightKind}
            onSizeChange={(size) => rememberRailSize(rightKind, size)}
          >
            {rightKind === "slides" ? (
              <SlideRail
                currentSlideId={selectedSlide.slideId}
                onSelect={goToAnchor}
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

export default App;
