
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScaledCalendarClass(scale: 'small' | 'medium' | 'large' = 'medium'): string {
  switch (scale) {
    case 'small':
      return 'scale-90';
    case 'large':
      return 'scale-110';
    case 'medium':
    default:
      return '';
  }
}
