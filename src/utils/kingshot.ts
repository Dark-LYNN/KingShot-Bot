
/* True gold levels */
const trueGoldTiers = [
  { min: 35, max: 39, emoji: 'tg1' },
  { min: 40, max: 44, emoji: 'tg2' },
  { min: 45, max: 49, emoji: 'tg3' },
  { min: 50, max: 54, emoji: 'tg4' },
  { min: 55, max: Infinity, emoji: 'tg5' },
];

/**
 * 
 * @param level - TC level (flat)
 * @param client - client instance
 * @returns 
 */
function getTierEmoji(level: number, client: any):Promise<string> {
  const tier = trueGoldTiers.find(t => level >= t.min && level <= t.max);
  return tier ? client.emoji(tier.emoji) : '';
}
