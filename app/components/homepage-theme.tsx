import type { CSSProperties, ReactNode } from "react";
import styles from "./homepage-theme.module.css";

type FontPreset = "editorial" | "modern" | "classic" | "minimal" | "display";
type ThemeConfig = { version: 1; palette: string[]; background: string; surface: string; text: string; mutedText: string; accent: string; border: string; headingFont: FontPreset; bodyFont: FontPreset; headingColor: string; bodyColor: string };

const defaultTheme: ThemeConfig = { version: 1, palette: ["#171714", "#F7F5F0", "#E4DED5", "#9B8E82", "#A63D2F"], background: "#F7F5F0", surface: "#FFFDF9", text: "#171714", mutedText: "#6F665E", accent: "#A63D2F", border: "#D8D0C7", headingFont: "editorial", bodyFont: "modern", headingColor: "#171714", bodyColor: "#3E3833" };
const fontStacks: Record<FontPreset, string> = { editorial: "Georgia, 'Times New Roman', serif", modern: "Arial, Helvetica, sans-serif", classic: "'Trebuchet MS', Georgia, serif", minimal: "Verdana, Geneva, sans-serif", display: "'Palatino Linotype', Palatino, Georgia, serif" };
const hex = (v: unknown, fallback: string) => typeof v === "string" && /^#[0-9A-Fa-f]{6}$/.test(v) ? v : fallback;

export function parseHomepageTheme(raw?: string): ThemeConfig {
  try {
    const parsed = JSON.parse(raw || "") as Partial<ThemeConfig>;
    return {
      ...defaultTheme, ...parsed,
      background: hex(parsed.background, defaultTheme.background), surface: hex(parsed.surface, defaultTheme.surface), text: hex(parsed.text, defaultTheme.text), mutedText: hex(parsed.mutedText, defaultTheme.mutedText), accent: hex(parsed.accent, defaultTheme.accent), border: hex(parsed.border, defaultTheme.border), headingColor: hex(parsed.headingColor, defaultTheme.headingColor), bodyColor: hex(parsed.bodyColor, defaultTheme.bodyColor),
      palette: Array.isArray(parsed.palette) ? parsed.palette.filter(c => typeof c === "string" && /^#[0-9A-Fa-f]{6}$/.test(c)) : defaultTheme.palette,
      headingFont: parsed.headingFont && parsed.headingFont in fontStacks ? parsed.headingFont : defaultTheme.headingFont,
      bodyFont: parsed.bodyFont && parsed.bodyFont in fontStacks ? parsed.bodyFont : defaultTheme.bodyFont,
    };
  } catch { return defaultTheme; }
}

export default function HomepageTheme({ themeConfig, children }: { themeConfig?: string; children: ReactNode }) {
  const theme = parseHomepageTheme(themeConfig);
  const vars = {
    "--atelier-bg": theme.background, "--atelier-surface": theme.surface, "--atelier-text": theme.text, "--atelier-muted": theme.mutedText, "--atelier-accent": theme.accent, "--atelier-border": theme.border, "--atelier-heading": theme.headingColor, "--atelier-body": theme.bodyColor, "--atelier-heading-font": fontStacks[theme.headingFont], "--atelier-body-font": fontStacks[theme.bodyFont],
  } as CSSProperties;
  return <div className={styles.theme} style={vars}>{children}</div>;
}
