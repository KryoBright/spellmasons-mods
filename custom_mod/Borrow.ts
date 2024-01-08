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
const cardId_custom4 = 'Borrow';
export const spell4: Spell = {
  card: {
    id: cardId_custom4,
    category: CardCategory.Blessings,
    supportQuantity: true,
    manaCost: 10,
    healthCost: 0,
    expenseScaling: 0.5,
    probability: probabilityMap[CardRarity.COMMON],
    thumbnail: 'spellmasons-mods/custom_mod/Borrow.png',
    animationPath,
    sfx: 'hurt',
    description: [`Borrows 10% of targets health and mana from next turn to this (with 100% interest!). This spell has no effect, if it will consume more than 80% of targets curent hp next turn`],
    effect: async (state, card, quantity, underworld, prediction) => {
      const targets = state.targetedUnits.filter(u => u.alive);
      for (let unit2 of targets) {
        let sub_amount = 0;
        if (unit2.modifiers[cardId_custom4]) {
          if (unit2.modifiers[cardId_custom4].quantity > 0) {
            sub_amount = unit2.modifiers[cardId_custom4].quantity;
          }
        }
        let q1 = quantity;
        q1 = Math.min(Math.floor(((unit2.health * 0.4) / unit2.healthMax) / 0.1), q1);
        Unit.addModifier(unit2, cardId_custom4, underworld, prediction, Math.min(10, Math.max(q1 - sub_amount, 0)));
        unit2.mana = Math.floor(Math.min(unit2.manaMax, unit2.mana + unit2.manaMax * 0.1 * q1));
        Unit.takeDamage(unit2, -Math.floor(q1 * 0.2 * unit2.healthMax), void 0, underworld, prediction);
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
    add: add2,
  },
  events: {
    onTurnStart: async (unit, prediction, underworld) => {
      if (unit.modifiers[cardId_custom4]) {
        if (unit.modifiers[cardId_custom4].quantity > 0) {
          unit.mana = Math.floor(Math.max(0, unit.mana - unit.manaMax * 0.2 * unit.modifiers[cardId_custom4].quantity));
          Unit.takeDamage(unit, Math.floor(unit.modifiers[cardId_custom4].quantity * 0.2 * unit.healthMax), void 0, underworld, prediction);
          Unit.removeModifier(unit, cardId_custom4, underworld);
        }
      }
      return false;
    }
  }
};
function add2(unit, underworld, prediction, quantity, extra) {
  let firstStack = !unit.onTurnStartEvents.includes(cardId_custom4);
  const modifier = cardsUtil.getOrInitModifier(unit, cardId_custom4, {
    isCurse: false, quantity, persistBetweenLevels: false,
  }, () => {
    if (firstStack) {
      unit.onTurnStartEvents.push(cardId_custom4);
    }
  });
}
