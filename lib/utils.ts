import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateCaseNumber(): string {
  const prefix = "MBR";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export const STATUS_LABELS: Record<string, string> = {
  intake: "Intake",
  diagnosing: "Diagnosing",
  awaiting_parts: "Awaiting Parts",
  in_repair: "In Repair",
  testing: "Testing",
  ready: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_COLORS: Record<string, string> = {
  intake: "bg-blue-100 text-blue-800",
  diagnosing: "bg-yellow-100 text-yellow-800",
  awaiting_parts: "bg-orange-100 text-orange-800",
  in_repair: "bg-purple-100 text-purple-800",
  testing: "bg-indigo-100 text-indigo-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export const ISSUE_TYPES = [
  "Screen / Display",
  "Battery",
  "Keyboard",
  "Logic Board",
  "Water Damage",
  "Storage / SSD",
  "RAM",
  "Charging Port",
  "Fan / Overheating",
  "Software / OS",
  "Data Recovery",
  "Touch ID / Face ID",
  "Camera",
  "Speaker / Audio",
  "Other",
];

export const MACBOOK_MODELS = [
  "MacBook Air 13\" (M1, 2020)",
  "MacBook Air 13\" (M2, 2022)",
  "MacBook Air 13\" (M3, 2024)",
  "MacBook Air 15\" (M2, 2023)",
  "MacBook Air 15\" (M3, 2024)",
  "MacBook Pro 13\" (M1, 2020)",
  "MacBook Pro 13\" (M2, 2022)",
  "MacBook Pro 14\" (M1 Pro/Max, 2021)",
  "MacBook Pro 14\" (M2 Pro/Max, 2023)",
  "MacBook Pro 14\" (M3 Pro/Max, 2023)",
  "MacBook Pro 14\" (M4 Pro/Max, 2024)",
  "MacBook Pro 16\" (M1 Pro/Max, 2021)",
  "MacBook Pro 16\" (M2 Pro/Max, 2023)",
  "MacBook Pro 16\" (M3 Pro/Max, 2023)",
  "MacBook Pro 16\" (M4 Pro/Max, 2024)",
  "MacBook Air (Intel, 2019-2020)",
  "MacBook Pro (Intel, 2019-2020)",
  "Other",
];
