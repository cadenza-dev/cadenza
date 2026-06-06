import type { OutlineEntry, PrototypeState, StateId, Topic } from "./fixture";
import { outline, states, topics } from "./fixture";
import type { MobilePanelId, Theme } from "./types";

export const stateEntries = Object.values(states);
const themeStorageKey = "cadenza.ui-prototype.theme";

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

function initialThemeParam(): Theme | undefined {
  const value = initialParam("theme", "");
  return isTheme(value) ? value : undefined;
}

function storedTheme(): Theme | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const value = window.localStorage.getItem(themeStorageKey);
    return value && isTheme(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function systemTheme(fallback: Theme): Theme {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return fallback;
  }
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return fallback;
}

export function getInitialTheme(): Theme {
  return initialThemeParam() ?? storedTheme() ?? systemTheme("dark");
}

export function persistThemePreference(theme: Theme) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Local storage can be disabled; the DOM theme still applies for the page.
  }
}

export function replaceThemeSearchParam(theme: Theme) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("theme", theme);
  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
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

export function getInitialAnchor() {
  const raw = Number(initialParam("anchor", "0"));
  return Number.isFinite(raw) ? clampIndex(raw) : 0;
}

export function getInitialTopic(state: PrototypeState) {
  const value = initialParam("topic", state.defaultTopic);
  return isTopic(value) ? value : state.defaultTopic;
}
