import type { OutlineEntry, PrototypeState, StateId, Topic } from "./fixture";
import { outline, states, topics } from "./fixture";
import type { MobilePanelId, Theme } from "./types";

export const stateEntries = Object.values(states);

export function initialParam(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return new URLSearchParams(window.location.search).get(name) ?? fallback;
}

export function isStateId(value: string): value is StateId {
  return Object.hasOwn(states, value);
}

export function isTopic(value: string): value is Topic {
  return topics.includes(value as Topic);
}

export function isTheme(value: string): value is Theme {
  return value === "dark" || value === "light";
}

export function isMobilePanelId(value: string): value is MobilePanelId {
  return value === "inspector" || value === "none" || value === "slides";
}

export function clampIndex(value: number) {
  return Math.max(0, Math.min(value, outline.length - 1));
}

export function outlineAt(index: number): OutlineEntry {
  return outline[clampIndex(index)] ?? outline[0];
}

export function getInitialAnchor(stateId: StateId) {
  const raw = Number(
    initialParam("anchor", String(states[stateId].selectedIndex)),
  );
  return Number.isFinite(raw) ? clampIndex(raw) : states[stateId].selectedIndex;
}

export function getInitialTopic(state: PrototypeState) {
  const value = initialParam("topic", state.defaultTopic);
  return isTopic(value) ? value : state.defaultTopic;
}
