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

const cardId_custom13 = 'Catalyst';
export const spell13: Spell = {
  card: {
    id: cardId_custom13,
    category: CardCategory.Curses,
    supportQuantity: true,
    manaCost: 120,
    healthCost: 0,
    expenseScaling: 0.5,
    probability: probabilityMap[CardRarity.RARE],
    thumbnail: 'spellmasons-mods/custom_mod/Catalyst.png',
    animationPath,
    sfx: 'hurt',
    description: [`Add 1 to quantity of all curses on target. Stackable`],
    effect: async (state, card, quantity, underworld, prediction) => {
      const targets = state.targetedUnits.filter(u => u.alive);
      for (let unit2 of targets) {
        if (unit2.modifiers) {
          for (let m_k in unit2.modifiers) {
            if ((unit2.modifiers[m_k]) && (unit2.modifiers[m_k].isCurse)) {
              unit2.modifiers[m_k].quantity += quantity;
            }
          }
        }
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
