/**
 * Format number with commas for display
 * E.g., 1000 -> "1,000", 600000 -> "600,000"
 */
export function formatNumberWithCommas(value: string): string {
  // Remove all non-digit characters
  const numbers = value.replace(/[^\d]/g, '');
  
  if (!numbers) return '';
  
  // Add commas
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Remove commas and convert to number
 * E.g., "1,000" -> 1000, "600,000" -> 600000
 */
export function parseNumberWithCommas(value: string): number {
  const cleaned = value.replace(/,/g, '');
  return Number(cleaned) || 0;
}
