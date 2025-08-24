export function formatNumber(num: number | string): string {
  const n = typeof num === "string" ? parseFloat(num.replace(/[^0-9.-]+/g, "")) : num;
  if (isNaN(n)) return String(num);

  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(3) + "B";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(3) + "M";
  if (n >= 1_000)         return (n / 1_000).toFixed(3) + "K";

  return n.toString();
}

export function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
