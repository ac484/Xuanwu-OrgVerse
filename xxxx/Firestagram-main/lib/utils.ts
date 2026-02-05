import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts an image URL to a Base64 data URI.
 * Note: This requires the image server to have CORS enabled for the request to succeed.
 * @param url The URL of the image to convert.
 * @returns A promise that resolves with the data URI.
 */
export const toDataURL = (url: string): Promise<string> =>
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      return response.blob();
    })
    .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
    );
