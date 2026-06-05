import type { Topic } from "./fixture";

export type Theme = "dark" | "light";
export type MobilePanelId = "inspector" | "none" | "slides";
export type InspectorSide = "left" | "right";

export type MenuPosition = {
  readonly left: number;
  readonly top: number;
};

export type CopyText = (text: string, label: string) => void;

export type TopicSetter = (topic: Topic) => void;
