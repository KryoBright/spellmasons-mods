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

const cardId_custom7 = 'Mana shield';
export const spell7: Spell = {
  card: {
    id: cardId_custom7,
    category: CardCategory.Blessings,
    supportQuantity: true,
    manaCost: 20,
    healthCost: 0,
    expenseScaling: 1,
    probability: probabilityMap[CardRarity.UNCOMMON],
    thumbnail: 'spellmasons-mods/custom_mod/Mana shield.png',
    animationPath,
    sfx: 'hurt',
    description: [`When affected unit takes damage, it's mana is used to protect from it. Each point of damage is consumed by 2 mana`],
    effect: async (state, card, quantity, underworld, prediction) => {
      const targets = state.targetedUnits.filter(u => u.alive);
      for (let unit2 of targets) {
        Unit.addModifier(unit2, cardId_custom7, underworld, prediction, 1);
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
    add: add4,
  },
  events: {
    onDamage: (unit, amount, prediction, underworld) => {
      if (amount > 0) {
        if (amount > unit.mana / 2) {
          unit.mana = 0;
          return Math.floor(amount - unit.mana / 2);
        }
        else {
          unit.mana = unit.mana - amount * 2;
          return 0;
        }
      }
      return amount;
    }
  }
};
function add4(unit, underworld, prediction, quantity, extra) {
  let firstStack = !unit.onDamageEvents.includes(cardId_custom7);
  const modifier = cardsUtil.getOrInitModifier(unit, cardId_custom7, {
    isCurse: false, quantity, persistBetweenLevels: false,
  }, () => {
    if (firstStack) {
      unit.onDamageEvents.push(cardId_custom7);
    }
  });
}
