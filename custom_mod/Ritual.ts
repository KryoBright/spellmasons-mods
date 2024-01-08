import { Spell } from '../types/cards/index';

const {
    cardUtils,
    cardsUtil,
    commonTypes,
    cards
} = globalThis.SpellmasonsAPI;
const { refundLastSpell } = cards;
const Unit = globalThis.SpellmasonsAPI.Unit;
const { playDefaultSpellSFX } = cardUtils;
const { CardCategory, probabilityMap, CardRarity } = commonTypes;

const animationPath = 'spellUndeadBlade';

const cardId_custom8 = 'Ritual';
export const spell8: Spell = {
  card: {
    id: cardId_custom8,
    category: CardCategory.Mana,
    supportQuantity: true,
    manaCost: 40,
    healthCost: 0,
    expenseScaling: 2,
    probability: probabilityMap[CardRarity.RARE],
    thumbnail: 'spellmasons-mods/custom_mod/Ritual.png',
    animationPath,
    sfx: 'hurt',
    description: [`Apply 1 Ritual. If unit already has 6 Ritual, cleanse it and fully restore that unit's mana`],
    effect: async (state, card, quantity, underworld, prediction) => {
      const targets = state.targetedUnits.filter(u => u.alive);
      for (let unit2 of targets) {
        Unit.addModifier(unit2, cardId_custom8, underworld, prediction, quantity);
        if (unit2.modifiers[cardId_custom8]) {
          if (unit2.modifiers[cardId_custom8].quantity >= 6) {
            Unit.removeModifier(unit2, cardId_custom8, underworld);
            unit2.mana = Math.max(unit2.manaMax, unit2.mana);
            if (unit2 == state.casterUnit) {
              refundLastSpell(state, prediction, 'Ritual mana restored');
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
  modifiers: {
    add: add5,
  },
  events: {
    onDamage: (unit, amount, prediction, underworld) => {
      return amount;
    }
  }
};
function add5(unit, underworld, prediction, quantity, extra) {
  let firstStack = !unit.onDamageEvents.includes(cardId_custom8);
  const modifier = cardsUtil.getOrInitModifier(unit, cardId_custom8, {
    isCurse: false, quantity, persistBetweenLevels: false,
  }, () => {
    if (firstStack) {
      unit.onDamageEvents.push(cardId_custom8);
    }
  });
}
