"use client";

const SUPPORT_STORAGE_KEY = "hometech.support.messages.v1";
const FEEDBACK_STORAGE_KEY = "hometech.feedback.entries.v1";

export function createLocalId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readList(key) {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]");
  } catch (_error) {
    return [];
  }
}

function writeList(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function listSupportMessages(userId) {
  return readList(SUPPORT_STORAGE_KEY).filter((item) => item.userId === userId);
}

export function saveSupportMessage(entry) {
  const next = [entry, ...readList(SUPPORT_STORAGE_KEY)];
  writeList(SUPPORT_STORAGE_KEY, next);
  return next;
}

export function saveFeedbackEntry(entry) {
  const next = [entry, ...readList(FEEDBACK_STORAGE_KEY)];
  writeList(FEEDBACK_STORAGE_KEY, next);
  return next;
}
