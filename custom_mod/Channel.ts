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

const cardId_custom9 = 'Channel';
export const spell9: Spell = {
  card: {
    id: cardId_custom9,
    category: CardCategory.Mana,
    supportQuantity: true,
    manaCost: 10,
    healthCost: 0,
    expenseScaling: 2,
    probability: probabilityMap[CardRarity.UNCOMMON],
    thumbnail: 'spellmasons-mods/custom_mod/Channel.png',
    animationPath,
    sfx: 'hurt',
    description: [`If target's stamina is full, convert each 5 stamina into 1 mana`],
    effect: async (state, card, quantity, underworld, prediction) => {
      const targets = state.targetedUnits.filter(u => u.alive)
        .filter(u => u.stamina >= u.staminaMax).filter(u => u.stamina < Infinity);
      for (let unit2 of targets) {
        unit2.mana = unit2.mana + Math.ceil(unit2.stamina / 5);
        unit2.stamina = 0;
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
