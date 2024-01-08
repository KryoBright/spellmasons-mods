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

const cardId_custom3 = 'Shatter Soul';
export const spell3: Spell = {
  card: {
    id: cardId_custom3,
    category: CardCategory.Soul,
    supportQuantity: true,
    manaCost: 50,
    healthCost: 0,
    expenseScaling: 1,
    probability: probabilityMap[CardRarity.UNCOMMON],
    thumbnail: 'spellmasons-mods/custom_mod/Shatter Soul.png',
    animationPath,
    sfx: 'hurt',
    description: [`Affected unit changes faction on taking damage. Can only target resurrected or summoned units`],
    effect: async (state, card, quantity, underworld, prediction) => {
      const targets = state.targetedUnits.filter(u => u.alive).filter(u => !u.originalLife);
      for (let unit2 of targets) {
        Unit.addModifier(unit2, cardId_custom3, underworld, prediction, 1);
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
    add,
  },
  events: {
    onDamage: (unit, amount, prediction, underworld) => {
      if (amount > 0) {
        Unit.changeFaction(unit, 1 - unit.faction);
      }
      return amount;
    }
  }
};
function add(unit, underworld, prediction, quantity, extra) {
  let firstStack = !unit.onDamageEvents.includes(cardId_custom3);
  const modifier = cardsUtil.getOrInitModifier(unit, cardId_custom3, {
    isCurse: true, quantity, persistBetweenLevels: false,
  }, () => {
    if (firstStack) {
      unit.onDamageEvents.push(cardId_custom3);
    }
  });
}
