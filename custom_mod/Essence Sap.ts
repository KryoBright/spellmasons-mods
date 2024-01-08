import { Spell } from '../types/cards/index';

const {
    cardUtils,
    commonTypes,
    cards
} = globalThis.SpellmasonsAPI;
const { refundLastSpell } = cards;
const Unit = globalThis.SpellmasonsAPI.Unit;
const { playDefaultSpellSFX } = cardUtils;
const { CardCategory, probabilityMap, CardRarity } = commonTypes;

const animationPath = 'spellUndeadBlade';

const cardId_custom2 = 'Essence Sap';

export const spell2: Spell = {
  card: {
    id: cardId_custom2,
    category: CardCategory.Damage,
    supportQuantity: true,
    manaCost: 20,
    healthCost: 0,
    expenseScaling: 2,
    probability: probabilityMap[CardRarity.UNCOMMON],
    thumbnail: 'spellmasons-mods/custom_mod/Essence Sap.png',
    animationPath,
    sfx: 'hurt',
    description: [`Deals 20 damage to first target for each target. Overkill carries to the next target`],
    effect: async (state, card, quantity, underworld, prediction) => {
      const targets = state.targetedUnits.filter(u => u.alive);
      let overallDamage = 20 * targets.length * quantity;
      for (let unit2 of targets) {
        let o_h = unit2.health;
        Unit.takeDamage(unit2, Math.min(overallDamage, unit2.health), state.casterUnit, underworld, prediction, state);
        overallDamage = Math.max(0, overallDamage - o_h);
      }
      if (targets.length == 0) {
        refundLastSpell(state, prediction, 'no target, mana refunded');
      }
      if (!prediction) {
        playDefaultSpellSFX(card, prediction);
      }
      if (!prediction && !globalThis.headless) {
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      }
      return state;
    },
  },
};
