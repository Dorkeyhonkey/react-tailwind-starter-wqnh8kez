import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a placeholder image based on the name
 * @param name Name to generate a placeholder from
 * @returns URL for a gradient placeholder image
 */
export function getImagePlaceholder(name: string): string {
  // Create a consistent hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use the hash to generate a color palette
  const palette = [
    ["#4f46e5", "#818cf8"], // indigo
    ["#0891b2", "#22d3ee"], // cyan
    ["#0d9488", "#5eead4"], // teal
    ["#4338ca", "#a5b4fc"], // indigo/violet
    ["#7e22ce", "#d8b4fe"], // purple
    ["#be123c", "#fda4af"], // rose
    ["#9333ea", "#d8b4fe"], // purple/fuchsia
    ["#ea580c", "#fed7aa"], // orange
    ["#65a30d", "#bef264"], // lime
  ];

  // Select a palette based on the hash
  const colorIndex = Math.abs(hash) % palette.length;
  const colors = palette[colorIndex];

  // Create a data URL with a gradient
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 400'%3E%3Cdefs%3E%3ClinearGradient id='a' gradientUnits='userSpaceOnUse' x1='0' x2='800' y1='400' y2='0'%3E%3Cstop offset='0' stop-color='${colors[0].replace("#", "%23")}'/%3E%3Cstop offset='1' stop-color='${colors[1].replace("#", "%23")}'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23a)' width='800' height='400'/%3E%3C/svg%3E`;
}
