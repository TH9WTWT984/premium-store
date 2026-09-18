"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./announcement-slider.module.css";

type TransitionName = "slide" | "fade" | "slide-up" | "slide-down" | "none";

type AnnouncementMessage = { id?: string; text: string; enabled?: boolean };

type AnnouncementConfig = {
  version?: 1;
  intervalMs?: number;
  transition?: TransitionName;
  transitionMs?: number;
  pauseOnHover?: boolean;
  showProgress?: boolean;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  messages: AnnouncementMessage[];
};

type Props = { announcement: string };

const LEGACY_DEFAULT: AnnouncementConfig = {
  messages: [],
  intervalMs: 4200,
  transition: "slide",
  transitionMs: 520,
  pauseOnHover: true,
  showProgress: false,
  backgroundColor: "#171714",
  textColor: "#FFFFFF",
  borderColor: "#171714",
};

function parseAnnouncement(raw: string): AnnouncementConfig {
  if (!raw.trim()) return LEGACY_DEFAULT;
  try {
    const value = JSON.parse(raw) as Partial<AnnouncementConfig>;
    if (Array.isArray(value.messages)) {
      return {
        ...LEGACY_DEFAULT,
        ...value,
        messages: value.messages.filter((m) => typeof m?.text === "string"),
      };
    }
  } catch {
    // Backward compatibility with the original single-string field.
  }
  return {
    ...LEGACY_DEFAULT,
    messages: raw.split(/\||\n+/).map((text) => ({ text: text.trim(), enabled: true })).filter((m) => m.text),
  };
}

function safeHex(value: string | undefined, fallback: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value || "") ? String(value).toUpperCase() : fallback;
}

export default function AnnouncementSlider({ announcement }: Props) {
  const config = useMemo(() => parseAnnouncement(announcement), [announcement]);
  const messages = useMemo(() => config.messages.filter((message) => message.enabled !== false && message.text.trim()), [config.messages]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [previousIndex, setPreviousIndex] = useState(0);

  useEffect(() => {
    if (index >= messages.length) setIndex(0);
  }, [index, messages.length]);

  useEffect(() => {
    if (messages.length <= 1 || paused || config.intervalMs === 0) return;
    const timer = window.setInterval(() => {
      setPreviousIndex(index);
      setIndex((current) => (current + 1) % messages.length);
    }, Math.max(2200, config.intervalMs ?? 4200));
    return () => window.clearInterval(timer);
  }, [config.intervalMs, index, messages.length, paused]);

  if (!messages.length) return null;

  const transition = config.transition ?? "slide";
  const transitionClass = transition === "fade"
    ? styles.fade
    : transition === "slide-up"
      ? styles.slideUp
      : transition === "slide-down"
        ? styles.slideDown
        : transition === "none"
          ? styles.noTransition
          : styles.slide;

  return (
    <div
      className={styles.bar}
      role="region"
      aria-label="Store announcements"
      onMouseEnter={() => config.pauseOnHover !== false && setPaused(true)}
      onMouseLeave={() => config.pauseOnHover !== false && setPaused(false)}
      style={{ ["--announcement-duration" as string]: `${Math.max(180, config.transitionMs ?? 520)}ms`, background: safeHex(config.backgroundColor, "#171714"), color: safeHex(config.textColor, "#FFFFFF"), borderBottomColor: safeHex(config.borderColor, "#171714") }}
    >
      <div className={styles.viewport}>
        <div className={`${styles.track} ${transitionClass}`} key={`${index}-${previousIndex}`}>
          <span className={styles.message}>{messages[index]?.text}</span>
        </div>
      </div>

    </div>
  );
}
