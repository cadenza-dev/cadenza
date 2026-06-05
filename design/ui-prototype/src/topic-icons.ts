import {
  AlertTriangle,
  FileJson,
  Gauge,
  ListTree,
  type LucideIcon,
  Presentation,
  Terminal,
} from "lucide-react";
import type { Topic } from "./fixture";

export const topicIcons: Record<Topic, LucideIcon> = {
  Diagnostics: Terminal,
  Limitations: AlertTriangle,
  Notes: Presentation,
  Outline: ListTree,
  Provenance: FileJson,
  Readiness: Gauge,
};
