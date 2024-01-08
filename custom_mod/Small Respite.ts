import { Spell } from '../types/cards/index';

const {
    cardUtils,
    commonTypes,
    cards
} = globalThis.SpellmasonsAPI;
const { refundLastSpell } = cards;
const { playDefaultSpellSFX } = cardUtils;
const { CardCategory, probabilityMap, CardRarity } = commonTypes;

const animationPath = 'spellUndeadBlade';

const cardId_custom11 = 'Small Respite';
export const spell11: Spell = {
  card: {
    id: cardId_custom11,
    category: CardCategory.Movement,
    supportQuantity: true,
    manaCost: 10,
    healthCost: 0,
    expenseScaling: 0.5,
    probability: probabilityMap[CardRarity.UNCOMMON],
    thumbnail: 'spellmasons-mods/custom_mod/Small Respite.png',
    animationPath,
    sfx: 'hurt',
    description: [`Target gains 10 stamina. Stackable`],
    effect: async (state, card, quantity, underworld, prediction) => {
      const targets = state.targetedUnits.filter(u => u.alive);
      for (let unit2 of targets) {
        unit2.stamina = unit2.stamina + 10 * quantity;
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
  modifiers: {},
  events: {}
};
