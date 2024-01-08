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

const cardId_custom5 = 'Equalize';
export const spell5: Spell = {
  card: {
    id: cardId_custom5,
    category: CardCategory.Soul,
    supportQuantity: true,
    manaCost: 20,
    healthCost: 0,
    expenseScaling: 1,
    probability: probabilityMap[CardRarity.RARE],
    thumbnail: 'spellmasons-mods/custom_mod/Equalize.png',
    animationPath,
    sfx: 'hurt',
    description: [`Sets health of all targets to average (rounded down, does not give overheal)`],
    effect: async (state, card, quantity, underworld, prediction) => {
      const targets = state.targetedUnits.filter(u => u.alive);
      let overallHealth = 0;
      for (let unit2 of targets) {
        overallHealth += unit2.health;
      }
      if (targets.length == 0) {
        refundLastSpell(state, prediction, 'no target, mana refunded');
      }
      else {
        let goalHealth = Math.floor(overallHealth / targets.length);
        for (let unit2 of targets) {
          unit2.health = Math.min(unit2.healthMax, goalHealth);
        }
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
