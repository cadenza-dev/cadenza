import { X } from "lucide-react";
import type { OutlineEntry, PrototypeState, Topic } from "../fixture";
import { topics } from "../fixture";
import { topicIcons } from "../topic-icons";
import type { CopyText, MobilePanelId } from "../types";
import { IconButton } from "../ui";
import { InspectorContent, SlideRail } from "./Rails";

type MobilePanelProps = {
  readonly copyText: CopyText;
  readonly currentSlideId: string;
  readonly mobilePanel: MobilePanelId;
  readonly onAnchor: (index: number) => void;
  readonly onClose: () => void;
  readonly onSelectTopic: (topic: Topic) => void;
  readonly selectedSlide: OutlineEntry;
  readonly state: PrototypeState;
  readonly topic: Topic;
};

export function MobilePanel({
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
              mode="mobile"
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
