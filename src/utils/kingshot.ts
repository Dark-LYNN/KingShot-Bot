
/* True gold levels */
export const trueGoldTiers = [
  { min: 35, max: 39, emoji: 'TG1' },
  { min: 40, max: 44, emoji: 'TG2' },
  { min: 45, max: 49, emoji: 'TG3' },
  { min: 50, max: 54, emoji: 'TG4' },
  { min: 55, max: Infinity, emoji: 'TG5' },
];

/**
 * 
 * @param level - TC level (flat)
 * @param client - client instance
 * @returns 
 */
export function getTierEmoji(level: number, client: any):string {
  const tier = trueGoldTiers.find(t => level >= t.min && level <= t.max);
  return tier ? client.emoji(tier.emoji) : '';
}
