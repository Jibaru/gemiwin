import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isMarkdown(text: string): boolean {
  const markdownPatterns = [
    /^#+\s/m,
    /^\s*[-*+]\s/m,
    /^\s*>\s/m,
    /`{1,3}/,
    /\[.*\]\(.*\)/,
    /\*{1,2}/,
    /~{2}/,
  ];

  return markdownPatterns.some(pattern => pattern.test(text));
} 