"use client";

import { useEffect, useMemo, useState } from "react";
import type { AppSettings, DailySchedule } from "@/lib/domain";
import { getReminderCandidates } from "@/lib/schedule/reminders";

export function NotificationRuntime({
  schedule,
  settings
}: {
  schedule: DailySchedule;
  settings: AppSettings;
}) {
  const [permission, setPermission] = useState<NotificationPermission | "missing">(
    "missing"
  );
  const reminders = useMemo(
    () =>
      getReminderCandidates(schedule, settings.reminderBeforeMinutes).map(
        ({ item, ...candidate }) => ({
          ...candidate,
          item: {
            id: item.id,
            type: item.type,
            title: item.title
          }
        })
      ),
    [schedule, settings.reminderBeforeMinutes]
  );

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("missing");
      return;
    }
    setPermission(Notification.permission);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!settings.browserNotificationsEnabled || permission !== "granted") {
      return;
    }

    const storageKey = `routine-os-reminders:${schedule.date}`;
    const getSent = () =>
      new Set<string>(
        JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as string[]
      );
    const setSent = (sent: Set<string>) =>
      window.localStorage.setItem(storageKey, JSON.stringify([...sent]));

    const tick = () => {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      if (withinQuietHours(minutes, settings.quietHoursStart, settings.quietHoursEnd)) {
        return;
      }
      const sent = getSent();
      for (const reminder of reminders) {
        const due =
          minutes >= reminder.fireAtMinutes && minutes <= reminder.fireAtMinutes + 1;
        if (!due || sent.has(reminder.key)) continue;
        new Notification(reminder.title, {
          body: reminder.body,
          tag: reminder.key
        });
        sent.add(reminder.key);
      }
      setSent(sent);
    };

    tick();
    const interval = window.setInterval(tick, 30_000);
    return () => window.clearInterval(interval);
  }, [permission, reminders, schedule.date, settings]);

  return null;
}

export function NotificationPermissionButton() {
  const [permission, setPermission] = useState<NotificationPermission | "missing">(
    "missing"
  );

  useEffect(() => {
    setPermission("Notification" in window ? Notification.permission : "missing");
  }, []);

  if (permission === "missing") {
    return <p className="text-sm text-muted">Browser notifications are unavailable.</p>;
  }

  return (
    <button
      type="button"
      onClick={async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
      }}
      className="focus-ring inline-flex min-h-10 items-center rounded-md border border-line bg-white px-3 text-sm font-semibold hover:border-accent/50"
    >
      {permission === "granted" ? "Notifications allowed" : "Allow notifications"}
    </button>
  );
}

function withinQuietHours(
  minutes: number,
  start: string | null,
  end: string | null
) {
  const startMinutes = parseTime(start);
  const endMinutes = parseTime(end);
  if (startMinutes === null || endMinutes === null || startMinutes === endMinutes) {
    return false;
  }
  if (startMinutes < endMinutes) {
    return minutes >= startMinutes && minutes < endMinutes;
  }
  return minutes >= startMinutes || minutes < endMinutes;
}

function parseTime(value: string | null) {
  if (!value) return null;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}
