export interface HeroSkill {
  name: string;
  description: string;
  upgrades: number[];
  image: string;
}

export interface HeroMode {
  [stat: string]: number | string | HeroSkill[] | undefined;
  Attack: number | string;
  Defense: number | string;
  Health?: number | string;
  skills: HeroSkill[];
}

export interface gearMode {
  HeroPower: number;
  HeroAttack: number;
  HeroDefense: number;
  HeroHealth: number;
  EscortAttack: number;
  EscortDefense: number;
  EscortHealth: number;
  TroopLethality: string;
  TroopHealth: string;
  skills: HeroSkill[];
};

export interface Hero {
  name: string;
  class: string;
  type: "SSR" | "SR" | "R";
  description: string;
  generation: number;
  image: string;
  sources: string[];
  skills: {
    gear?: gearMode;
    conquest: HeroMode;
    expedition: HeroMode;
  };
}

export type HeroEntry = Record<string, Hero>;  // { "jaeger": Hero }
export type HeroesFile = HeroEntry[];          // [ { "jaeger": Hero }, { "helga": Hero } ]
