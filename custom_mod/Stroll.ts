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

const cardId_custom6 = 'Stroll';
export const spell6: Spell = {
  card: {
    id: cardId_custom6,
    category: CardCategory.Curses,
    supportQuantity: true,
    manaCost: 10,
    healthCost: 0,
    expenseScaling: 0.5,
    probability: probabilityMap[CardRarity.UNCOMMON],
    thumbnail: 'spellmasons-mods/custom_mod/Stroll.png',
    animationPath,
    sfx: 'hurt',
    description: [`Curses target unit to be walk at random direction at the end of turn for one turn. Stacking increases strength and number of nodes in path. WARNING: Will be slow on big number of units`],
    effect: async (state, card, quantity, underworld, prediction) => {
      const targets = state.targetedUnits.filter(u => u.alive);
      for (let unit2 of targets) {
        Unit.addModifier(unit2, cardId_custom6, underworld, prediction, quantity);
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
    add: add3,
  },
  events: {
    onTurnEnd: async (unit, prediction, underworld) => {
      if (unit.modifiers[cardId_custom6]) {
        if (unit.modifiers[cardId_custom6].quantity > 0) {
          unit.stamina = unit.staminaMax;
          let quan = unit.modifiers[cardId_custom6].quantity;
          let node_id = 42;
          while ((quan > 0) && (unit.stamina > 1)) {
            node_id = (node_id * node_id * underworld.turn_number - node_id) % 521;
            let diff_x = ((underworld.turn_number * 31 + quan * 19 + unit.id * 29 + node_id * 97) % 17 + 20);
            if ((underworld.turn_number * 31 + quan * 23 + unit.id * 47 + node_id * 97) % 2 == 1) {
              diff_x = -diff_x;
            }
            node_id = (node_id * node_id * underworld.turn_number - node_id) % 521;
            let diff_y = ((underworld.turn_number * 23 + quan * 59 + unit.id * 47 + node_id * 97) % 17 + 20);
            if ((underworld.turn_number * 17 + quan * 29 + unit.id * 59 + node_id * 103) % 2 == 1) {
              diff_y = -diff_y;
            }
            await Unit.moveTowards(unit, { x: unit.x + diff_x, y: unit.y + diff_y }, underworld);
            quan--;
            node_id = (node_id * node_id * underworld.turn_number - node_id) % 521;
          }
          unit.modifiers[cardId_custom6].quantity--;
          if (unit.modifiers[cardId_custom6].quantity <= 0) {
            Unit.removeModifier(unit, cardId_custom6, underworld);
          }
        }
      }
    }
  }
};
function add3(unit, underworld, prediction, quantity, extra) {
  let firstStack = !unit.onTurnStartEvents.includes(cardId_custom6);
  const modifier = cardsUtil.getOrInitModifier(unit, cardId_custom6, {
    isCurse: true, quantity, persistBetweenLevels: false,
  }, () => {
    if (firstStack) {
      unit.onTurnEndEvents.push(cardId_custom6);
    }
  });
}
