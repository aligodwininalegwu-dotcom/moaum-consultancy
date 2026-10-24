import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Code2,
  Compass,
  Cpu,
  FileSpreadsheet,
  FlaskConical,
  LineChart,
  MonitorSmartphone,
  Palette,
  Presentation,
  Printer,
  Sprout,
  Store,
  Terminal,
  type LucideIcon,
} from "lucide-react";

/** Icons referenced by name from the database or content files. */
const icons: Record<string, LucideIcon> = {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Code2,
  Compass,
  Cpu,
  FileSpreadsheet,
  FlaskConical,
  LineChart,
  MonitorSmartphone,
  Palette,
  Presentation,
  Printer,
  Sprout,
  Store,
  Terminal,
};

export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? BookOpen;
  return <Icon className={className} />;
}
